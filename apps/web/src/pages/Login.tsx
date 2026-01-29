import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Terminal } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -ml-16 -mt-16" />

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                        <Terminal className="text-primary" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-gray-400 text-sm mt-1">Ready for your next challenge?</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                            <a href="#" className="text-[10px] text-primary hover:underline">Forgot?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-black font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? 'ESTABLISHING CONNECTION...' : 'ACCESS PLATFORM'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border flex justify-center text-sm">
                    <span className="text-gray-500">New around here?</span>
                    <Link to="/signup" className="text-primary hover:underline ml-2">Create Account</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
