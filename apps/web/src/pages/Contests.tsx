import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Clock, Users, Plus, ChevronRight, Zap } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

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

const Contests = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [activeContests, setActiveContests] = useState<Contest[]>([]);
    const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const [allRes, activeRes, upcomingRes] = await Promise.all([
                    axios.get(`${API_URL}/contests`),
                    axios.get(`${API_URL}/contests/active`),
                    axios.get(`${API_URL}/contests/upcoming`),
                ]);
                setContests(allRes.data);
                setActiveContests(activeRes.data);
                setUpcomingContests(upcomingRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch contests', err);
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getTimeRemaining = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        if (diff <= 0) return 'Started';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `${hours}h ${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'ended': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Loading contests...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">Contests</h1>
                    <p className="text-gray-500 mt-1">Compete with others in timed coding challenges</p>
                </div>
                <Link
                    to="/contests/create"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                >
                    <Plus size={18} />
                    Create Contest
                </Link>
            </div>

            {/* Active Contests */}
            {activeContests.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="text-green-400" size={20} />
                        <h2 className="text-xl font-bold">Live Now</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeContests.map((contest, i) => (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gradient-to-br from-green-500/10 to-surface border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all cursor-pointer group"
                                onClick={() => navigate(`/contests/${contest._id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-green-400 transition-colors">{contest.title}</h3>
                                        <p className="text-gray-500 text-sm">by {contest.creator?.username || 'Unknown'}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor('active')}`}>
                                        🔴 LIVE
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{contest.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Trophy size={12} /> {contest.problems.length} Problems</span>
                                    <span className="flex items-center gap-1"><Users size={12} /> {contest.participants.length} Participants</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Contests */}
            {upcomingContests.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-blue-400" size={20} />
                        <h2 className="text-xl font-bold">Upcoming</h2>
                    </div>
                    <div className="space-y-3">
                        {upcomingContests.map((contest, i) => (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-surface border border-border rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group flex items-center justify-between"
                                onClick={() => navigate(`/contests/${contest._id}`)}
                            >
                                <div className="flex-1">
                                    <h3 className="font-bold group-hover:text-blue-400 transition-colors">{contest.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={12} /> Starts in {getTimeRemaining(contest.startTime)}</span>
                                        <span className="flex items-center gap-1"><Trophy size={12} /> {contest.problems.length} Problems</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor('upcoming')}`}>
                                        {formatDate(contest.startTime)}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* All Contests */}
            <section>
                <h2 className="text-xl font-bold mb-4">All Contests</h2>
                {contests.length === 0 ? (
                    <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                        <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-400">No contests yet</h3>
                        <p className="text-gray-600 text-sm mt-1">Be the first to create a contest!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contests.map((contest, i) => (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer group flex items-center justify-between"
                                onClick={() => navigate(`/contests/${contest._id}`)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold group-hover:text-primary transition-colors">{contest.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${getStatusColor(contest.status)}`}>
                                            {contest.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                        <span>by {contest.creator?.username || 'Unknown'}</span>
                                        <span className="flex items-center gap-1"><Trophy size={12} /> {contest.problems.length} Problems</span>
                                        <span className="flex items-center gap-1"><Users size={12} /> {contest.participants.length} Joined</span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-primary transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Contests;
