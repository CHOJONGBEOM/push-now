import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PushFeedColumn } from '../components/landing/PushFeedColumn';
import { ArrowDown, Sparkles, BarChart3, Clock, TrendingUp } from 'lucide-react';
import { HeroSection } from '../components/landing/HeroSection';

// Custom hook for typing animation
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
            const updateText = () => {
                if (isDeleting) {
                    setDisplayText(currentText.substring(0, displayText.length - 1));
                } else {
                    setDisplayText(currentText.substring(0, displayText.length + 1));
                }
            };
            timeout = setTimeout(updateText, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    useEffect(() => {
        const cursorInterval = setInterval(() => setShowCursor(prev => !prev), 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return { displayText, showCursor };
};

// Custom hook for count-up animation
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

            // Ease out cubic
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

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return { ref, isVisible };
};

// Sub-component: AI Message Typing Demo
const AIMessageDemo: React.FC = () => {
    const messages = [
        "🔥 마지막 기회! 봄 신상 최대 50% 할인\n오늘만 특별 혜택! 지금 확인하고 놓치지 마세요",
        "💝 회원님만의 특별한 선물이 도착했어요!\n지금 확인하고 놀라운 혜택을 받아보세요",
        "⏰ 딱 24시간! 100% 당첨 룰렛 이벤트\n매일 새로운 선물이 기다리고 있어요"
    ];
    const { displayText, showCursor } = useTypingEffect(messages, 40, 20, 1500);
    const { ref, isVisible } = useScrollAnimation();

    const lines = displayText.split('\n');

    return (
        <div ref={ref} className={`pt - 4 transition - all duration - 700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} `}>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                    <div className={`w - 8 h - 8 bg - violet - 500 rounded - lg flex items - center justify - center text - white font - bold transition - all ${isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-180'} `}>
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
                <div className={`flex items - center gap - 2 text - xs text - violet - 600 bg - violet - 50 px - 3 py - 2 rounded - lg transition - all duration - 500 ${isVisible ? 'opacity-100' : 'opacity-0'} `}>
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>긴급성 + 혜택 강조 전략 적용</span>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Wizard Steps Animation
const WizardStepsAnimation: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 5);
        }, 2000);
        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <div ref={ref} className="relative">
            <div className={`bg - white rounded - 3xl shadow - 2xl p - 8 border border - gray - 100 transition - all duration - 700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} `}>
                <div className="space-y-4">
                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((step, i) => (
                            <div
                                key={step}
                                className={`h - 2 flex - 1 rounded - full transition - all duration - 500 ${i <= activeStep ? 'bg-violet-500' : 'bg-gray-200'} `}
                            />
                        ))}
                    </div>

                    {/* Sample options */}
                    <div className="space-y-3">
                        {[
                            { emoji: '👗', title: '패션/뷰티', desc: '의류, 신발, 화장품', active: activeStep === 1 },
                            { emoji: '🛒', title: '종합 이커머스', desc: '식품, 생활용품, 가구', active: activeStep === 2 },
                            { emoji: '✈️', title: '여행/숙박', desc: '항공, 호텔, 액티비티', active: activeStep === 3 },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`p - 4 rounded - xl border - 2 transition - all duration - 300 cursor - pointer ${item.active
                                    ? 'bg-violet-50 border-violet-500 scale-105'
                                    : 'bg-gray-50 border-transparent hover:border-violet-300 opacity-70'
                                    } `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Animated Heatmap
const AnimatedHeatmap: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation();
    const goldenHourCount = useCountUp(40, 1500, isVisible);

    const generateIntensity = (day: number, hour: number): number => {
        // Create realistic pattern - higher in mornings and evenings
        const baseIntensity = Math.random() * 0.3;
        if ((hour >= 3 && hour <= 5) || (hour >= 8 && hour <= 10)) {
            return baseIntensity + 0.6; // Peak times
        }
        return baseIntensity + 0.3;
    };

    return (
        <div ref={ref} className="relative">
            <div className={`bg - white rounded - 3xl shadow - 2xl p - 8 border border - gray - 100 transition - all duration - 700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} `}>
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-gray-900">시간대별 발송 패턴</h4>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded bg-blue-200"></div>
                        <div className="w-3 h-3 rounded bg-orange-400"></div>
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                    </div>
                </div>
                {/* Mini heatmap */}
                <div className="space-y-1">
                    {['월', '화', '수', '목', '금'].map((day, i) => (
                        <div key={day} className="flex gap-1 items-center">
                            <span className="text-xs w-6 text-gray-500 font-medium">{day}</span>
                            <div className="flex gap-1 flex-1">
                                {Array.from({ length: 12 }).map((_, j) => {
                                    const intensity = generateIntensity(i, j);
                                    const delay = (i * 12 + j) * 0.02;
                                    return (
                                        <div
                                            key={j}
                                            className={`flex - 1 h - 6 rounded transition - all duration - 300 ${intensity > 0.7
                                                ? 'bg-red-500'
                                                : intensity > 0.4
                                                    ? 'bg-orange-400'
                                                    : 'bg-blue-200'
                                                } `}
                                            style={{
                                                opacity: isVisible ? 1 : 0,
                                                transform: isVisible ? 'scale(1)' : 'scale(0.5)',
                                                transitionDelay: `${delay} s`
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`mt - 6 p - 4 bg - yellow - 50 rounded - xl border border - yellow - 200 transition - all duration - 700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} `} style={{ transitionDelay: '1s' }}>
                    <p className="text-sm font-bold text-yellow-900 mb-1">💡 골든 아워 추천</p>
                    <p className="text-xs text-yellow-700">화요일 오전 10시 - 경쟁사 발송 {goldenHourCount}% ↓</p>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Dynamic Keyword Cloud
const DynamicKeywordCloud: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation();

    const keywords = [
        { word: '마지막 기회', count: 128, trend: '+45%' },
        { word: '최대 50%', count: 95, trend: '+32%' },
        { word: '오늘만', count: 87, trend: '+28%' },
        { word: '무료배송', count: 76, trend: '+18%' },
    ];

    return (
        <div ref={ref} className="relative">
            <div className={`bg - white rounded - 3xl shadow - 2xl p - 8 border border - gray - 100 transition - all duration - 700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} `}>
                <h4 className="font-bold text-gray-900 mb-6">🔥 급상승 키워드</h4>
                <div className="space-y-3">
                    {keywords.map((item, i) => {
                        const count = useCountUp(item.count, 1500, isVisible);
                        return (
                            <div
                                key={item.word}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 transition-all duration-500"
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.9)',
                                    transitionDelay: `${i * 0.1} s`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-gray-400">#{i + 1}</span>
                                    <span className="font-bold text-gray-900">{item.word}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">{item.trend}</p>
                                    <p className="text-xs text-gray-500">{count}건</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Sub-component: Trend Stats Demo
const TrendStatsDemo: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation();

    const stats = [
        { label: '긴급성 강조', count: 243, color: 'bg-red-500', percentage: 68 },
        { label: '혜택 중심', count: 187, color: 'bg-blue-500', percentage: 52 },
        { label: '신규 알림', count: 156, color: 'bg-green-500', percentage: 43 }
    ];

    return (
        <div ref={ref} className="space-y-3 mt-6">
            {stats.map((stat, i) => {
                const count = useCountUp(stat.count, 1500, isVisible);
                const percentage = useCountUp(stat.percentage, 1500, isVisible);
                return (
                    <div
                        key={stat.label}
                        className="transition-all duration-500"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                            transitionDelay: `${i * 0.15} s`
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                            <span className="text-sm font-bold text-gray-900">{count}건 ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h - full ${stat.color} transition - all duration - 1000 ease - out`}
                                style={{
                                    width: isVisible ? `${stat.percentage}% ` : '0%',
                                    transitionDelay: `${i * 0.15} s`
                                }}
                            />
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


            {/* Hero Section */}
            <HeroSection scrollToExamples={scrollToExamples} />

            {/* Examples Section */}
            <div ref={examplesRef} className="bg-gradient-to-b from-white to-gray-50 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black text-gray-900 mb-6">
                            어떻게 활용하나요?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            마케터가 매일 겪는 <span className="font-bold text-gray-900">3가지 고민</span>을
                            PushNow가 해결합니다
                        </p>
                    </div>

                    {/* Use Cases */}
                    <div className="space-y-32">
                        {/* Use Case 1: AI 메시지 생성 */}
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-violet-100 text-violet-700 rounded-full font-bold text-sm">
                                    <Sparkles className="w-5 h-5" />
                                    AI 메시지 추천
                                </div>
                                <h3 className="text-4xl font-black text-gray-900">
                                    "카피 작성에 30분이<br />걸렸는데..."
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-900">5단계 위저드</span>로 간단하게 앱 종류, 목적, 전략, 톤을 선택하면
                                    AI가 <span className="font-bold text-gray-900">3가지 메시지 초안</span>을 즉시 생성합니다.
                                    경쟁사 데이터를 학습한 AI가 실무에 바로 쓸 수 있는 카피를 제공합니다.
                                </p>
                                <AIMessageDemo />
                                <Link
                                    to="/generate"
                                    className="inline-flex items-center gap-2 text-violet-600 font-bold hover:gap-3 transition-all"
                                >
                                    메시지 생성 체험하기 →
                                </Link>
                            </div>

                            {/* Animation: Wizard Steps */}
                            <WizardStepsAnimation />
                        </div>

                        {/* Use Case 2: 타이밍 분석 */}
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Animation: Heatmap */}
                            <AnimatedHeatmap />

                            <div className="space-y-6 order-1 lg:order-2">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                    <Clock className="w-5 h-5" />
                                    타이밍 분석
                                </div>
                                <h3 className="text-4xl font-black text-gray-900">
                                    "언제 보내야<br />클릭률이 높을까?"
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    경쟁사들이 푸시를 보내지 않는 <span className="font-bold text-gray-900">"골든 아워"</span>를 찾아드립니다.
                                    <span className="font-bold text-gray-900">7×24 히트맵</span>으로 한눈에 확인하고,
                                    발송이 적은 시간대를 추천받아 더 높은 도달률을 달성하세요.
                                </p>
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">요일별·시간대별 패턴 분석</p>
                                            <p className="text-sm text-gray-600">경쟁사가 언제 집중적으로 발송하는지 확인</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">빈 시간대 TOP 3 추천</p>
                                            <p className="text-sm text-gray-600">높은 도달률을 위한 최적의 발송 시간</p>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to="/timing"
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                                >
                                    타이밍 분석 보기 →
                                </Link>
                            </div>
                        </div>

                        {/* Use Case 3: 트렌드 분석 */}
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                    <TrendingUp className="w-5 h-5" />
                                    트렌드 분석
                                </div>
                                <h3 className="text-4xl font-black text-gray-900">
                                    "요즘 뭐가<br />잘 먹히지?"
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    경쟁사들이 사용하는 <span className="font-bold text-gray-900">마케팅 전략과 키워드</span>를
                                    AI가 자동으로 분석합니다. "긴급성", "혜택", "신규" 등
                                    <span className="font-bold text-gray-900"> 어떤 심리 트리거</span>가 많이 쓰이는지 한눈에 파악하세요.
                                </p>
                                <TrendStatsDemo />
                                <Link
                                    to="/trends"
                                    className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                                >
                                    트렌드 분석 보기 →
                                </Link>
                            </div>

                            {/* Animation: Keyword Cloud */}
                            <DynamicKeywordCloud />
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-32 text-center">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-16 text-white">
                            <h3 className="text-4xl font-black mb-6">
                                지금 바로 시작하세요
                            </h3>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                더 이상 감으로 푸시를 보내지 마세요.<br />
                                데이터 기반으로 더 나은 결과를 만들어보세요.
                            </p>
                            <Link
                                to="/generate"
                                className="inline-block bg-white text-gray-900 text-lg font-bold px-12 py-5 rounded-full hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
                            >
                                메시지 작성하기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
@keyframes fadeSlideIn {
                    from {
        opacity: 0;
        transform: translateX(-20px);
    }
                    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes notificationEnter {
    0 % {
        opacity: 0;
        transform: translateY(-30px) scale(0.9);
    }
    100 % {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

                .notification - card {
    animation: notificationEnter 0.6s cubic - bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slideInDown {
                    from {
        opacity: 0;
        transform: translateY(-20px);
    }
                    to {
        opacity: 1;
        transform: translateY(0);
    }
}

                .animate - roll - superslow {
    animation: roll 90s linear infinite;
}

                .animate - roll - slow {
    animation: roll 60s linear infinite;
}

                .animate - roll - fast {
    animation: roll 40s linear infinite;
}

                .animate - slideInDown {
    animation: slideInDown 0.5s ease - out;
}
`}</style>
        </div>
    );
};
