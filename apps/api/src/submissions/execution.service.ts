import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

@Injectable()
export class ExecutionService {
    private readonly TEMP_DIR = path.join(os.tmpdir(), 'codevamp-exec');

    constructor() {
        this.ensureTempDir();
    }

    private async ensureTempDir() {
        try {
            await fs.mkdir(this.TEMP_DIR, { recursive: true });
        } catch (err) { }
    }

    async execute(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        const jobId = randomUUID();

        // Run all test cases in PARALLEL for maximum throughput
        const results = await Promise.all(
            testCases.map(async (testCase, index) => {
                const caseJobId = `${jobId}-${index}`;
                try {
                    const result = await this.runLocal(code, language, testCase.input, caseJobId);
                    const actualOutput = result.stdout.trim();
                    const expectedOutput = testCase.expectedOutput.trim();

                    return {
                        passed: actualOutput === expectedOutput,
                        actualOutput,
                        expectedOutput,
                        stderr: result.stderr,
                        stdout: result.stdout,
                        error: result.stderr ? 'Runtime Error' : null,
                        time: result.time,
                    };
                } catch (error) {
                    return {
                        passed: false,
                        error: error.message,
                        actualOutput: '',
                        expectedOutput: testCase.expectedOutput,
                        time: 0,
                    };
                }
            })
        );

        return { results };
    }

    // ── Security: Strict language whitelist ──────────────────────────────────
    private static readonly ALLOWED_LANGUAGES = new Set(['python', 'cpp', 'javascript', 'java', 'go']);

    private async runLocal(code: string, language: string, input: string, jobId: string) {
        // ── Security: Validate language (prevent unsupported/malicious values) ─
        if (!ExecutionService.ALLOWED_LANGUAGES.has(language)) {
            throw new Error(`Unsupported language: ${language}`);
        }
        // ── Security: Validate jobId is a safe UUID (prevent path traversal) ──
        if (!/^[a-f0-9-]+$/.test(jobId)) {
            throw new Error('Invalid jobId format');
        }
        // ── Security: Validate code size (prevent huge payloads) ───────────────
        if (code.length > 64 * 1024) { // 64 KB max
            throw new Error('Code size exceeds 64KB limit');
        }

        const start = Date.now();
        let stdout = '';
        let stderr = '';

        const workDir = path.join(this.TEMP_DIR, jobId);
        await fs.mkdir(workDir, { recursive: true });

        // Write stdin to a file — avoids shell injection & handles multiline input correctly
        const stdinPath = path.join(workDir, 'stdin.txt');
        await fs.writeFile(stdinPath, input, 'utf8');

        // Resource limit prefix: 10s CPU time, 256MB virtual memory (POSIX: Linux/macOS)
        const ulimitPrefix = `ulimit -t 10 -v 262144 2>/dev/null; `;

        try {
            if (language === 'python') {
                const filePath = path.join(workDir, 'solution.py');
                await fs.writeFile(filePath, code, 'utf8');
                const cmd = `${ulimitPrefix}python3 "${filePath}" < "${stdinPath}"`;
                const res = await execAsync(cmd, { timeout: 12000, shell: '/bin/bash' });
                stdout = res.stdout;
                stderr = res.stderr;
            }
            else if (language === 'cpp') {
                const sourcePath = path.join(workDir, 'solution.cpp');
                const binPath = path.join(workDir, 'solution');
                await fs.writeFile(sourcePath, code, 'utf8');

                // Compile step (separate timeout)
                const compileRes = await execAsync(
                    `g++ -O2 -std=c++17 "${sourcePath}" -o "${binPath}"`,
                    { timeout: 15000 }
                ).catch(err => { throw new Error(`Compilation Error: ${err.stderr || err.message}`); });

                if (compileRes.stderr) stderr = compileRes.stderr;

                // Run with resource limits
                const runCmd = `${ulimitPrefix}"${binPath}" < "${stdinPath}"`;
                const res = await execAsync(runCmd, { timeout: 12000, shell: '/bin/bash' });
                stdout = res.stdout;
                if (res.stderr) stderr = res.stderr;
            }
            else if (language === 'javascript') {
                const filePath = path.join(workDir, 'solution.js');
                await fs.writeFile(filePath, code, 'utf8');
                const cmd = `${ulimitPrefix}node "${filePath}" < "${stdinPath}"`;
                const res = await execAsync(cmd, { timeout: 12000, shell: '/bin/bash' });
                stdout = res.stdout;
                stderr = res.stderr;
            }
            else if (language === 'java') {
                // Java filename must match public class name
                const filePath = path.join(workDir, 'Solution.java');
                // Auto-rename public class to Solution for safety
                const javaCode = code.replace(/public\s+class\s+\w+/g, 'public class Solution');
                await fs.writeFile(filePath, javaCode, 'utf8');

                // Compile
                await execAsync(`javac "${filePath}"`, { timeout: 20000, cwd: workDir })
                    .catch(err => { throw new Error(`Compilation Error: ${err.stderr || err.message}`); });

                // Run
                const runCmd = `${ulimitPrefix}java -cp "${workDir}" Solution < "${stdinPath}"`;
                const res = await execAsync(runCmd, { timeout: 12000, shell: '/bin/bash' });
                stdout = res.stdout;
                stderr = res.stderr;
            }
            else if (language === 'go') {
                const filePath = path.join(workDir, 'solution.go');
                const binPath = path.join(workDir, 'solution');
                await fs.writeFile(filePath, code, 'utf8');

                // Build
                await execAsync(`go build -o "${binPath}" "${filePath}"`, { timeout: 20000 })
                    .catch(err => { throw new Error(`Build Error: ${err.stderr || err.message}`); });

                // Run
                const runCmd = `${ulimitPrefix}"${binPath}" < "${stdinPath}"`;
                const res = await execAsync(runCmd, { timeout: 12000, shell: '/bin/bash' });
                stdout = res.stdout;
                stderr = res.stderr;
            }
            else {
                throw new Error(`Unsupported language: ${language}. Supported: python, cpp, java, javascript, go`);
            }
        } catch (err: any) {
            // Capture output from failed execAsync (non-zero exit)
            stderr = err.stderr || stderr || err.message || 'Unknown error';
            stdout = err.stdout || stdout || '';

            // TLE detection
            if (err.killed || err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
                stderr = 'Time Limit Exceeded (10s)';
            }
        } finally {
            // Guaranteed cleanup of temp files
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch (_) { }
        }

        return {
            stdout,
            stderr,
            time: Date.now() - start,
        };
    }
}
