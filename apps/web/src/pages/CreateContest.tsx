import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, Save, Calendar, Clock, Trophy } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface ContestProblem {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    constraints: string[];
    testCases: TestCase[];
    boilerplates: Record<string, string>;
}

const CreateContest = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const addProblem = () => {
        setProblems([...problems, {
            title: '',
            description: '',
            difficulty: 'Easy',
            constraints: [''],
            testCases: [{ input: '', expectedOutput: '', isHidden: false }],
            boilerplates: {
                python: `import sys

def solve():
    # Your solution here
    pass

if __name__ == "__main__":
    solve()
`,
                cpp: `#include <iostream>
using namespace std;

int main() {
    // Your solution here
    return 0;
}
`,
                java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
    }
}
`
            }
        }]);
    };

    const updateProblem = (index: number, field: keyof ContestProblem, value: any) => {
        const updated = [...problems];
        (updated[index] as any)[field] = value;
        setProblems(updated);
    };

    const removeProblem = (index: number) => {
        setProblems(problems.filter((_, i) => i !== index));
    };

    const addTestCase = (problemIndex: number) => {
        const updated = [...problems];
        updated[problemIndex].testCases.push({ input: '', expectedOutput: '', isHidden: false });
        setProblems(updated);
    };

    const updateTestCase = (problemIndex: number, testIndex: number, field: keyof TestCase, value: any) => {
        const updated = [...problems];
        (updated[problemIndex].testCases[testIndex] as any)[field] = value;
        setProblems(updated);
    };

    const removeTestCase = (problemIndex: number, testIndex: number) => {
        const updated = [...problems];
        updated[problemIndex].testCases = updated[problemIndex].testCases.filter((_, i) => i !== testIndex);
        setProblems(updated);
    };

    const handleSubmit = async () => {
        if (!title || !description || !startTime || !endTime || problems.length === 0) {
            setError('Please fill in all fields and add at least one problem');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/contests`, {
                title,
                description,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                problems,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/contests');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create contest');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/contests')} className="text-gray-500 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black">Create Contest</h1>
                    <p className="text-gray-500 text-sm">Set up a new coding competition</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Contest Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-2xl p-6 space-y-4"
            >
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Trophy size={20} className="text-primary" />
                    Contest Details
                </h2>

                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Weekly Contest #1"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your contest..."
                        rows={3}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2 flex items-center gap-1">
                            <Calendar size={12} /> Start Time
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2 flex items-center gap-1">
                            <Clock size={12} /> End Time
                        </label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Problems */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Problems ({problems.length})</h2>
                    <button
                        onClick={addProblem}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-all"
                    >
                        <Plus size={16} /> Add Problem
                    </button>
                </div>

                {problems.map((problem, pi) => (
                    <motion.div
                        key={pi}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-border rounded-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-primary">Problem {pi + 1}</h3>
                            <button
                                onClick={() => removeProblem(pi)}
                                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Title</label>
                                <input
                                    type="text"
                                    value={problem.title}
                                    onChange={(e) => updateProblem(pi, 'title', e.target.value)}
                                    placeholder="Problem title"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Difficulty</label>
                                <select
                                    value={problem.difficulty}
                                    onChange={(e) => updateProblem(pi, 'difficulty', e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Description</label>
                            <textarea
                                value={problem.description}
                                onChange={(e) => updateProblem(pi, 'description', e.target.value)}
                                placeholder="Describe the problem..."
                                rows={4}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none font-mono"
                            />
                        </div>

                        {/* Test Cases */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 uppercase font-bold">Test Cases</label>
                                <button
                                    onClick={() => addTestCase(pi)}
                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Test Case
                                </button>
                            </div>
                            <div className="space-y-2">
                                {problem.testCases.map((tc, ti) => (
                                    <div key={ti} className="bg-background border border-border/50 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Test Case {ti + 1}</span>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={tc.isHidden}
                                                        onChange={(e) => updateTestCase(pi, ti, 'isHidden', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    Hidden
                                                </label>
                                                <button
                                                    onClick={() => removeTestCase(pi, ti)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] text-gray-600 uppercase block mb-1">Input</label>
                                                <textarea
                                                    value={tc.input}
                                                    onChange={(e) => updateTestCase(pi, ti, 'input', e.target.value)}
                                                    placeholder="1 2 3"
                                                    rows={2}
                                                    className="w-full bg-surface border border-border/50 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-primary resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-600 uppercase block mb-1">Expected Output</label>
                                                <textarea
                                                    value={tc.expectedOutput}
                                                    onChange={(e) => updateTestCase(pi, ti, 'expectedOutput', e.target.value)}
                                                    placeholder="6"
                                                    rows={2}
                                                    className="w-full bg-surface border border-border/50 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-primary resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {problems.length === 0 && (
                    <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center">
                        <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No problems added yet</p>
                        <button
                            onClick={addProblem}
                            className="mt-4 text-primary hover:text-primary/80 text-sm flex items-center gap-1 mx-auto"
                        >
                            <Plus size={14} /> Add your first problem
                        </button>
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => navigate('/contests')}
                    className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Creating...' : 'Create Contest'}
                </button>
            </div>
        </div>
    );
};

export default CreateContest;
