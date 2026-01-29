import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flame, Search } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

interface Problem {
    _id: string;
    title: string;
    difficulty: string;
    status: string;
}

interface TopUser {
    _id: string;
    username: string;
    score: number;
}

const Dashboard = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [topUsers, setTopUsers] = useState<TopUser[]>([]);
    const [user, setUser] = useState<any>(null);
    const [potd, setPotd] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get(`${API_URL}/problems`);
                setProblems(res.data);
            } catch (err) {
                console.error('Failed to fetch problems', err);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/leaderboard`);
                setTopUsers(res.data);
            } catch (err) {
                console.error('Failed to fetch leaderboard', err);
            }
        };

        const fetchPOTD = async () => {
            try {
                const res = await axios.get(`${API_URL}/potd`);
                setPotd(res.data);
            } catch (err) {
                console.error('Failed to fetch POTD', err);
            }
        };

        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to fetch user', err);
                }
            }
        };

        fetchProblems();
        fetchLeaderboard();
        fetchPOTD();
        fetchUser();

        const socket = io(API_URL);
        socket.on('leaderboardUpdate', (data: TopUser[]) => {
            setTopUsers(data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, Engineer</h1>
                    <p className="text-gray-400 mt-2">Level up your skills with production-ready challenges.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-surface border border-border rounded-lg py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Stats Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Flame className="text-orange-500" size={20} /> Current Streak
                        </h3>
                        <p className="text-4xl font-black mt-4">{user?.streak || 0} <small className="text-sm font-normal text-gray-500">Days</small></p>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <div className="flex-1 bg-background border border-border p-4 rounded-xl">
                            <p className="text-gray-500 text-xs">SOLVED</p>
                            <p className="text-xl font-bold">{user?.solvedCount || 0}</p>
                        </div>
                        <div className="flex-1 bg-background border border-border p-4 rounded-xl">
                            <p className="text-gray-500 text-xs">ACCURACY</p>
                            <p className="text-xl font-bold">{user?.accuracy || '0.0'}%</p>
                        </div>
                        <div className="flex-1 bg-background border border-border p-4 rounded-xl">
                            <p className="text-gray-500 text-xs">SCORE</p>
                            <p className="text-xl font-bold">{user?.score || 0}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Small Leaderboard Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-surface border border-border p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Trophy className="text-accent" size={20} /> Hall of Fame
                    </h3>
                    <div className="space-y-4">
                        {topUsers.map((u, i) => (
                            <div key={u._id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500">#{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                                        {u.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span>{u.username}</span>
                                </div>
                                <span className="font-mono text-accent">{u.score}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* POTD Card */}
                {potd && (
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-3 bg-gradient-to-r from-purple-900/20 to-surface border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer"
                        onClick={() => navigate(`/ide/${potd.problem?._id}`)}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full" />
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30 uppercase font-bold tracking-wider">
                                        Daily Challenge
                                    </span>
                                    <span className="text-gray-500 text-xs">{new Date(potd.date).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{potd.problem?.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-1">{potd.problem?.description}</p>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                    <span className={`px-2 py-0.5 rounded border ${potd.problem?.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        potd.problem?.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {potd.problem?.difficulty}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Trophy size={12} /> {potd.solvedCount} Solved
                                    </span>
                                </div>
                            </div>
                            <button className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform flex items-center gap-2">
                                Solve Now <Flame size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Problems List */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase">Difficulty</th>
                            <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((prob) => (
                            <tr key={prob._id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className={`w-2 h-2 rounded-full ${user?.solvedProblems?.includes(prob._id) ? 'bg-green-500' : 'bg-gray-700'}`} />
                                </td>
                                <td className="px-6 py-4 font-medium">{prob.title}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={
                                        prob.difficulty === 'Easy' ? 'text-accent' :
                                            prob.difficulty === 'Medium' ? 'text-orange-400' : 'text-red-400'
                                    }>
                                        {prob.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/ide/${prob._id}`)}
                                        className="opacity-0 group-hover:opacity-100 bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-md transition-all"
                                    >
                                        SOLVE
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
