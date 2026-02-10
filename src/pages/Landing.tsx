import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PushFeedColumn } from '../components/landing/PushFeedColumn';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* 좌측 콘텐츠 패널 (5/8 = 62.5%) */}
                <main className="w-[62.5%] h-full flex items-center relative z-10 bg-white">
                    <div className="w-full px-12 lg:px-20 xl:px-28">
                        {/* Hero Section */}
                        <section className="max-w-2xl">
                            <h1 className="text-black text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-8">
                                푸시메시지,
                                <br />
                                더이상 고민하지 마세요.
                            </h1>
                            <p className="text-[#6E6E73] text-lg lg:text-xl xl:text-2xl font-medium leading-relaxed mb-12 max-w-lg">
                                실시간 인텔리전스로 경쟁사 푸시 전략을 추적, 분석하고 능가하세요.
                                단 하나의 대시보드로 모든 것을 관리합니다.
                            </p>
                            <div className="flex items-center gap-6">
                                <Link
                                    to="/generate"
                                    className="bg-black text-white text-base lg:text-lg font-bold px-10 lg:px-12 py-4 lg:py-5 rounded-full hover:bg-zinc-800 transition-all shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 hover:scale-[1.02]"
                                >
                                    메시지 작성하기
                                </Link>
                            </div>
                        </section>

                        {/* Footer - 절대 위치로 하단 고정 */}
                        <footer className="absolute bottom-8 left-12 lg:left-20 xl:left-28 flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            <span>© 2026 PushNow</span>
                            <div className="flex gap-8">
                                <a className="hover:text-black transition-colors" href="#">
                                    이용약관
                                </a>
                                <a className="hover:text-black transition-colors" href="#">
                                    개인정보처리방침
                                </a>
                            </div>
                        </footer>
                    </div>
                </main>

                {/* 우측 앱 프리뷰 패널 (3/8 = 37.5%) */}
                <aside className="w-[37.5%] h-full relative bg-[#F8F8FA] border-l border-[#EDEDF0] overflow-hidden">
                    <div className="absolute inset-0 flex gap-3 p-6 mask-edge">
                        {/* 첫 번째 컬럼 (느림) */}
                        <PushFeedColumn speed="slow" />

                        {/* 두 번째 컬럼 (빠름) */}
                        <PushFeedColumn speed="fast" delay="0s" />
                    </div>

                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 to-transparent"></div>
                </aside>
            </div>
        </div>
    );
};
