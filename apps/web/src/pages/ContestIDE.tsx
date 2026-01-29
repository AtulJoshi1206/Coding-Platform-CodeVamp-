import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor, { type OnChange } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, ChevronLeft, Terminal as TerminalIcon, CheckCircle2, XCircle, Loader2, Trophy, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

interface ContestProblem {
    title: string;
    description: string;
    difficulty: string;
    constraints: string[];
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    boilerplates: Record<string, string>;
}

interface ExecutionResult {
    passed?: boolean;
    results?: any[];
    error?: string;
}

const ContestIDE = () => {
    const { contestId, problemIndex } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState<ExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [problem, setProblem] = useState<ContestProblem | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [contestProblems, setContestProblems] = useState<any[]>([]);

    const handleEditorChange: OnChange = (value) => {
        setCode(value || '');
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const [problemRes, contestRes] = await Promise.all([
                    axios.get(`${API_URL}/contests/${contestId}/problem/${problemIndex}`),
                    axios.get(`${API_URL}/contests/${contestId}`),
                ]);
                setProblem(problemRes.data);
                setContestProblems(contestRes.data.problems);
                if (problemRes.data.boilerplates?.[language]) {
                    setCode(problemRes.data.boilerplates[language]);
                }
            } catch (err) {
                console.error('Failed to fetch problem', err);
            }
        };
        fetchProblem();
    }, [contestId, problemIndex]);

    useEffect(() => {
        if (problem?.boilerplates?.[language]) {
            setCode(problem.boilerplates[language]);
        }
    }, [language, problem]);

    const runCode = async (isSubmit: boolean = false) => {
        if (!problem) return;

        setIsRunning(true);
        setOutput(null);
        setShowSuccessModal(false);

        try {
            const token = localStorage.getItem('token');

            // Use public test cases for run, all for submit
            const testCases = isSubmit
                ? problem.testCases
                : problem.testCases.filter(tc => !tc.isHidden);

            const submitRes = await axios.post(`${API_URL}/submissions/execute`, {
                code,
                language,
                problemId: `contest_${contestId}_${problemIndex}`, // Special ID for contest problems
                isSubmit,
                testCases, // Send test cases directly for contest problems
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const jobId = submitRes.data.jobId;

            const pollStatus = async () => {
                const statusRes = await axios.get(`${API_URL}/submissions/status/${jobId}`);
                if (statusRes.data.status === 'completed') {
                    setOutput(statusRes.data.result);
                    setIsRunning(false);

                    if (isSubmit && statusRes.data.result?.results) {
                        const results = statusRes.data.result.results;
                        const allPassed = results.length > 0 && results.every((r: any) => r.passed);
                        const totalTime = results.reduce((acc: number, r: any) => acc + (r.time || 0), 0);

                        if (allPassed) {
                            // Record solve
                            await axios.post(`${API_URL}/contests/${contestId}/solve/${problemIndex}`, {
                                time: totalTime
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            setExecutionTime(totalTime);
                            setShowSuccessModal(true);
                        }
                    }
                } else if (statusRes.data.status === 'failed') {
                    setOutput({ error: 'Execution failed' });
                    setIsRunning(false);
                } else {
                    setTimeout(pollStatus, 1000);
                }
            };

            pollStatus();
        } catch (err: any) {
            setOutput({ error: err.response?.data?.message || 'Failed to execute code' });
            setIsRunning(false);
        }
    };

    const goToNextProblem = () => {
        const idx = parseInt(problemIndex || '0');
        if (idx < contestProblems.length - 1) {
            navigate(`/contests/${contestId}/problem/${idx + 1}`);
            setShowSuccessModal(false);
            setOutput(null);
        } else {
            navigate(`/contests/${contestId}`);
        }
    };

    const sampleTestCases = problem?.testCases.filter(tc => !tc.isHidden).slice(0, 2) || [];

    if (!problem) {
        return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Loading problem...</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-gradient-to-br from-surface to-background border border-accent/30 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl shadow-accent/20"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 bg-gradient-to-br from-accent to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Trophy className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-white mb-2">Problem Solved!</h2>
                            <p className="text-accent text-xl font-semibold mb-4">Correct Solution!</p>

                            <div className="flex justify-center gap-6 mb-6">
                                <div className="bg-white/5 rounded-xl px-4 py-3 border border-border">
                                    <div className="flex items-center gap-2 text-accent mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs uppercase tracking-wider font-bold">Runtime</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{executionTime}ms</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-medium transition-all border border-border"
                                >
                                    Stay Here
                                </button>
                                <button
                                    onClick={goToNextProblem}
                                    className="flex-1 bg-gradient-to-r from-primary to-accent text-black px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90"
                                >
                                    Next Problem
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate(`/contests/${contestId}`)} className="text-gray-500 hover:text-white flex items-center gap-1 text-sm transition-colors">
                    <ChevronLeft size={16} /> Back to Contest
                </button>
                <div className="h-4 w-[1px] bg-border" />
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {String.fromCharCode(65 + parseInt(problemIndex || '0'))}
                    </span>
                    <h2 className="font-semibold">{problem.title}</h2>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    problem.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {problem.difficulty}
                </span>

                {/* Problem navigation */}
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                    {contestProblems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(`/contests/${contestId}/problem/${i}`)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${parseInt(problemIndex || '0') === i
                                ? 'bg-primary text-black'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            {String.fromCharCode(65 + i)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
                {/* Left: Description */}
                <div className="bg-surface border border-border rounded-2xl p-6 overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-bold mb-4">Description</h3>
                    <p className="text-gray-300 leading-relaxed font-light whitespace-pre-line">{problem.description}</p>

                    {sampleTestCases.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Examples</h4>
                            {sampleTestCases.map((tc, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-4 border border-border/50">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Example {i + 1}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium">Input:</p>
                                            <pre className="bg-background p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">{tc.input}</pre>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium">Output:</p>
                                            <pre className="bg-background p-3 rounded-lg text-sm text-accent font-mono overflow-x-auto">{tc.expectedOutput}</pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Constraints</h4>
                        <ul className="list-disc list-inside text-gray-500 text-sm space-y-1">
                            {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Right: Editor & Terminal */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
                        <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-border">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-sm focus:outline-none text-primary font-medium"
                            >
                                <option value="python">Python (3.12)</option>
                                <option value="cpp">C++ (GCC 12)</option>
                                <option value="java">Java (OpenJDK 17)</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => runCode(false)}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-xs px-3 py-1.5 rounded-md transition-all disabled:opacity-50"
                                >
                                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                    Run Tests
                                </button>
                                <button
                                    onClick={() => runCode(true)}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 bg-primary text-black font-bold text-xs px-4 py-1.5 rounded-md hover:bg-primary/80 transition-all disabled:opacity-50"
                                >
                                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Submit
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={language === 'cpp' ? 'cpp' : language}
                                value={code}
                                onChange={handleEditorChange}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="h-48 bg-background border border-border rounded-2xl p-4 overflow-y-auto flex flex-col">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                            <TerminalIcon size={14} /> TERMINAL
                        </div>

                        <AnimatePresence mode="wait">
                            {!output ? (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-700 text-sm font-mono">
                                    $ Run your code to see the output here...
                                </motion.p>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    {output.error ? (
                                        <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">{output.error}</pre>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 text-xs font-mono">
                                                {(() => {
                                                    const results = output.results || [];
                                                    const allPassed = results.length > 0 && results.every((r: any) => r.passed);
                                                    const totalTime = results.reduce((acc: number, r: any) => acc + (r.time || 0), 0);
                                                    return (
                                                        <>
                                                            <span className={`flex items-center gap-1 ${allPassed ? 'text-accent' : 'text-red-400'}`}>
                                                                {allPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                                {allPassed ? 'Accepted' : 'Failed'}
                                                            </span>
                                                            <span className="text-gray-500">Total Runtime: {totalTime}ms</span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div className="space-y-3 mt-4">
                                                {output.results?.map((res: any, i: number) => (
                                                    <div key={i} className={`bg-white/5 p-3 rounded-xl border ${res.passed ? 'border-border/30' : 'border-red-500/30'} font-mono text-xs`}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Test {i + 1}</span>
                                                            <span className={res.passed ? 'text-accent' : 'text-red-400'}>
                                                                {res.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </div>
                                                        {!res.passed && (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <p className="text-gray-500 text-[10px] uppercase">Your Output</p>
                                                                    <pre className="text-red-400 mt-1">{res.actualOutput || 'Empty'}</pre>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-[10px] uppercase">Expected</p>
                                                                    <pre className="text-accent mt-1">{res.expectedOutput}</pre>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestIDE;
