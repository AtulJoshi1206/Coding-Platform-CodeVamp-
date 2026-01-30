import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExecutionService {
    private readonly PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

    private readonly LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
        python: { language: 'python', version: '3.10.0' },
        cpp: { language: 'cpp', version: '10.2.0' },
        java: { language: 'java', version: '15.0.2' },
        go: { language: 'go', version: '1.16.2' },
        javascript: { language: 'javascript', version: '18.15.0' },
        c: { language: 'c', version: '10.2.0' },
    };

    async execute(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        const config = this.LANGUAGE_MAP[language];
        if (!config) {
            return { results: [{ passed: false, error: `Unsupported language: ${language}` }] };
        }

        const results: any[] = [];

        for (const testCase of testCases) {
            try {
                const response = await axios.post(this.PISTON_URL, {
                    language: config.language,
                    version: config.version,
                    files: [{ content: code }],
                    stdin: testCase.input,
                });

                const output = response.data.run;
                const actualOutput = output.stdout.trim();
                const expectedOutput = testCase.expectedOutput.trim();
                const passed = actualOutput === expectedOutput;

                results.push({
                    passed,
                    actualOutput,
                    expectedOutput,
                    stderr: output.stderr,
                    stdout: output.stdout,
                    error: output.stderr ? 'Runtime Error' : null,
                    time: 0, // Piston doesn't give exact time easily
                });
            } catch (error) {
                results.push({
                    passed: false,
                    error: `Execution failed: ${error.message}`,
                });
            }
        }

        return { results };
    }
}
