import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const navItems = [
        { name: '추천', nameEn: 'Generate', path: '/generate' },
        { name: '피드', nameEn: 'Feed', path: '/feed' },
        { name: '타이밍', nameEn: 'Timing', path: '/timing' },
        { name: '트렌드', nameEn: 'Trends', path: '/trends' },
        { name: '검토', nameEn: 'Review', path: '/review' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#EDEDF0]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1A3E62] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 20V5h6.5c3.5 0 5.5 2 5.5 5.5c0 3.2-1.8 5.5-5.5 5.5H10v4H7zm3-7h3.5c1.8 0 2.5-1 2.5-2.5S15.3 8 13.5 8H10v5z" />
                                </svg>
                            </div>
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

                        {/* 로그인/프로필 */}
                        <div className="flex items-center gap-4 relative">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        {user.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt="프로필"
                                                className="w-8 h-8 rounded-full border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                                                {(user.email ?? '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute top-12 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 min-w-[160px] z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => { signOut(); setShowDropdown(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="text-sm font-bold px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    로그인
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </>
    );
};
