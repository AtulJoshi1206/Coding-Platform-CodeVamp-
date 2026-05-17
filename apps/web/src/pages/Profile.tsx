import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Github, 
    Linkedin, 
    MapPin, 
    Edit2, 
    Check, 
    X, 
    Award, 
    Coins, 
    Flame, 
    Trophy, 
    Eye, 
    BookOpen, 
    Plus, 
    Trash2, 
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [newSkill, setNewSkill] = useState('');
    const [activeTab, setActiveTab] = useState<'submissions' | 'solved'>('submissions');
    const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setEditData({
                    ...res.data,
                    skills: res.data.skills || [],
                });
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

    const addSkill = () => {
        if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
            const updatedSkills = [...editData.skills, newSkill.trim()];
            setEditData({ ...editData, skills: updatedSkills });
            setNewSkill('');
        }
    };

    const removeSkill = (indexToRemove: number) => {
        const updatedSkills = editData.skills.filter((_: any, idx: number) => idx !== indexToRemove);
        setEditData({ ...editData, skills: updatedSkills });
    };

    // Calculate dynamic ranks and statistics
    const userScore = user?.score || 0;
    const globalRank = Math.max(1, 125304 - Math.floor(userScore * 12.5));
    const easyCount = user?.solvedEasy || 0;
    const mediumCount = user?.solvedMedium || 0;
    const hardCount = user?.solvedHard || 0;
    const totalSolved = user?.solvedCount || 0;
    
    // LeetCode totals
    const totalEasyAvailable = 840;
    const totalMediumAvailable = 1620;
    const totalHardAvailable = 710;
    const totalAvailable = totalEasyAvailable + totalMediumAvailable + totalHardAvailable;

    // Badges definitions
    const badgeMetadata: Record<string, { name: string; icon: string; bg: string; border: string; desc: string }> = {
        first_solve: { name: 'First Solve', icon: '🚀', bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', desc: 'Solved first problem successfully!' },
        solver_10: { name: 'Knight of Code', icon: '🛡️', bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', desc: 'Solved 10 problems successfully' },
        solver_50: { name: 'Grandmaster solver', icon: '👑', bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', desc: 'Solved 50 coding problems' },
        easy_master: { name: 'Easy Champ', icon: '🟢', bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', desc: 'Completed 20 Easy problems' },
        medium_master: { name: 'Medium Beast', icon: '🟠', bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', desc: 'Completed 20 Medium problems' },
        hard_master: { name: 'Hard Conqueror', icon: '🔴', bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', desc: 'Completed 10 Hard problems' },
        streak_3: { name: 'POTD Starter', icon: '🔥', bg: 'from-orange-600/20 to-yellow-600/20', border: 'border-orange-500/30', desc: 'Maintained 3-day POTD solve streak' },
        streak_7: { name: 'Streak Legend', icon: '⚡', bg: 'from-amber-500/20 to-red-500/20', border: 'border-amber-500/30', desc: 'Maintained 7-day POTD solve streak' },
    };

    // Submissions calendar heatmap calculation
    const generateHeatmapData = () => {
        const data = [];
        const days = 365;
        const now = new Date();
        
        // Let's seed deterministic random values based on solvedCount & user properties
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            // Random-ish but deterministic active status
            const dayOfWeek = date.getDay();
            let count = 0;
            const hash = (date.getMonth() * 31 + date.getDate() + (dayOfWeek * 7)) % 100;
            
            if (totalSolved > 0) {
                if (hash < (totalSolved * 4 + 5)) {
                    count = (hash % 4) + 1;
                }
            } else {
                if (hash < 12) {
                    count = 1;
                }
            }
            
            data.push({
                date: dateString,
                count,
                dayOfWeek,
                month: date.getMonth(),
                day: date.getDate()
            });
        }
        return data;
    };

    const heatmapCells = generateHeatmapData();
    const activeDaysCount = heatmapCells.filter(c => c.count > 0).length;
    const maxStreakCount = user?.streak || 0;

    // Heatmap Month labels calculation
    const getMonthLabels = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels: { text: string; colSpan: number }[] = [];
        let currentMonth = -1;
        let count = 0;

        // Group columns of cells into corresponding months
        for (let i = 0; i < heatmapCells.length; i += 7) {
            const cell = heatmapCells[i];
            if (cell.month !== currentMonth) {
                if (currentMonth !== -1) {
                    labels.push({ text: months[currentMonth], colSpan: count });
                }
                currentMonth = cell.month;
                count = 1;
            } else {
                count++;
            }
        }
        labels.push({ text: months[currentMonth], colSpan: count });
        return labels;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>
            <p className="text-gray-400 font-medium">Syncing profile with database...</p>
        </div>
    );

    return (
        <div className="max-w-[1300px] mx-auto px-4 py-6 text-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ─────────────────────────────────────────────────────────────────
                    LEFT COLUMN: Basic Info, Bio, Social, Skills & Community Stats
                   ───────────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-[#1A1F2C] border border-[#2E364F] rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Upper Gradient Banner */}
                        <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/30 to-[#1A1F2C] border-b border-[#2E364F]" />

                        <div className="px-6 pb-6 relative">
                            {/* Avatar section */}
                            <div className="flex flex-col items-center -mt-12 text-center mb-4">
                                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-accent shadow-xl mb-3">
                                    <div className="w-full h-full rounded-full bg-[#0D1117] flex items-center justify-center font-black text-3xl text-primary overflow-hidden">
                                        {user?.username?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1A1F2C] flex items-center justify-center" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-white">{user?.username}</h2>
                                <p className="text-gray-400 text-xs mt-1">Global Coding Rank</p>
                                <div className="text-primary font-black text-lg flex items-center gap-1 mt-0.5">
                                    <Trophy size={16} />
                                    <span>#{globalRank.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Bio, location, social and edit profile */}
                            <div className="space-y-4 pt-4 border-t border-[#2E364F]/50">
                                {!isEditing ? (
                                    <>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-300 bg-[#161B26] p-3 rounded-xl border border-[#2E364F]/40 italic min-h-[60px]">
                                                {user?.bio || 'Introduce yourself to the CodeVamp community...'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 pt-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2.5">
                                                <MapPin size={15} className="text-primary" />
                                                <span>{user?.location || 'Everywhere & Nowhere'}</span>
                                            </div>
                                            {user?.githubUrl && (
                                                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white transition-colors group">
                                                    <Github size={15} className="text-gray-400 group-hover:text-white transition-colors" />
                                                    <span className="truncate">{user.githubUrl.replace(/https?:\/\/(www\.)?github\.com\//, '')}</span>
                                                </a>
                                            )}
                                            {user?.linkedInUrl && (
                                                <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white transition-colors group">
                                                    <Linkedin size={15} className="text-blue-400 group-hover:text-white transition-colors" />
                                                    <span className="truncate">{user.linkedInUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                                                </a>
                                            )}
                                            {user?.twitterUrl && (
                                                <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white transition-colors group">
                                                    <span className="w-[15px] text-[13px] font-bold text-gray-400 group-hover:text-white">𝕏</span>
                                                    <span className="truncate">{user.twitterUrl.replace(/https?:\/\/(www\.)?twitter\.com\//, '').replace(/https?:\/\/(www\.)?x\.com\//, '')}</span>
                                                </a>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full flex items-center justify-center gap-2 bg-[#262E42] hover:bg-[#323D57] border border-[#3E4C6D] py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md active:scale-98"
                                        >
                                            <Edit2 size={14} /> Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3.5 animate-fadeIn">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">Bio Description</label>
                                            <textarea
                                                value={editData.bio}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                placeholder="Tell us about yourself..."
                                                className="w-full bg-[#0D1117] border border-[#2E364F] rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-white min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">Location</label>
                                            <input
                                                value={editData.location}
                                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                placeholder="e.g. India"
                                                className="w-full bg-[#0D1117] border border-[#2E364F] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">GitHub Handle</label>
                                            <input
                                                value={editData.githubUrl}
                                                onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                                                placeholder="https://github.com/your-username"
                                                className="w-full bg-[#0D1117] border border-[#2E364F] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">LinkedIn Link</label>
                                            <input
                                                value={editData.linkedInUrl}
                                                onChange={(e) => setEditData({ ...editData, linkedInUrl: e.target.value })}
                                                placeholder="https://linkedin.com/in/your-profile"
                                                className="w-full bg-[#0D1117] border border-[#2E364F] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">𝕏 / Twitter Link</label>
                                            <input
                                                value={editData.twitterUrl}
                                                onChange={(e) => setEditData({ ...editData, twitterUrl: e.target.value })}
                                                placeholder="https://x.com/your-profile"
                                                className="w-full bg-[#0D1117] border border-[#2E364F] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
                                            />
                                        </div>
                                        
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-black font-bold py-2.5 rounded-xl text-sm transition-all"
                                            >
                                                <Check size={14} /> Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-[#2D161F] text-rose-500 py-2.5 rounded-xl text-sm border border-rose-500/20 hover:bg-[#3D1D2A] transition-all"
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Skills & Technologies Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="bg-[#1A1F2C] border border-[#2E364F] rounded-2xl p-5 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between border-b border-[#2E364F]/50 pb-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Skills & Languages</h3>
                            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                {editData.skills?.length || 0}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(editData.skills && editData.skills.length > 0) ? (
                                editData.skills.map((skill: string, idx: number) => (
                                    <span 
                                        key={idx} 
                                        className="bg-[#161B26] border border-[#2E364F] text-gray-300 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:border-primary/50"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <button 
                                                onClick={() => removeSkill(idx)} 
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 italic py-2">No skills added yet.</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 pt-2">
                                <input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add skill (e.g. C++)"
                                    className="flex-1 bg-[#0D1117] border border-[#2E364F] rounded-lg px-2 py-1 text-xs focus:outline-none text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <button
                                    onClick={addSkill}
                                    className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-3 rounded-lg text-xs font-bold"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Community & Engagement Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="bg-[#1A1F2C] border border-[#2E364F] rounded-2xl p-5 shadow-2xl space-y-4"
                    >
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-[#2E364F]/50 pb-3">
                            Platform Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#161B26] p-3 rounded-xl border border-[#2E364F]/40 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                                    <Eye size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Profile Views</p>
                                    <p className="text-lg font-black text-white">{Math.floor(userScore * 1.5) + 12}</p>
                                </div>
                            </div>
                            <div className="bg-[#161B26] p-3 rounded-xl border border-[#2E364F]/40 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Solutions</p>
                                    <p className="text-lg font-black text-white">{user?.solvedCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ─────────────────────────────────────────────────────────────────
                    RIGHT COLUMN: Dynamic LeetCode widgets
                   ───────────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* LeetCode style: Top Row Stats Widget */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Solved', value: user?.solvedCount || 0, icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'hover:border-emerald-500/30' },
                            { label: 'Score', value: user?.score || 0, icon: Award, color: 'text-primary', bg: 'bg-primary/5', border: 'hover:border-primary/30' },
                            { label: 'Coins', value: user?.coins || 0, icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'hover:border-yellow-500/30' },
                            { label: 'Streak', value: user?.streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'hover:border-orange-500/30' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-[#1A1F2C] border border-[#2E364F] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 shadow-md ${stat.bg} ${stat.border}`}
                            >
                                <div className="p-2 rounded-xl bg-[#0D1117] border border-[#2E364F]/50 mb-2">
                                    <stat.icon className={`${stat.color}`} size={18} />
                                </div>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* LeetCode Rating Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1A1F2C] border border-[#2E364F] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2E364F]/60">
                            {/* Card 1: Contest Rating */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Contest Rating</p>
                                        <h4 className="text-3xl font-black text-[#FFB020] mt-0.5">
                                            {userScore > 0 ? (1400 + Math.floor(userScore * 1.5)).toLocaleString() : '1,500'}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Global Ranking</p>
                                        <p className="text-xs font-bold text-gray-300 mt-0.5">
                                            {userScore > 0 ? `${(globalRank + 2500).toLocaleString()} / 874,349` : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Custom Rating Sparkline Representation */}
                                <div className="h-20 w-full bg-[#161B26] border border-[#2E364F]/40 rounded-xl relative overflow-hidden flex items-end">
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                                        <path 
                                            d={`M0 25 C 20 ${userScore > 20 ? 15 : 22}, 40 ${userScore > 50 ? 8 : 18}, 70 ${userScore > 100 ? 4 : 12}, 100 ${userScore > 200 ? 2 : 10}`} 
                                            fill="none" 
                                            stroke="url(#sparkline-grad)" 
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#FFA116" />
                                                <stop offset="100%" stopColor="#FFB020" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
                                    <div className="flex justify-between w-full text-[9px] text-gray-500 font-bold px-3 pb-1 relative z-10">
                                        <span>Jan 2026</span>
                                        <span>Mar 2026</span>
                                        <span>May 2026</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Rating Distribution */}
                            <div className="p-6 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-gray-400">Rating Distribution</p>
                                        <span className="text-xs text-primary font-black bg-primary/10 px-2 py-0.5 rounded">
                                            Top {userScore > 200 ? '0.84%' : userScore > 100 ? '1.53%' : '8.4%'}
                                        </span>
                                    </div>
                                    
                                    {/* Simulated bell curve rating graph */}
                                    <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                                        {[20, 35, 55, 85, 95, 75, 45, 25, 10].map((val, idx) => {
                                            const isHighlight = idx === (userScore > 150 ? 5 : userScore > 50 ? 4 : 3);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="flex-1 rounded-t bg-gray-500/20 relative"
                                                    style={{ height: `${val}%` }}
                                                >
                                                    {isHighlight && (
                                                        <div className="absolute inset-0 bg-gradient-to-t from-primary to-accent rounded-t animate-pulse" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 font-bold mt-2">
                                    <span>1000</span>
                                    <span>1500 (Base)</span>
                                    <span>2500+</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Solved Problems Concentric Circle & Levels Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Solved Progress Circle */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="md:col-span-7 bg-[#1A1F2C] border border-[#2E364F] rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-[#2E364F]/50 pb-3 mb-6">
                                Execution Analytics
                            </h3>

                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                {/* LeetCode Circle Progress */}
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        {/* Outer circle backdrop */}
                                        <circle cx="72" cy="72" r="58" strokeWidth="9" stroke="#161B26" fill="transparent" />
                                        {/* Dynamic solved circle mapping */}
                                        <circle 
                                            cx="72" cy="72" r="58" 
                                            strokeWidth="9" 
                                            stroke="url(#emerald-grad)" 
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 58}`}
                                            strokeDashoffset={`${2 * Math.PI * 58 * (1 - Math.min(totalSolved / Math.max(1, totalAvailable), 1))}`}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="emerald-grad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#10B981" />
                                                <stop offset="100%" stopColor="#34D399" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{totalSolved}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Solved</span>
                                    </div>
                                </div>

                                {/* Difficulties progress meters */}
                                <div className="flex-1 space-y-3.5 w-full">
                                    {[
                                        { label: 'Easy', count: easyCount, total: 30, color: 'bg-emerald-500', text: 'text-emerald-400' },
                                        { label: 'Medium', count: mediumCount, total: 40, color: 'bg-orange-500', text: 'text-orange-400' },
                                        { label: 'Hard', count: hardCount, total: 15, color: 'bg-rose-500', text: 'text-rose-400' },
                                    ].map((diff) => {
                                        const percentage = Math.min((diff.count / diff.total) * 100, 100);
                                        return (
                                            <div key={diff.label} className="space-y-1 group">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className={diff.text}>{diff.label}</span>
                                                    <span className="text-gray-400 group-hover:text-white transition-colors">
                                                        {diff.count} <span className="text-gray-600">/ {diff.total}</span>
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-[#161B26] rounded-full overflow-hidden border border-[#2E364F]/30">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                        className={`h-full ${diff.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Badges Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="md:col-span-5 bg-[#1A1F2C] border border-[#2E364F] rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
                        >
                            <div className="border-b border-[#2E364F]/50 pb-3 mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                    Badges earned
                                </h3>
                                <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                                    {user?.badges?.length || 0}
                                </span>
                            </div>

                            {user?.badges?.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {user.badges.slice(0, 6).map((badgeId: string, idx: number) => {
                                        const metadata = badgeMetadata[badgeId] || { name: badgeId, icon: '🏆', bg: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30', desc: 'Achievement unlocked!' };
                                        return (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.1, rotate: 2 }}
                                                className={`bg-gradient-to-br ${metadata.bg} border ${metadata.border} rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-help relative group`}
                                            >
                                                <span className="text-3xl filter drop-shadow">{metadata.icon}</span>
                                                <p className="text-[9px] font-bold text-white mt-1 w-full truncate capitalize">
                                                    {metadata.name}
                                                </p>

                                                {/* Tooltip detail element */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-black border border-[#2E364F] rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[9px] text-gray-400 leading-normal z-50 shadow-2xl">
                                                    <p className="font-bold text-white mb-0.5">{metadata.name}</p>
                                                    <p>{metadata.desc}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 flex flex-col items-center justify-center">
                                    <Trophy className="text-gray-600 mb-2 opacity-40 animate-pulse" size={28} />
                                    <p className="text-gray-500 text-xs font-semibold">Earn badges by solving problems!</p>
                                </div>
                            )}

                            <div className="text-center mt-3 pt-3 border-t border-[#2E364F]/30">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                                    Streak status: {user?.streak || 0} active days
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* LeetCode Heatmap submission calendar */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1A1F2C] border border-[#2E364F] rounded-2xl p-5 shadow-2xl relative"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2E364F]/50 pb-4 mb-4 gap-2">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                    Activity Calendar
                                </h3>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                    {activeDaysCount} active days in the past one year
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div>
                                    <span className="text-gray-500 mr-1.5 uppercase font-medium text-[10px]">Max Streak:</span>
                                    <span className="text-orange-500 font-black">{maxStreakCount} days</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 mr-1.5 uppercase font-medium text-[10px]">Current Streak:</span>
                                    <span className="text-primary font-black">{user?.streak || 0} days</span>
                                </div>
                            </div>
                        </div>

                        {/* Submission Calendar Grid */}
                        <div className="overflow-x-auto pb-2">
                            <div className="min-w-[650px] flex flex-col">
                                {/* Months Header */}
                                <div className="flex pl-8 mb-1 text-[10px] text-gray-500 font-bold">
                                    {getMonthLabels().map((label, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ width: `${(label.colSpan / 53) * 100}%` }}
                                            className="truncate"
                                        >
                                            {label.text}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex">
                                    {/* Days labels */}
                                    <div className="flex flex-col justify-between text-[9px] text-gray-600 font-bold pr-2.5 h-20 py-0.5 w-8">
                                        <span>Mon</span>
                                        <span>Wed</span>
                                        <span>Fri</span>
                                    </div>

                                    {/* Cells Container */}
                                    <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 h-20">
                                        {heatmapCells.map((cell, idx) => {
                                            let cellBg = 'bg-[#161B26] hover:border-gray-500 border border-transparent';
                                            if (cell.count === 1) cellBg = 'bg-emerald-900/60 hover:bg-emerald-950 border border-emerald-900/80';
                                            else if (cell.count === 2) cellBg = 'bg-emerald-700/80 hover:bg-emerald-800 border border-emerald-700/90';
                                            else if (cell.count >= 3) cellBg = 'bg-primary hover:bg-emerald-400 border border-emerald-400';

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`w-2.5 h-2.5 rounded-sm transition-colors cursor-pointer relative group ${cellBg}`}
                                                    onClick={() => setSelectedHeatmapCell(cell)}
                                                >
                                                    {/* Floating hover tooltip */}
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0D1117] border border-[#2E364F] text-[9px] font-bold text-white px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                                                        {cell.count > 0 ? `${cell.count} submission${cell.count > 1 ? 's' : ''}` : 'No submissions'} on {cell.date}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Footer Legend */}
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold pt-4 border-t border-[#2E364F]/30 mt-2">
                            <span>Interactive activity viewer</span>
                            <div className="flex items-center gap-1.5">
                                <span>Less</span>
                                <div className="w-2.5 h-2.5 bg-[#161B26] rounded-sm" />
                                <div className="w-2.5 h-2.5 bg-emerald-900/60 rounded-sm" />
                                <div className="w-2.5 h-2.5 bg-emerald-700/80 rounded-sm" />
                                <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
                                <span>More</span>
                            </div>
                        </div>

                        {/* Selected cell details modal */}
                        <AnimatePresence>
                            {selectedHeatmapCell && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute inset-x-5 bottom-5 bg-[#0D1117] border border-[#2E364F] p-4 rounded-xl flex items-center justify-between z-40"
                                >
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold">Activity details for {selectedHeatmapCell.date}</p>
                                        <p className="text-sm font-bold text-white mt-1">
                                            {selectedHeatmapCell.count > 0 
                                                ? `Completed ${selectedHeatmapCell.count} test evaluations successfully.` 
                                                : 'No coding sessions recorded on this day.'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedHeatmapCell(null)}
                                        className="text-gray-400 hover:text-white p-1"
                                    >
                                        <X size={15} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
