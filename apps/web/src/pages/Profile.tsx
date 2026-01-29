import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, MapPin, Edit2, Check, X, Award, Coins, Flame, Trophy } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setEditData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch user', err);
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/users/profile`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setIsEditing(false);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to update profile', err);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading profile...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface border border-border rounded-2xl p-6 space-y-6"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-3xl bg-primary/20 flex items-center justify-center mb-4 relative group">
                            <span className="text-4xl font-bold text-primary">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold">{user?.username}</h2>
                        <p className="text-gray-500 text-sm">Engineer Rank: #1,204</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                        {!isEditing ? (
                            <>
                                <p className="text-sm text-gray-300 italic">{user?.bio || 'Add a bio to your profile...'}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin size={14} />
                                    <span>{user?.location || 'Unknown Location'}</span>
                                </div>
                                <div className="space-y-2">
                                    {user?.githubUrl && (
                                        <a href={user.githubUrl} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                            <Github size={14} /> GitHub
                                        </a>
                                    )}
                                    {user?.linkedInUrl && (
                                        <a href={user.linkedInUrl} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                            <Linkedin size={14} /> LinkedIn
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm transition-all"
                                >
                                    <Edit2 size={14} /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary min-h-[100px]"
                                />
                                <input
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                    placeholder="Location"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                                <input
                                    value={editData.githubUrl}
                                    onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                                    placeholder="GitHub URL"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                                <input
                                    value={editData.linkedInUrl}
                                    onChange={(e) => setEditData({ ...editData, linkedInUrl: e.target.value })}
                                    placeholder="LinkedIn URL"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold py-2 rounded-lg text-sm transition-all"
                                    >
                                        <Check size={14} /> Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-all"
                                    >
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Stats & Progress */}
                <div className="md:col-span-2 space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Solved', value: user?.solvedCount || 0, icon: Check, color: 'text-accent' },
                            { label: 'Score', value: user?.score || 0, icon: Award, color: 'text-primary' },
                            { label: 'Coins', value: user?.coins || 0, icon: Coins, color: 'text-yellow-500' },
                            { label: 'Streak', value: user?.streak || 0, icon: Flame, color: 'text-orange-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-surface border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-white/20 transition-all"
                            >
                                <stat.icon className={`${stat.color} mb-2`} size={20} />
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Placeholder for Difficulty Stats (matching LeetCode) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-border rounded-2xl p-8"
                    >
                        <h3 className="text-xl font-bold mb-6">Execution Analytics</h3>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-48 h-48 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center relative">
                                <div className="absolute inset-0 border-[12px] border-accent border-t-transparent rounded-full transform -rotate-45" />
                                <span className="text-4xl font-black">{user?.solvedCount || 0}</span>
                                <span className="text-xs text-gray-500 uppercase">SOLVED</span>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                {[
                                    { label: 'Easy', count: user?.solvedEasy || 0, total: 50, color: 'bg-accent' },
                                    { label: 'Medium', count: user?.solvedMedium || 0, total: 80, color: 'bg-orange-400' },
                                    { label: 'Hard', count: user?.solvedHard || 0, total: 30, color: 'bg-red-400' },
                                ].map((diff) => (
                                    <div key={diff.label} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>{diff.label}</span>
                                            <span className="text-gray-400">{diff.count}/{diff.total}</span>
                                        </div>
                                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((diff.count / diff.total) * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full ${diff.color} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Solve Progress Heatmap Placeholder */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">GitHub-style Activity</h3>
                        <div className="grid grid-cols-7 md:grid-cols-24 gap-1">
                            {Array.from({ length: 48 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-full aspect-square rounded-sm ${i % 7 === 0 ? 'bg-accent/40' : i % 5 === 0 ? 'bg-accent/20' : 'bg-white/5'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Badges & Achievements</h3>
                        {user?.badges?.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {user.badges.map((badge: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-2xl shadow-lg relative z-10">
                                            {/* We should map badge IDs to icons, for now generic trophy */}
                                            🏆
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 relative z-10 w-full truncate capitalize">
                                            {badge.replace('_', ' ')}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Trophy className="mx-auto text-gray-600 mb-2 opacity-50" size={32} />
                                <p className="text-gray-500 text-sm">No badges earned yet. Solve more problems!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
