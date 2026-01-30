import { Github, Twitter, Linkedin, Heart, Terminal } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-border mt-20 py-12 bg-surface/30 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <Terminal className="text-primary" size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">CodeVamp<span className="text-primary">.</span></span>
                        </div>
                        <p className="text-gray-400 max-w-sm text-sm">
                            The next-generation coding platform built for speed, performance, and developer experience. Master algorithms, compete in real-time, and level up your skills.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/" className="hover:text-primary transition-colors">Problems</a></li>
                            <li><a href="/contests" className="hover:text-primary transition-colors">Contests</a></li>
                            <li><a href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-background border border-border rounded-lg hover:border-primary transition-colors group">
                                <Github size={18} className="text-gray-400 group-hover:text-primary" />
                            </a>
                            <a href="#" className="p-2 bg-background border border-border rounded-lg hover:border-primary transition-colors group">
                                <Twitter size={18} className="text-gray-400 group-hover:text-primary" />
                            </a>
                            <a href="#" className="p-2 bg-background border border-border rounded-lg hover:border-primary transition-colors group">
                                <Linkedin size={18} className="text-gray-400 group-hover:text-primary" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} CodeVamp. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Made with</span>
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span>by</span>
                        <a
                            href="https://github.com/AtulJoshi1206"
                            target="_blank"
                            className="text-white hover:text-primary transition-colors font-semibold"
                        >
                            Atul Joshi
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
