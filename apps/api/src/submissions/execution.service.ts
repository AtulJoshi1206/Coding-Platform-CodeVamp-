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
    private static readonly ALLOWED_LANGUAGES = new Set(['python', 'cpp', 'javascript', 'java', 'go']);

    constructor() {
        this.ensureTempDir();
    }

    private async ensureTempDir() {
        try {
            await fs.mkdir(this.TEMP_DIR, { recursive: true });
        } catch (err) { }
    }

    async execute(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        // ── Security Validation ──────────────────────────────────
        if (!ExecutionService.ALLOWED_LANGUAGES.has(language)) {
            throw new Error(`Unsupported language: ${language}`);
        }
        if (code.length > 64 * 1024) { // 64 KB max
            throw new Error('Code size exceeds 64KB limit');
        }

        const jobId = randomUUID();
        const workDir = path.join(this.TEMP_DIR, jobId);
        await fs.mkdir(workDir, { recursive: true });

        // Resource limit prefix: 10s CPU time, 256MB virtual memory
        const ulimitPrefix = `ulimit -t 10 -v 262144 2>/dev/null; `;

        try {
            // ── Step 1: Write code and compile ONCE if needed ───────
            let binPath = '';
            
            if (language === 'python') {
                const filePath = path.join(workDir, 'solution.py');
                await fs.writeFile(filePath, code, 'utf8');
                binPath = filePath;
            }
            else if (language === 'javascript') {
                const filePath = path.join(workDir, 'solution.js');
                await fs.writeFile(filePath, code, 'utf8');
                binPath = filePath;
            }
            else if (language === 'cpp') {
                const sourcePath = path.join(workDir, 'solution.cpp');
                binPath = path.join(workDir, 'solution');
                await fs.writeFile(sourcePath, code, 'utf8');

                // Compile ONCE before running test cases
                await execAsync(
                    `g++ -O2 -std=c++17 "${sourcePath}" -o "${binPath}"`,
                    { timeout: 15000 }
                ).catch(err => { throw new Error(`Compilation Error: ${err.stderr || err.message}`); });
            }
            else if (language === 'java') {
                const filePath = path.join(workDir, 'Solution.java');
                const javaCode = code.replace(/public\s+class\s+\w+/g, 'public class Solution');
                await fs.writeFile(filePath, javaCode, 'utf8');

                // Compile ONCE before running test cases
                await execAsync(`javac "${filePath}"`, { timeout: 20000, cwd: workDir })
                    .catch(err => { throw new Error(`Compilation Error: ${err.stderr || err.message}`); });
            }
            else if (language === 'go') {
                const filePath = path.join(workDir, 'solution.go');
                binPath = path.join(workDir, 'solution');
                await fs.writeFile(filePath, code, 'utf8');

                // Compile ONCE before running test cases
                await execAsync(`go build -o "${binPath}" "${filePath}"`, { timeout: 20000 })
                    .catch(err => { throw new Error(`Build Error: ${err.stderr || err.message}`); });
            }

            // ── Step 2: Run all test cases in PARALLEL using the pre-compiled binary ──
            const results = await Promise.all(
                testCases.map(async (testCase, index) => {
                    const start = Date.now();
                    const stdinPath = path.join(workDir, `stdin-${index}.txt`);
                    await fs.writeFile(stdinPath, testCase.input, 'utf8');

                    let stdout = '';
                    let stderr = '';
                    let cmd = '';

                    if (language === 'python') {
                        cmd = `${ulimitPrefix}python3 "${binPath}" < "${stdinPath}"`;
                    }
                    else if (language === 'javascript') {
                        cmd = `${ulimitPrefix}node "${binPath}" < "${stdinPath}"`;
                    }
                    else if (language === 'cpp') {
                        cmd = `${ulimitPrefix}"${binPath}" < "${stdinPath}"`;
                    }
                    else if (language === 'go') {
                        cmd = `${ulimitPrefix}"${binPath}" < "${stdinPath}"`;
                    }
                    else if (language === 'java') {
                        cmd = `${ulimitPrefix}java -cp "${workDir}" Solution < "${stdinPath}"`;
                    }

                    try {
                        const res = await execAsync(cmd, { timeout: 12000, shell: '/bin/bash' });
                        stdout = res.stdout;
                        stderr = res.stderr;
                    } catch (err: any) {
                        stderr = err.stderr || err.message || 'Runtime Error';
                        stdout = err.stdout || '';
                        if (err.killed || err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
                            stderr = 'Time Limit Exceeded (10s)';
                        }
                    }

                    const actualOutput = stdout.trim();
                    const expectedOutput = testCase.expectedOutput.trim();

                    return {
                        passed: actualOutput === expectedOutput,
                        actualOutput,
                        expectedOutput,
                        stderr,
                        stdout,
                        error: stderr ? stderr : null,
                        time: Date.now() - start,
                    };
                })
            );

            return { results };

        } catch (error: any) {
            // Return compilation failure clearly as the test case errors
            return {
                results: testCases.map(tc => ({
                    passed: false,
                    error: error.message,
                    actualOutput: '',
                    expectedOutput: tc.expectedOutput,
                    time: 0,
                }))
            };
        } finally {
            // Guaranteed cleanup of temporary job files
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch (_) { }
        }
    }
}
