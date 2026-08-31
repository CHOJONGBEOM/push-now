import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Zap, BarChart3, MessageCircle, Bell } from 'lucide-react';

const FloatingCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}> = ({ children, className = '', delay = 0, duration = 6, yOffset = 10 }) => {
  return (
    <div
      className={`absolute ${className} animate-float`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        ['--float-y' as any]: `${yOffset}px`,
      }}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 transition-transform hover:scale-105 duration-300">
        {children}
      </div>
    </div>
  );
};

export const HeroSection: React.FC<{ scrollToExamples: () => void }> = ({ scrollToExamples }) => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-slate-50/50">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-2xl" />
      </div>

      <div className="absolute inset-0 z-0 max-w-[1400px] mx-auto pointer-events-none">
        <FloatingCard className="top-[20%] left-[5%] lg:left-[10%]" delay={0} duration={7}>
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <MessageCircle size={20} />
            </div>
            <div>
              <div className="h-2 w-24 bg-gray-200 rounded mb-1.5" />
              <div className="h-2 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="top-[45%] left-[2%] lg:left-[5%]" delay={1.5} duration={8} yOffset={15}>
          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <div className="h-2 w-12 bg-gray-200 rounded" />
                <div className="h-2 w-8 bg-blue-100 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded" />
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-[20%] left-[8%] lg:left-[12%]" delay={0.5} duration={9}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-gray-600">Click Rate +45%</span>
          </div>
        </FloatingCard>

        <FloatingCard className="top-[15%] right-[5%] lg:right-[10%]" delay={2} duration={8}>
          <div className="min-w-[180px] p-2">
            <div className="flex justify-between items-end h-16 gap-2 mb-2">
              <div className="w-full bg-indigo-100 rounded-t-sm h-[40%]" />
              <div className="w-full bg-indigo-200 rounded-t-sm h-[70%]" />
              <div className="w-full bg-indigo-300 rounded-t-sm h-[50%]" />
              <div className="w-full bg-indigo-500 rounded-t-sm h-[100%]" />
            </div>
            <div className="h-2 w-full bg-gray-100 rounded" />
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-[30%] right-[3%] lg:right-[8%]" delay={1} duration={6} yOffset={-15}>
          <div className="flex items-center gap-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <BarChart3 className="text-indigo-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">Competitor Analysis</div>
              <div className="text-sm font-bold text-gray-900">Weekly Report Ready</div>
            </div>
          </div>
        </FloatingCard>
      </div>

      <main className="relative z-10 w-full max-w-5xl px-6 lg:px-20 text-center">
        {/* Context & Portfolio Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-6 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>30대 남성 기기 환경 실시간 수집 · 1인 풀스택 프로젝트</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.15] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          무신사·올리브영·배민은
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x">
            지금 어떤 푸시를 보낼까?
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up break-keep" style={{ animationDelay: '0.2s' }}>
          카테고리별 주요 대표 앱들의 마케팅 알림을 실시간 수집·분석하여
          <br className="hidden sm:block" />
          경쟁을 피하는 골든아워 타이밍과 고성과 AI 카피를 제안합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/feed"
            className="w-full sm:w-auto bg-gray-900 text-white text-base sm:text-lg font-bold px-8 py-4 rounded-2xl hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-900/20 active:scale-95"
          >
            실시간 푸시 피드 둘러보기 →
          </Link>
          <Link
            to="/story"
            className="w-full sm:w-auto text-gray-700 text-base sm:text-lg font-bold px-8 py-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            개발 스토리 & 아키텍처
          </Link>
          <button
            onClick={scrollToExamples}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 py-2 sm:hidden flex items-center gap-1"
          >
            기능 살펴보기 ↓
          </button>
        </div>
      </main>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <span>© 2026 PushNow</span>
          <a className="hover:text-gray-900 transition-colors" href="#">이용약관</a>
          <a className="hover:text-gray-900 transition-colors" href="#">개인정보처리방침</a>
        </div>
      </div>
    </div>
  );
};
