import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import Docker from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD as string,
    maxRetriesPerRequest: null,
});

const docker = new Docker();
const RUNTIME_IMAGE = 'codevamp-runner:latest';
const EXECUTION_TIMEOUT_MS = 5000;
const MEMORY_LIMIT = 128 * 1024 * 1024; // 128MB

interface ExecutionJob {
    code: string;
    language: string;
    testCases: { input: string; expectedOutput: string }[];
}

interface LanguageConfig {
    extension: string;
    sourceFile: string;
    compileCmd: string | null;
    runCmd: string;
    mainCheck: RegExp | null; // Regex to verify main() exists
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
    python: {
        extension: 'py',
        sourceFile: 'solution.py',
        compileCmd: null,
        runCmd: 'python3 solution.py',
        mainCheck: /if\s+__name__\s*==\s*["']__main__["']/,
    },
    cpp: {
        extension: 'cpp',
        sourceFile: 'solution.cpp',
        compileCmd: 'g++ -O2 -std=c++17 -o solution solution.cpp',
        runCmd: './solution',
        mainCheck: /int\s+main\s*\(/,
    },
    c: {
        extension: 'c',
        sourceFile: 'solution.c',
        compileCmd: 'gcc -O2 -o solution solution.c',
        runCmd: './solution',
        mainCheck: /int\s+main\s*\(/,
    },
    java: {
        extension: 'java',
        sourceFile: 'Main.java',
        compileCmd: 'javac Main.java',
        runCmd: 'java Main',
        mainCheck: /public\s+static\s+void\s+main\s*\(/,
    },
    go: {
        extension: 'go',
        sourceFile: 'main.go',
        compileCmd: null, // go run handles it
        runCmd: 'go run main.go',
        mainCheck: /func\s+main\s*\(\s*\)/,
    },
    javascript: {
        extension: 'js',
        sourceFile: 'solution.js',
        compileCmd: null,
        runCmd: 'node solution.js',
        mainCheck: null, // JS doesn't require explicit main
    },
};

/**
 * Parses Docker multiplexed stream to extract stdout and stderr.
 */
function parseDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
    let stdout = '';
    let stderr = '';
    let offset = 0;

    while (offset < buffer.length) {
        if (offset + 8 > buffer.length) break;
        const streamType = buffer.readUInt8(offset);
        const size = buffer.readUInt32BE(offset + 4);
        if (offset + 8 + size > buffer.length) break;
        const content = buffer.slice(offset + 8, offset + 8 + size).toString('utf-8');
        if (streamType === 1) stdout += content;
        else if (streamType === 2) stderr += content;
        offset += 8 + size;
    }

    return { stdout, stderr };
}

/**
 * Validates that the submitted code contains a main entry point.
 */
function validateMainExists(code: string, config: LanguageConfig): { valid: boolean; error?: string } {
    if (!config.mainCheck) return { valid: true };
    if (!config.mainCheck.test(code)) {
        return {
            valid: false,
            error: `Compilation Error: Your submission must be a complete program with a main() entry point. This platform uses the PROGRAM execution model (like Codeforces). Please include:\n\n- Python: if __name__ == "__main__":\n- C++/C: int main()\n- Java: public static void main(String[] args)\n- Go: func main()\n\nUse the boilerplate provided for guidance.`,
        };
    }
    return { valid: true };
}

const worker = new Worker(
    'code-execution',
    async (job: Job<ExecutionJob>) => {
        const { code, language, testCases } = job.data;

        // 1. Validate language
        const config = LANGUAGE_CONFIGS[language];
        if (!config) {
            return { results: [{ passed: false, error: `Unsupported language: ${language}` }] };
        }

        // 2. Validate main() exists (Program-Based Model enforcement)
        const mainValidation = validateMainExists(code, config);
        if (!mainValidation.valid) {
            return { results: [{ passed: false, error: mainValidation.error, stderr: mainValidation.error }] };
        }

        // 3. Setup execution environment
        const executionId = uuidv4();
        const tempDir = path.join(__dirname, `../temp/${executionId}`);
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(path.join(tempDir, config.sourceFile), code);

        const results: any[] = [];

        // 4. Compile once (if needed)
        if (config.compileCmd) {
            try {
                const compileContainer = await docker.createContainer({
                    Image: RUNTIME_IMAGE,
                    Cmd: ['/bin/bash', '-c', config.compileCmd],
                    WorkingDir: '/home/runner',
                    Tty: false,
                    HostConfig: {
                        Binds: [`${tempDir}:/home/runner`],
                        Memory: MEMORY_LIMIT,
                        NetworkMode: 'none',
                    },
                });

                await compileContainer.start();
                await compileContainer.wait();

                const compileLogBuffer = await compileContainer.logs({ stdout: true, stderr: true });
                const compileLogs = parseDockerLogs(compileLogBuffer as Buffer);
                await compileContainer.remove();

                // Check for compilation errors
                if (compileLogs.stderr.trim()) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    return {
                        results: [{
                            passed: false,
                            error: 'Compilation Error',
                            stderr: compileLogs.stderr.trim(),
                            actualOutput: '',
                        }]
                    };
                }
            } catch (compileError: any) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                return { results: [{ passed: false, error: `Compilation failed: ${compileError.message}` }] };
            }
        }

        // 5. Run each test case
        let testCaseIndex = 1;
        for (const testCase of testCases) {
            const startTime = Date.now();

            try {
                // Write input to a file for deterministic stdin
                const inputFile = 'input.txt';
                fs.writeFileSync(path.join(tempDir, inputFile), testCase.input);

                const runContainer = await docker.createContainer({
                    Image: RUNTIME_IMAGE,
                    Cmd: ['/bin/bash', '-c', `${config.runCmd} < ${inputFile}`],
                    WorkingDir: '/home/runner',
                    Tty: false,
                    HostConfig: {
                        Binds: [`${tempDir}:/home/runner`],
                        Memory: MEMORY_LIMIT,
                        CpuQuota: 50000, // 50% of one CPU
                        NetworkMode: 'none',
                    },
                });

                await runContainer.start();

                // Wait with timeout
                const waitPromise = runContainer.wait();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Time Limit Exceeded')), EXECUTION_TIMEOUT_MS)
                );

                try {
                    await Promise.race([waitPromise, timeoutPromise]);
                } catch (timeoutError: any) {
                    try { await runContainer.kill(); } catch (e) { }
                    await runContainer.remove();

                    results.push({
                        testCase: testCaseIndex,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput.trim(),
                        actualOutput: '',
                        passed: false,
                        error: 'Time Limit Exceeded',
                        time: EXECUTION_TIMEOUT_MS,
                    });
                    testCaseIndex++;
                    continue;
                }

                // Get logs
                const logBuffer = await runContainer.logs({ stdout: true, stderr: true });
                const logs = parseDockerLogs(logBuffer as Buffer);
                await runContainer.remove();

                const duration = Date.now() - startTime;
                const actualOutput = logs.stdout.trim();
                const expectedOutput = testCase.expectedOutput.trim();
                const passed = actualOutput === expectedOutput;

                results.push({
                    testCase: testCaseIndex,
                    input: testCase.input,
                    expectedOutput: expectedOutput,
                    actualOutput: actualOutput,
                    passed: passed,
                    stderr: logs.stderr.trim() || (passed ? '' : 'Output mismatch'),
                    time: duration,
                });

            } catch (runError: any) {
                results.push({
                    testCase: testCaseIndex,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput.trim(),
                    actualOutput: '',
                    passed: false,
                    error: `Runtime Error: ${runError.message}`,
                    time: Date.now() - startTime,
                });
            }
            testCaseIndex++;
        }

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        return { results };
    },
    { connection: redisConnection }
);

console.log('🚀 CodeVamp Worker started (Program-Based Execution Model)');
console.log('   Supported languages:', Object.keys(LANGUAGE_CONFIGS).join(', '));
