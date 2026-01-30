import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';

import { useEffect, useState } from 'react';

const Navbar = () => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        const interval = setInterval(checkUser, 1000); // Simple polling as fallback for same-tab updates

        return () => {
            window.removeEventListener('storage', checkUser);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 text-primary font-bold text-xl group">
                    <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-all overflow-hidden border border-primary/20">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="tracking-tight">CodeVamp <span className="text-gray-500 font-light text-sm uppercase tracking-widest ml-1">Pro</span></span>
                </Link>

                <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                    <Link to="/" className="hover:text-white transition-colors">Problems</Link>
                    <Link to="/contests" className="hover:text-white transition-colors">Contests</Link>
                    <Link to="/" className="hover:text-white transition-colors">Leaderboard</Link>

                    {user ? (
                        <div className="flex items-center gap-4 border-l border-border pl-6">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-border hover:bg-white/10 transition-all"
                            >
                                <UserIcon size={14} className="text-primary" />
                                <span className="text-white text-xs">{user.username}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hover:text-red-400 transition-colors"
                                title="Sign out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-md hover:bg-primary/20 transition-all"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
