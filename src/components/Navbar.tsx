import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { name: '추천', nameEn: 'Generate', path: '/generate' },
        { name: '피드', nameEn: 'Feed', path: '/feed' },
        { name: '타이밍', nameEn: 'Timing', path: '/timing' },
        { name: '트렌드', nameEn: 'Trends', path: '/trends' },
        { name: '검토', nameEn: 'Review', path: '/review' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#EDEDF0]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="2" fill="none" />
                            <path d="M8 12L12 8L16 12M12 8V16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xl font-black">PushNow</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative text-sm font-bold transition-colors ${isActive(item.path)
                                    ? 'text-black'
                                    : 'text-zinc-400 hover:text-black'
                                    }`}
                            >
                                <span className="block">{item.name}</span>
                                <span className="block text-[10px] uppercase tracking-widest opacity-60">
                                    {item.nameEn}
                                </span>
                                {isActive(item.path) && (
                                    <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-black"></div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                            👤
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
