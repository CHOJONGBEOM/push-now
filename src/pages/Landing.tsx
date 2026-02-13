import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sparkles, Clock, TrendingUp, Rss, FileCheck } from 'lucide-react';
import { HeroSection } from '../components/landing/HeroSection';

const useTypingEffect = (texts: string[], typingSpeed = 50, deletingSpeed = 30, pauseDuration = 2000) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentText = texts[currentIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentText) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    } else {
      timeout = setTimeout(() => {
        if (isDeleting) {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        } else {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return { displayText, showCursor };
};

const useCountUp = (end: number, duration = 2000, startWhen = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startWhen) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(end * easeOut));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startWhen]);

  return count;
};

const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '50px' },
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return { ref, isVisible };
};

const AIMessageDemo: React.FC = () => {
  const messages = [
    '🔥 마지막 기회! 인기 상품 최대 50% 할인\n오늘만 적용되는 혜택, 지금 확인해보세요.',
    '✨ 회원 취향 기반 추천이 도착했어요\n관심 상품과 비슷한 아이템을 모아봤습니다.',
    '⏰ 단 24시간, 시즌 특가 오픈\n지금 확인하면 더 좋은 조건으로 구매할 수 있어요.',
  ];
  const { displayText, showCursor } = useTypingEffect(messages, 40, 20, 1500);
  const { ref, isVisible } = useScrollAnimation();
  const lines = displayText.split('\n');

  return (
    <div ref={ref} className={`pt-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold transition-all ${isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-180'}`}>
            AI
          </div>
          <div className="flex-1 min-h-[80px]">
            <p className="text-sm text-gray-500 mb-1">생성된 메시지 예시</p>
            <p className="font-bold text-gray-900">
              {lines[0]}
              {showCursor && lines.length === 1 && <span className="animate-pulse">|</span>}
            </p>
            {lines[1] && (
              <p className="text-sm text-gray-600 mt-1">
                {lines[1]}
                {showCursor && <span className="animate-pulse">|</span>}
              </p>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 text-xs text-violet-600 bg-violet-50 px-3 py-2 rounded-lg transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>전략과 톤 조건을 반영해 자동 생성</span>
        </div>
      </div>
    </div>
  );
};

const WizardStepsAnimation: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setActiveStep((prev) => (prev + 1) % 5), 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const items = [
    { emoji: '👗', title: '패션/뷰티', desc: '의류, 신발, 뷰티' },
    { emoji: '🛒', title: '종합 이커머스', desc: '식품, 생활용품, 리빙' },
    { emoji: '✈️', title: '여행/숙박', desc: '항공, 호텔, 액티비티' },
  ];

  return (
    <div ref={ref} className="relative">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((step, i) => (
              <div key={step} className={`h-2 flex-1 rounded-full transition-all duration-500 ${i <= activeStep ? 'bg-violet-500' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const active = activeStep === idx + 1;
              return (
                <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${active ? 'bg-violet-50 border-violet-500 scale-105' : 'bg-gray-50 border-transparent hover:border-violet-300 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimatedHeatmap: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();
  const goldenHourCount = useCountUp(40, 1500, isVisible);

  const generateIntensity = (hour: number): number => {
    const baseIntensity = Math.random() * 0.3;
    if ((hour >= 3 && hour <= 5) || (hour >= 8 && hour <= 10)) return baseIntensity + 0.6;
    return baseIntensity + 0.3;
  };

  return (
    <div ref={ref} className="relative">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-gray-900">요일×시간대 발송 패턴</h4>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded bg-blue-200" />
            <div className="w-3 h-3 rounded bg-orange-400" />
            <div className="w-3 h-3 rounded bg-red-500" />
          </div>
        </div>

        <div className="space-y-1">
          {['월', '화', '수', '목', '금'].map((day) => (
            <div key={day} className="flex gap-1 items-center">
              <span className="text-xs w-6 text-gray-500 font-medium">{day}</span>
              <div className="flex gap-1 flex-1">
                {Array.from({ length: 12 }).map((_, j) => {
                  const intensity = generateIntensity(j);
                  return (
                    <div
                      key={j}
                      className={`flex-1 h-6 rounded transition-all duration-300 ${intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-orange-400' : 'bg-blue-200'}`}
                      style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'scale(1)' : 'scale(0.5)' }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '1s' }}>
          <p className="text-sm font-bold text-yellow-900 mb-1">추천 발송 시간 예시</p>
          <p className="text-xs text-yellow-700">화요일 오전 10시대 경쟁사 발송 비중 {goldenHourCount}%</p>
        </div>
      </div>
    </div>
  );
};

const StrategyDistributionDemo: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();

  const strategies = [
    { label: '할인/프로모션', percentage: 38, color: 'bg-rose-500' },
    { label: '신규/업데이트', percentage: 27, color: 'bg-blue-500' },
    { label: '재방문 유도', percentage: 20, color: 'bg-amber-500' },
    { label: '정보 제공', percentage: 15, color: 'bg-emerald-500' },
  ];

  const triggers = [
    { label: '긴급성', emoji: '⏰', active: true },
    { label: 'FOMO', emoji: '🔥', active: true },
    { label: '호기심', emoji: '🤔', active: false },
    { label: '사회적 증거', emoji: '👥', active: false },
    { label: '개인화', emoji: '🎯', active: true },
    { label: '희소성', emoji: '💎', active: false },
  ];

  return (
    <div ref={ref} className="relative">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <h4 className="font-bold text-gray-900 mb-2">마케팅 전략 분포</h4>
        <p className="text-xs text-gray-500 mb-5">실수집 메시지 기반 자동 분류</p>

        {/* 전략 분포 바 */}
        <div className="flex h-4 rounded-full overflow-hidden mb-4">
          {strategies.map((s, i) => (
            <div
              key={s.label}
              className={`${s.color} transition-all duration-1000 ease-out`}
              style={{
                width: isVisible ? `${s.percentage}%` : '0%',
                transitionDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {strategies.map((s, i) => {
            const pct = useCountUp(s.percentage, 1200, isVisible);
            return (
              <div
                key={s.label}
                className="flex items-center gap-2 transition-all duration-500"
                style={{ opacity: isVisible ? 1 : 0, transitionDelay: `${i * 0.1}s` }}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-xs text-gray-600">{s.label}</span>
                <span className="text-xs font-bold text-gray-900 ml-auto">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* 심리 트리거 태그 */}
        <div className="pt-5 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">심리 트리거 TOP</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((t, i) => (
              <span
                key={t.label}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
                  t.active
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                  transitionDelay: `${0.6 + i * 0.08}s`,
                }}
              >
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedDemo: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeDate, setActiveDate] = useState(14);

  const messages = [
    { app: '무신사', icon: 'M', color: 'bg-black text-white', title: '오늘만! 봄 신상 최대 40%', body: '시즌 프리오더 마감 임박', time: '10:32', tag: '프로모션' },
    { app: '올리브영', icon: 'O', color: 'bg-green-500 text-white', title: '회원 전용 쿠폰이 도착했어요', body: '오늘 자정까지만 사용 가능', time: '14:15', tag: '혜택' },
    { app: '배달의민족', icon: 'B', color: 'bg-cyan-500 text-white', title: '점심 특가 마감 임박', body: '11시~14시 한정 배달비 무료', time: '11:45', tag: '긴급' },
    { app: '토스', icon: 'T', color: 'bg-blue-600 text-white', title: '이번 달 소비 리포트 도착', body: '지난달보다 12% 절약했어요', time: '09:00', tag: '정보' },
  ];

  const calendarDays = Array.from({ length: 28 }, (_, i) => i + 1);
  const activeDays = [3, 5, 7, 8, 12, 14, 15, 19, 21, 22, 25, 27];

  return (
    <div ref={ref} className="relative">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        {/* 미니 캘린더 */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">2025년 2월</h4>
          <div className="flex gap-1">
            {['전체', '프로모션', '혜택'].map((f, i) => (
              <span key={f} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-5">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
          ))}
          {calendarDays.map(day => {
            const hasData = activeDays.includes(day);
            const isActive = day === activeDate;
            return (
              <button
                key={day}
                onClick={() => setActiveDate(day)}
                className={`relative text-xs py-1.5 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-orange-500 text-white font-bold' :
                  hasData ? 'text-gray-900 hover:bg-orange-50 font-medium' : 'text-gray-300'
                }`}
                style={{ opacity: isVisible ? 1 : 0, transitionDelay: `${day * 0.02}s` }}
              >
                {day}
                {hasData && !isActive && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* 메시지 리스트 */}
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={msg.app}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl transition-all duration-500 hover:bg-orange-50/50"
              style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)', transitionDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className={`w-8 h-8 ${msg.color} rounded-lg flex items-center justify-center text-xs font-bold shrink-0`}>
                {msg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{msg.title}</p>
                <p className="text-xs text-gray-400 truncate">{msg.body}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-400">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReviewDemo: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className="relative">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        {/* A/B 탭 */}
        <div className="flex gap-2 mb-5">
          <span className="px-4 py-1.5 bg-cyan-500 text-white rounded-full text-sm font-bold">A안</span>
          <span className="px-4 py-1.5 bg-gray-200 text-gray-500 rounded-full text-sm font-medium">B안</span>
        </div>

        {/* 푸시 프리뷰 */}
        <div className={`bg-gray-100 rounded-2xl p-4 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.2s' }}>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-violet-500 rounded flex items-center justify-center text-[8px] text-white font-bold">A</div>
              <span className="text-xs text-gray-500">앱 이름</span>
              <span className="text-xs text-gray-400 ml-auto">지금</span>
            </div>
            <p className="text-sm font-bold text-gray-900">지금 확인하세요! 시즌 특가 오픈</p>
            <p className="text-xs text-gray-600 mt-1">오늘만 적용되는 특별 할인, 놓치지 마세요</p>
          </div>
        </div>

        {/* 분석 지표 */}
        <div className={`grid grid-cols-3 gap-3 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.4s' }}>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-black text-gray-900">14</p>
            <p className="text-[10px] text-gray-500">제목 글자수</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-black text-gray-900">22</p>
            <p className="text-[10px] text-gray-500">본문 글자수</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-black text-gray-900">1</p>
            <p className="text-[10px] text-gray-500">이모지 수</p>
          </div>
        </div>

        {/* 사이드 기능들 */}
        <div className={`space-y-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.6s' }}>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-sm">😍</span>
            <span className="text-xs font-medium text-amber-800">추천 이모지</span>
            <div className="flex gap-1 ml-auto">
              {['🔥', '✨', '💫', '🎉'].map(e => (
                <span key={e} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-sm border border-amber-200 cursor-pointer hover:scale-110 transition-transform">{e}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-sm">⏰</span>
            <span className="text-xs font-medium text-blue-800">추천 발송 시간</span>
            <span className="text-xs text-blue-600 ml-auto font-bold">화 10시, 목 14시</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendStatsDemo: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    { label: '긴급성 강조', count: 243, color: 'bg-red-500', percentage: 68 },
    { label: '혜택 중심', count: 187, color: 'bg-blue-500', percentage: 52 },
    { label: '신규 알림', count: 156, color: 'bg-green-500', percentage: 43 },
  ];

  return (
    <div ref={ref} className="space-y-3 mt-6">
      {stats.map((stat, i) => {
        const count = useCountUp(stat.count, 1500, isVisible);
        const percentage = useCountUp(stat.percentage, 1500, isVisible);
        return (
          <div key={stat.label} className="transition-all duration-500" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)', transitionDelay: `${i * 0.15}s` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">{stat.label}</span>
              <span className="text-sm font-bold text-gray-900">{count}건 ({percentage}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} transition-all duration-1000 ease-out`} style={{ width: isVisible ? `${stat.percentage}%` : '0%', transitionDelay: `${i * 0.15}s` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Landing: React.FC = () => {
  const examplesRef = useRef<HTMLDivElement>(null);

  const scrollToExamples = () => {
    examplesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection scrollToExamples={scrollToExamples} />

      <div ref={examplesRef} className="bg-gradient-to-b from-white to-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">어떻게 사용하나요?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              마케터가 매일 겪는 핵심 문제를 PushNow가 데이터 기반으로 해결합니다.
            </p>
          </div>

          <div className="space-y-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-violet-100 text-violet-700 rounded-full font-bold text-sm">
                  <Sparkles className="w-5 h-5" />
                  AI 메시지 생성
                </div>
                <h3 className="text-4xl font-black text-gray-900">"작성 시간은 줄이고<br />완성도는 올리고"</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900">5단계 작성 플로우</span>로 앱 카테고리, 목적, 전략, 톤을 선택하면
                  바로 실행 가능한 메시지 초안을 여러 각도로 생성합니다.
                </p>
                <AIMessageDemo />
                <Link to="/generate" className="inline-flex items-center gap-2 text-violet-600 font-bold hover:gap-3 transition-all">
                  메시지 생성 체험하기 →
                </Link>
              </div>
              <WizardStepsAnimation />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedHeatmap />
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                  <Clock className="w-5 h-5" />
                  타이밍 분석
                </div>
                <h3 className="text-4xl font-black text-gray-900">"언제 보내야 반응이 올라갈까?"</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  경쟁사 발송 패턴을 <span className="font-bold text-gray-900">요일×시간대 히트맵</span>으로 시각화하고,
                  발송 후보 시간을 데이터로 좁혀줍니다.
                </p>
                <Link to="/timing" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                  타이밍 분석 보기 →
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                  <TrendingUp className="w-5 h-5" />
                  전략 & 트리거 분석
                </div>
                <h3 className="text-4xl font-black text-gray-900">"요즘 어떤 전략과<br />심리 트리거가 통할까?"</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  수집된 메시지를 <span className="font-bold text-gray-900">마케팅 전략별·심리 트리거별</span>로 자동 분류하고,
                  앱별 전략 비중과 클릭을 유도하는 트리거 패턴을 한눈에 파악할 수 있습니다.
                </p>
                <TrendStatsDemo />
                <Link to="/trends" className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all">
                  트렌드 분석 보기 →
                </Link>
              </div>
              <StrategyDistributionDemo />
            </div>
          </div>

          <div className="space-y-32 mt-32">
            {/* Feed 섹션 */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FeedDemo />
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm">
                  <Rss className="w-5 h-5" />
                  메시지 피드
                </div>
                <h3 className="text-4xl font-black text-gray-900">"경쟁사는 어떤 메시지를 보내고 있을까?"</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  실제 수집된 푸시 메시지를 <span className="font-bold text-gray-900">캘린더 · 카테고리 · 앱</span> 필터로
                  날짜별로 탐색하고, 경쟁사의 전략과 표현을 바로 참고할 수 있습니다.
                </p>
                <Link to="/feed" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:gap-3 transition-all">
                  메시지 피드 보기 →
                </Link>
              </div>
            </div>

            {/* Review 섹션 */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-100 text-cyan-700 rounded-full font-bold text-sm">
                  <FileCheck className="w-5 h-5" />
                  발송 전 검토
                </div>
                <h3 className="text-4xl font-black text-gray-900">"보내기 전에 한번 더 점검"</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900">A/B 비교, 이모지 추천, 유사 메시지 검색</span>까지 한 화면에서.
                  발송 전 톤과 표현을 점검하고 최종 품질을 높여보세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['A/B 비교 분석', '이모지 추천', '발송 타이밍 힌트', '유사 메시지 검색'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/review" className="inline-flex items-center gap-2 text-cyan-600 font-bold hover:gap-3 transition-all">
                  메시지 검토하기 →
                </Link>
              </div>
              <ReviewDemo />
            </div>
          </div>

          <div className="mt-32 text-center">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-16 text-white">
              <h3 className="text-4xl font-black mb-6">지금 바로 시작하세요</h3>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                감이 아닌 데이터 기반으로 푸시 메시지 성과를 올려보세요.
              </p>
              <Link to="/generate" className="inline-block bg-white text-gray-900 text-lg font-bold px-12 py-5 rounded-full hover:bg-gray-100 transition-all shadow-xl hover:scale-105">
                메시지 작성하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
