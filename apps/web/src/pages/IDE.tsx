import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor, { type OnChange } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, ChevronLeft, Terminal as TerminalIcon, CheckCircle2, XCircle, Loader2, Trophy, ArrowRight, Sparkles, Clock, Zap, LogIn, Lock, ChevronUp, ChevronDown } from 'lucide-react';

import axios from 'axios';
import { API_URL } from '../config';

interface Problem {
    _id: string;
    title: string;
    description: string;
    constraints: string[];
    difficulty: string;
    testCases: any[];
    boilerplates?: any;
}

interface ExecutionResult {
    passed?: boolean;
    results?: any[];
    tests?: { input: string; output: string; expected: string; status: string }[];
    time?: string;
    memory?: string;
    error?: string;
}

const IDE = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Write your solution here...');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState<ExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [allProblems, setAllProblems] = useState<Problem[]>([]);

    // Layout drag-and-resize states
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDraggingWidth, setIsDraggingWidth] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(192);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
    const [isDraggingHeight, setIsDraggingHeight] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startResizeWidth = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingWidth(true);
    };

    const startResizeWidthTouch = (e: React.TouchEvent) => {
        setIsDraggingWidth(true);
    };

    const startResizeHeight = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingHeight(true);
    };

    const startResizeHeightTouch = (e: React.TouchEvent) => {
        setIsDraggingHeight(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingWidth) return;
            const containerWidth = window.innerWidth;
            if (containerWidth === 0) return;
            let newWidth = (e.clientX / containerWidth) * 100;
            if (newWidth < 20) newWidth = 20;
            if (newWidth > 80) newWidth = 80;
            setLeftWidth(newWidth);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDraggingWidth || e.touches.length === 0) return;
            const containerWidth = window.innerWidth;
            let newWidth = (e.touches[0].clientX / containerWidth) * 100;
            if (newWidth < 20) newWidth = 20;
            if (newWidth > 80) newWidth = 80;
            setLeftWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsDraggingWidth(false);
        };

        if (isDraggingWidth) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDraggingWidth]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingHeight) return;
            const containerHeight = window.innerHeight;
            let newHeight = containerHeight - e.clientY - 64;
            if (newHeight < 40) newHeight = 40;
            if (newHeight > containerHeight * 0.8) newHeight = containerHeight * 0.8;
            setTerminalHeight(newHeight);
            setIsTerminalCollapsed(false);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDraggingHeight || e.touches.length === 0) return;
            const containerHeight = window.innerHeight;
            let newHeight = containerHeight - e.touches[0].clientY - 64;
            if (newHeight < 40) newHeight = 40;
            if (newHeight > containerHeight * 0.8) newHeight = containerHeight * 0.8;
            setTerminalHeight(newHeight);
            setIsTerminalCollapsed(false);
        };

        const handleMouseUp = () => {
            setIsDraggingHeight(false);
        };

        if (isDraggingHeight) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDraggingHeight]);

    const handleEditorChange: OnChange = (value) => {
        setCode(value || '');
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(`${API_URL}/problems/${problemId}`);
                setProblem(res.data);
                if (res.data.boilerplates?.[language]) {
                    setCode(res.data.boilerplates[language]);
                }
            } catch (err) {
                console.error('Failed to fetch problem', err);
            }
        };
        const fetchAllProblems = async () => {
            try {
                const res = await axios.get(`${API_URL}/problems`);
                setAllProblems(res.data);
            } catch (err) {
                console.error('Failed to fetch problems', err);
            }
        };
        fetchProblem();
        fetchAllProblems();
    }, [problemId]);

    // Update boilerplate when language changes
    useEffect(() => {
        if (problem?.boilerplates?.[language]) {
            setCode(problem.boilerplates[language]);
        }
    }, [language, problem]);

    const runCode = async (isSubmit: boolean = false) => {
        // Auth gate: require login before any execution
        const token = localStorage.getItem('token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        setIsRunning(true);
        setOutput(null);
        setShowSuccessModal(false);
        try {
            const submitRes = await axios.post(`${API_URL}/submissions/execute`, {
                code,
                language,
                problemId,
                isSubmit
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const jobId = submitRes.data.jobId;

            const pollStatus = async () => {
                const statusRes = await axios.get(`${API_URL}/submissions/status/${jobId}`);
                if (statusRes.data.status === 'completed') {
                    setOutput(statusRes.data.result);
                    setIsRunning(false);

                    // Check if all passed and it was a submission
                    if (isSubmit && statusRes.data.result?.results) {
                        const results = statusRes.data.result.results;
                        const allPassed = results.length > 0 && results.every((r: any) => r.passed);
                        const totalTime = results.reduce((acc: number, r: any) => acc + (r.time || 0), 0);
                        if (allPassed) {
                            setExecutionTime(totalTime);
                            setShowSuccessModal(true);
                        }
                    }
                } else if (statusRes.data.status === 'failed') {
                    setOutput({ error: 'Worker execution failed' });
                    setIsRunning(false);
                } else {
                    setTimeout(pollStatus, 1000);
                }
            };

            pollStatus();
        } catch (err: any) {
            setOutput({ error: err.response?.data?.message || 'Failed to submit code' });
            setIsRunning(false);
        }
    };

    const goToNextProblem = () => {
        const currentIndex = allProblems.findIndex(p => p._id === problemId);
        if (currentIndex < allProblems.length - 1) {
            navigate(`/ide/${allProblems[currentIndex + 1]._id}`);
            setShowSuccessModal(false);
            setOutput(null);
        } else {
            navigate('/');
        }
    };

    // Get sample test cases (non-hidden) for display
    const sampleTestCases = problem?.testCases.filter(tc => !tc.isHidden).slice(0, 2) || [];

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Login Required Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            className="bg-gradient-to-br from-surface to-background border border-primary/30 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl shadow-primary/20"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                                className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 rounded-2xl flex items-center justify-center mx-auto mb-5"
                            >
                                <Lock className="text-primary" size={28} />
                            </motion.div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    You need to be logged in to run or submit code. Create a free account to start solving!
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-3"
                            >
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-medium transition-all border border-border text-sm"
                                >
                                    Cancel
                                </button>
                                <Link
                                    to="/login"
                                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-black px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 text-sm"
                                >
                                    <LogIn size={16} />
                                    Login Now
                                </Link>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 text-xs mt-4"
                            >
                                No account?{' '}
                                <Link to="/signup" className="text-primary hover:underline" onClick={() => setShowLoginModal(false)}>
                                    Sign up free
                                </Link>
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                    <Sparkles className="text-yellow-400" size={24} />
                                    Congratulations!
                                    <Sparkles className="text-yellow-400" size={24} />
                                </h2>
                                <p className="text-accent text-xl font-semibold mb-4">Correct Solution!</p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex justify-center gap-6 mb-6"
                            >
                                <div className="bg-white/5 rounded-xl px-4 py-3 border border-border">
                                    <div className="flex items-center gap-2 text-accent mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs uppercase tracking-wider font-bold">Runtime</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{executionTime}ms</p>
                                </div>
                                <div className="bg-white/5 rounded-xl px-4 py-3 border border-border">
                                    <div className="flex items-center gap-2 text-primary mb-1">
                                        <Zap size={16} />
                                        <span className="text-xs uppercase tracking-wider font-bold">Status</span>
                                    </div>
                                    <p className="text-2xl font-bold text-accent">Accepted</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-400 text-sm mb-6"
                            >
                                <p>+1 Coin • +{problem?.difficulty === 'Easy' ? 10 : problem?.difficulty === 'Medium' ? 30 : 50} Points</p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex gap-3"
                            >
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-medium transition-all border border-border"
                                >
                                    Review Solution
                                </button>
                                <button
                                    onClick={goToNextProblem}
                                    className="flex-1 bg-gradient-to-r from-primary to-accent text-black px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90"
                                >
                                    Next Question
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* breadcrumbs */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white flex items-center gap-1 text-sm transition-colors">
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="h-4 w-[1px] bg-border" />
                <h2 className="font-semibold">{problem?.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded border ${problem?.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    problem?.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {problem?.difficulty}
                </span>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-0 h-full min-h-0 select-none">
                {/* Left: Description */}
                <div 
                    style={isDesktop ? { width: `${leftWidth}%` } : undefined}
                    className="bg-surface border border-border rounded-2xl p-6 overflow-y-auto custom-scrollbar h-full min-h-0"
                >
                    <h3 className="text-lg font-bold mb-4">Description</h3>
                    <p className="text-gray-300 leading-relaxed font-light whitespace-pre-line">
                        {problem?.description}
                    </p>
 
                    {/* Sample Input/Output */}
                    {sampleTestCases.length > 0 && (
                        <div className="mt-8 space-y-4">
                            {sampleTestCases.map((tc, idx) => (
                                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-border/30">
                                    <p className="text-sm font-semibold mb-2">Example {idx + 1}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium">Input:</p>
                                            <pre className="bg-background p-3 rounded-lg text-sm font-mono overflow-x-auto">{tc.input}</pre>
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
                            {problem?.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>
 
                {/* Vertical Resizer */}
                {isDesktop && (
                    <div
                        onMouseDown={startResizeWidth}
                        onTouchStart={startResizeWidthTouch}
                        className={`hidden lg:flex items-center justify-center w-2 hover:bg-primary/20 transition-all cursor-col-resize select-none h-full relative group ${isDraggingWidth ? 'bg-primary/30' : 'bg-transparent'}`}
                    >
                        <div className={`w-[2px] h-16 rounded-full group-hover:bg-primary transition-colors ${isDraggingWidth ? 'bg-primary' : 'bg-[#2E364F]'}`} />
                    </div>
                )}
 
                {/* Right: Editor & Terminal */}
                <div 
                    style={isDesktop ? { width: `${100 - leftWidth}%` } : undefined}
                    className="flex flex-col gap-0 overflow-hidden h-full min-h-0"
                >
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
                                <option value="go">Go (1.21)</option>
                                <option value="javascript">JavaScript (Node.js 20)</option>
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

                    {/* Horizontal Resizer */}
                    <div
                        onMouseDown={startResizeHeight}
                        onTouchStart={startResizeHeightTouch}
                        onDoubleClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                        className={`flex items-center justify-center h-2 hover:bg-primary/20 transition-all cursor-row-resize select-none w-full relative group ${isDraggingHeight ? 'bg-primary/30' : 'bg-transparent'}`}
                    >
                        <div className={`h-[2px] w-16 rounded-full group-hover:bg-primary transition-colors ${isDraggingHeight ? 'bg-primary' : 'bg-[#2E364F]'}`} />
                    </div>

                    {/* Terminal */}
                    <div 
                        style={{ height: isTerminalCollapsed ? '42px' : `${terminalHeight}px` }}
                        className="bg-background border border-border rounded-2xl overflow-hidden flex flex-col min-h-[42px] transition-all duration-150"
                    >
                        {/* Terminal Header */}
                        <div 
                            onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                            className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-[#2E364F]/50 cursor-pointer select-none hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold font-mono">
                                <TerminalIcon size={14} /> TERMINAL
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                {isTerminalCollapsed ? (
                                    <ChevronUp size={14} />
                                ) : (
                                    <ChevronDown size={14} />
                                )}
                            </button>
                        </div>

                        {/* Terminal Body */}
                        {!isTerminalCollapsed && (
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
                                <AnimatePresence mode="wait">
                                    {!output ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-gray-700 text-sm font-mono"
                                        >
                                            $ Run your code to see the output here...
                                        </motion.p>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
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
                                                                    <span className="text-gray-500">Memory: ~12MB</span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="space-y-3 mt-4">
                                                        {output.results?.map((res: any, i: number) => (
                                                            <div key={i} className={`bg-white/5 p-3 rounded-xl border ${res.passed ? 'border-border/30' : 'border-red-500/30'} font-mono text-xs`}>
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Test Case {i + 1}</span>
                                                                    <span className={res.passed ? 'text-accent' : 'text-red-400'}>
                                                                        {res.passed ? 'Passed' : 'Failed'}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    <div className="space-y-1">
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold">Input</p>
                                                                        <pre className="bg-background/50 p-2 rounded text-gray-300 overflow-x-auto">{res.input}</pre>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold">Output</p>
                                                                        <pre className={`bg-background/50 p-2 rounded overflow-x-auto ${res.passed ? 'text-accent' : 'text-red-400'}`}>
                                                                            {res.actualOutput || 'Empty'}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                                {!res.passed && res.expectedOutput && (
                                                                    <div className="mt-2 space-y-1">
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold text-accent">Expected</p>
                                                                        <pre className="bg-background/50 p-2 rounded text-accent overflow-x-auto">{res.expectedOutput}</pre>
                                                                    </div>
                                                                )}
                                                                {!res.passed && res.stderr && (
                                                                    <div className="mt-2 space-y-1">
                                                                        <p className="text-red-400 text-[10px] uppercase font-bold">Error Output</p>
                                                                        <pre className="bg-red-500/10 p-2 rounded text-red-300 overflow-x-auto whitespace-pre-wrap">{res.stderr}</pre>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDE;
