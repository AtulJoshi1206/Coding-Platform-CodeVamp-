import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Clock, Users, ChevronLeft, Play, Award } from 'lucide-react';
import axios from 'axios';

interface Contest {
    _id: string;
    title: string;
    description: string;
    creator: { username: string };
    startTime: string;
    endTime: string;
    problems: any[];
    participants: string[];
    status: string;
}

interface LeaderboardEntry {
    username: string;
    solved: number;
    totalTime: number;
}

const ContestDetail = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const [contestRes, leaderboardRes] = await Promise.all([
                    axios.get(`${API_URL}/contests/${contestId}`),
                    axios.get(`${API_URL}/contests/${contestId}/leaderboard`),
                ]);
                setContest(contestRes.data);
                setLeaderboard(leaderboardRes.data);

                // Check if user has joined
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user._id && contestRes.data.participants.some((p: any) => p === user._id || p._id === user._id)) {
                    setHasJoined(true);
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch contest', err);
                setLoading(false);
            }
        };
        fetchContest();
    }, [contestId]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/contests/${contestId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHasJoined(true);
        } catch (err) {
            console.error('Failed to join contest', err);
        }
        setJoining(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getTimeRemaining = () => {
        if (!contest) return '';
        const now = Date.now();
        const start = new Date(contest.startTime).getTime();
        const end = new Date(contest.endTime).getTime();

        if (now < start) {
            const diff = start - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `Starts in ${hours}h ${minutes}m`;
        } else if (now < end) {
            const diff = end - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m remaining`;
        }
        return 'Contest ended';
    };

    const isContestActive = () => {
        if (!contest) return false;
        const now = Date.now();
        return now >= new Date(contest.startTime).getTime() && now <= new Date(contest.endTime).getTime();
    };

    const isContestUpcoming = () => {
        if (!contest) return false;
        return Date.now() < new Date(contest.startTime).getTime();
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Loading contest...</div>;
    }

    if (!contest) {
        return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Contest not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button onClick={() => navigate('/contests')} className="text-gray-500 hover:text-white transition-colors mt-1">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black">{contest.title}</h1>
                        <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${contest.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            contest.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                            {contest.status}
                        </span>
                    </div>
                    <p className="text-gray-500">Created by {contest.creator?.username || 'Unknown'}</p>
                </div>
                {!hasJoined && (isContestActive() || isContestUpcoming()) && (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        <Play size={18} />
                        {joining ? 'Joining...' : 'Join Contest'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contest Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <p className="text-gray-300 leading-relaxed">{contest.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                            <div className="text-center">
                                <Clock className="mx-auto text-primary mb-2" size={20} />
                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                <p className="font-bold text-sm">{getTimeRemaining()}</p>
                            </div>
                            <div className="text-center">
                                <Trophy className="mx-auto text-yellow-500 mb-2" size={20} />
                                <p className="text-xs text-gray-500 uppercase">Problems</p>
                                <p className="font-bold text-sm">{contest.problems.length}</p>
                            </div>
                            <div className="text-center">
                                <Users className="mx-auto text-blue-400 mb-2" size={20} />
                                <p className="text-xs text-gray-500 uppercase">Participants</p>
                                <p className="font-bold text-sm">{contest.participants.length}</p>
                            </div>
                            <div className="text-center">
                                <Calendar className="mx-auto text-purple-400 mb-2" size={20} />
                                <p className="text-xs text-gray-500 uppercase">Duration</p>
                                <p className="font-bold text-sm">
                                    {Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60))}h
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Problems */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-4">Problems</h2>
                        {!isContestActive() && isContestUpcoming() ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="mx-auto mb-4" size={32} />
                                <p>Problems will be revealed when the contest starts</p>
                                <p className="text-sm mt-1">{formatDate(contest.startTime)}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contest.problems.map((problem, i) => (
                                    <div
                                        key={i}
                                        className="bg-background border border-border/50 rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group"
                                        onClick={() => hasJoined && isContestActive() && navigate(`/contests/${contestId}/problem/${i}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold group-hover:text-primary transition-colors">{problem.title}</h3>
                                                <span className={`text-xs ${problem.difficulty === 'Easy' ? 'text-green-400' :
                                                    problem.difficulty === 'Medium' ? 'text-orange-400' : 'text-red-400'
                                                    }`}>{problem.difficulty}</span>
                                            </div>
                                        </div>
                                        {hasJoined && isContestActive() && (
                                            <Play size={16} className="text-gray-600 group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar - Leaderboard */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Award className="text-yellow-500" size={20} />
                            Leaderboard
                        </h2>
                        {leaderboard.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No submissions yet</p>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.slice(0, 10).map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                            i === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                                                i === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                                                    'bg-white/5'
                                            }`}
                                    >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                                            i === 1 ? 'bg-gray-400 text-black' :
                                                i === 2 ? 'bg-orange-500 text-black' :
                                                    'bg-white/10 text-gray-400'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 font-medium text-sm">{entry.username}</span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-accent">{entry.solved}</p>
                                            <p className="text-[10px] text-gray-500">{Math.round(entry.totalTime / 1000)}s</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Schedule */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h3 className="font-bold mb-4">Schedule</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Starts</p>
                                    <p className="font-medium">{formatDate(contest.startTime)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Ends</p>
                                    <p className="font-medium">{formatDate(contest.endTime)}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContestDetail;
