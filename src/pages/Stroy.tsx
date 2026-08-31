import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Mail, Github, Instagram, X, ArrowUp, Sliders, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

/* ─── 사이드바 섹션 목록 ─── */
const SECTIONS = [
    { id: 'hero', label: '소개' },
    { id: 'why', label: '사라지는 푸시 알림' },
    { id: 'problem', label: '의사결정 데이터의 부재' },
    { id: 'tech-choice', label: '기술 스택 선택 기준' },
    { id: 'android', label: 'Android 백그라운드 수집' },
    { id: 'schema', label: '마케팅 맞춤 DB 설계' },
    { id: 'pipeline', label: '무인 자동화 트리거' },
    { id: 'unexpected', label: '알림과 마케팅 CRM의 차이' },
    { id: 'scale', label: '1인 운영 생존성 확보' },
    { id: 'timing', label: 'Golden Hour 가중 알고리즘' },
    { id: 'ai', label: '실전 AI Copy 파이프라인' },
    { id: 'product', label: '데이터 기반 제품 개선' },
    { id: 'contact', label: '연락처' },
];

/* ─── Sticky TOC sidebar ─── */
const Sidebar: React.FC = () => {
    const [active, setActive] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                setActive('contact');
                return;
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );

        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className="hidden lg:block sticky top-24 w-48 flex-shrink-0 self-start pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">목차</p>
            <ul className="space-y-1">
                {SECTIONS.map(({ id, label }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block text-sm py-1 transition-all ${active === id
                                ? 'text-gray-900 font-bold translate-x-1'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

/* ─── 공통 디자인 컴포넌트 ─── */
const H2: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
    <h2 id={id} className="text-[25px] font-black text-gray-900 mt-16 mb-5 leading-snug scroll-mt-28">
        {children}
    </h2>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-[16px] text-gray-600 leading-[1.95] mb-5 break-keep">{children}</p>
);

const Quote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <blockquote className="pl-5 my-7 text-[16px] text-gray-800 leading-relaxed font-medium bg-gray-50/70 py-3.5 pr-4 rounded-r-xl break-keep" style={{ borderLeft: '3px solid #111' }}>
        {children}
    </blockquote>
);

const Bullets: React.FC<{ items: (string | React.ReactNode)[] }> = ({ items }) => (
    <ul className="my-5 space-y-2.5">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[16px] text-gray-600 leading-relaxed break-keep">
                <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const Code: React.FC<{ children: string }> = ({ children }) => (
    <code className="bg-gray-100 text-gray-800 text-[13px] font-mono px-1.5 py-0.5 rounded border border-gray-200/60">
        {children}
    </code>
);

const PipelineBox: React.FC<{ steps: { label: string; sub?: string }[] }> = ({ steps }) => (
    <div className="my-7 bg-gray-50 border border-gray-200 rounded-xl p-6 font-mono text-sm shadow-sm">
        {steps.map((step, i) => (
            <div key={i} className={`flex items-start gap-3 ${i > 0 ? 'mt-2.5' : ''}`}>
                <span className="text-gray-400 w-4 flex-shrink-0 mt-0.5 select-none font-bold">{i === 0 ? '•' : '↓'}</span>
                <span>
                    <span className={i === steps.length - 1 ? 'font-bold text-gray-900 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/50' : 'text-gray-700'}>{step.label}</span>
                    {step.sub && <span className="text-gray-400 ml-2 text-xs font-sans">{step.sub}</span>}
                </span>
            </div>
        ))}
    </div>
);

const BeforeAfter: React.FC<{ before: string; after: string }> = ({ before, after }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-7">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Before (처음의 생각)</p>
            <p className="text-sm text-gray-600 leading-relaxed break-keep">{before}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl text-white shadow-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">After (진짜 문제와 답)</p>
            <p className="text-sm text-gray-100 leading-relaxed break-keep">{after}</p>
        </div>
    </div>
);

const Tags: React.FC<{ items: string[] }> = ({ items }) => (
    <div className="flex flex-wrap gap-2 my-5">
        {items.map((t) => (
            <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-[13px] font-mono rounded-lg border border-gray-200/60">{t}</span>
        ))}
    </div>
);

/* ─── Lightbox ─── */
const Lightbox: React.FC<{ src: string; alt: string; caption: string; onClose: () => void }> = ({ src, alt, caption, onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                aria-label="닫기"
            >
                <X className="w-6 h-6" />
            </button>
            <div
                className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
                {caption && (
                    <p className="mt-4 text-[14px] text-white/80 text-center leading-relaxed max-w-[640px] px-4 py-2 bg-black/60 rounded-lg backdrop-blur-md">
                        {caption}
                    </p>
                )}
            </div>
        </div>
    );
};

const Screenshot: React.FC<{
    src: string;
    caption: string;
    alt: string;
    maxW?: string;
    align?: 'left' | 'center';
    onOpen: (src: string, alt: string, caption: string) => void;
}> = ({ src, caption, alt, maxW = '100%', align = 'center', onOpen }) => (
    <figure className={`my-8 ${align === 'center' ? 'mx-auto' : ''}`} style={{ maxWidth: maxW }}>
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-zoom-in">
            <img
                src={src}
                alt={alt}
                onClick={() => onOpen(src, alt, caption)}
                className="w-full transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow">
                    클릭하여 크게 보기
                </span>
            </div>
        </div>
        <figcaption className="mt-3 text-[13px] text-gray-500 text-center leading-relaxed break-keep">
            {caption}
        </figcaption>
    </figure>
);

const HR: React.FC = () => <hr className="my-14" style={{ borderColor: '#F0F0F0' }} />;

/* ═══════════════════════════════════════════════
   인터랙티브 위젯 1: 알림 필터링 테스터
═══════════════════════════════════════════════ */
const SAMPLE_NOTIFICATIONS = [
    {
        id: 'ad_commerce',
        label: '이커머스 타임특가',
        app: '무신사 (com.musinsa.store)',
        title: '[단독] 오늘 자정 마감! 최대 80% 블랙프라이데이 쿠폰팩 도착 🎁',
        body: '회원님만을 위한 30,000원 장바구니 쿠폰이 지급되었습니다. 지금 확인해보세요.',
        isAd: true,
        reason: '광고성 키워드([단독], 쿠폰팩, %) 감지 & 마케팅 알림 채널 매칭',
        extractedTags: ['FOMO/마감임박', '할인율(80%)', '이모지 포함', '커머스'],
    },
    {
        id: 'system_os',
        label: 'OS 시스템 알림',
        app: 'Android System (android)',
        title: '배터리 부족',
        body: '배터리가 15% 남았습니다. 절전 모드를 켜시겠습니까?',
        isAd: false,
        reason: '시스템 패키지(android) 제외 룰 & 비마케팅 채널 차단',
        extractedTags: ['시스템 알림 (DB INSERT 제외)'],
    },
    {
        id: 'trans_card',
        label: '카드 결제 승인',
        app: 'KB국민카드 (com.kbcard.cxh.appmain)',
        title: '[KB국민체크] 조*범님 승인',
        body: '4,500원 (일시불) 스타벅스 강남점 08/31 12:30 잔액 128,000원',
        isAd: false,
        reason: '트랜잭션 결제 알림 정규식 매칭 (is_ad: false 플래그 처리)',
        extractedTags: ['개인 금융 정보 (CRM 분석 제외)'],
    },
];

const NotificationFilterTester: React.FC = () => {
    const [selectedId, setSelectedId] = useState('ad_commerce');
    const activeSample = SAMPLE_NOTIFICATIONS.find((s) => s.id === selectedId) || SAMPLE_NOTIFICATIONS[0];

    return (
        <div className="my-8 p-5 sm:p-6 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                        Interactive Demo: auto_process_message 트리거 판별기
                    </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">클릭해서 테스트</span>
            </div>

            <p className="text-xs text-gray-300 mb-3">샘플 알림을 선택해 DB 트리거의 실시간 전처리 결과를 확인해 보세요:</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {SAMPLE_NOTIFICATIONS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold text-center transition-all ${selectedId === item.id
                            ? 'bg-amber-400 text-gray-950 shadow-md scale-[1.02]'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 font-mono text-xs space-y-2.5">
                <div>
                    <span className="text-gray-500">패키지:</span> <span className="text-gray-300">{activeSample.app}</span>
                </div>
                <div>
                    <span className="text-gray-500">제목:</span> <span className="text-gray-100 font-bold">{activeSample.title}</span>
                </div>
                <div>
                    <span className="text-gray-500">내용:</span> <span className="text-gray-300">{activeSample.body}</span>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">판별 결과:</span>
                        {activeSample.isAd ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" /> is_ad: true (마케팅 CRM)
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                                <XCircle className="w-3.5 h-3.5" /> is_ad: false (필터링 제외)
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-sans">{activeSample.reason}</span>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                    {activeSample.extractedTags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] font-sans">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   인터랙티브 위젯 2: Golden Hour 가중치 시뮬레이터
═══════════════════════════════════════════════ */
const SAMPLE_TIME_SLOTS = [
    {
        dayTime: '월요일 08:15 (이른 아침 유령 슬롯)',
        compScore: 1.00,
        relScore: 0.15,
        mktBonus: 0.40,
        desc: '경쟁사 발송량이 0건이라 경쟁도(100점)는 만점이지만, 한 달 동안 딱 1건만 감지된 검증되지 않은 유령 슬롯(신뢰도 15점).',
    },
    {
        dayTime: '화요일 14:00 (오후 비피크 틈새)',
        compScore: 0.90,
        relScore: 0.85,
        mktBonus: 0.80,
        desc: '점심 피크가 끝난 나른한 오후. 경쟁사 발송량이 매우 적고(경쟁도 90점), 유저 활동 표본도 안정적으로 검증된 실전 골든아워.',
    },
    {
        dayTime: '목요일 11:30 (점심 피크 직전)',
        compScore: 0.70,
        relScore: 0.98,
        mktBonus: 0.65,
        desc: '점심 12:00 대란 직전. 많은 앱들이 활발하게 발송해 유저 반응이 확실히 검증된 안전 시간대(신뢰도 98점).',
    },
    {
        dayTime: '수요일 18:00 (퇴근 피크 대란)',
        compScore: 0.15,
        relScore: 1.00,
        mktBonus: 0.10,
        desc: '모든 커머스/배달앱이 일제히 푸시를 폭격하는 극심한 레드오션(경쟁도 15점). 알림창에서 순식간에 묻힐 위험.',
    },
];

const PRESETS = [
    {
        name: '🎯 실전 추천 공식 (65:25:15)',
        comp: 65,
        rel: 25,
        mkt: 15,
        summary: '경쟁 회피를 최우선(65%)으로 두되, 유령 슬롯 오류를 방어(25%)하고 시장 혼잡도(15%)를 반영한 황금 밸런스',
    },
    {
        name: '⚡ 경쟁 회피 극대화 (100:0:0)',
        comp: 100,
        rel: 0,
        mkt: 0,
        summary: '오직 "남들이 안 보내는 시간대"만 추적. 표본이 1건뿐인 비주류 유령 시간대까지 1위로 튀어나오는 현상 발생',
    },
    {
        name: '🛡️ 검증된 표본 우선 (20:70:10)',
        comp: 20,
        rel: 70,
        mkt: 10,
        summary: '많은 앱들이 발송해 신뢰도가 검증된 시간대를 우선. 다소 붐비더라도 안전하게 도달시키는 보수적 세팅',
    },
];

const TimingSimulator: React.FC = () => {
    const [wComp, setWComp] = useState(65);
    const [wRel, setWRel] = useState(25);
    const [wMkt, setWMkt] = useState(15);
    const [activePreset, setActivePreset] = useState<string>('🎯 실전 추천 공식 (65:25:15)');

    const calculatedSlots = useMemo(() => {
        const totalWeight = (wComp + wRel + wMkt) || 1;
        const normComp = wComp / totalWeight;
        const normRel = wRel / totalWeight;
        const normMkt = wMkt / totalWeight;

        return SAMPLE_TIME_SLOTS.map((slot) => {
            const finalScore = (slot.compScore * normComp + slot.relScore * normRel + slot.mktBonus * normMkt) * 100;
            return {
                ...slot,
                score: Math.round(finalScore * 10) / 10,
            };
        }).sort((a, b) => b.score - a.score);
    }, [wComp, wRel, wMkt]);

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setWComp(preset.comp);
        setWRel(preset.rel);
        setWMkt(preset.mkt);
        setActivePreset(preset.name);
    };

    return (
        <div className="my-8 p-5 sm:p-6 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                        Interactive Demo: Golden Hour 3중 가중치 시뮬레이터
                    </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">실시간 추천 알고리즘 엔진</span>
            </div>

            <p className="text-xs text-gray-300 mb-3 leading-relaxed break-keep">
                실제 마케팅 현업에서는 <strong>"발송량이 0인 시간"</strong>이 무조건 좋은 것이 아닙니다.
                아래 프리셋을 눌러보거나 슬라이더를 조작해 가중치가 바뀔 때 추천 순위와 점수가 왜 달라지는지 직접 체감해 보세요:
            </p>

            {/* 시나리오 프리셋 버튼 */}
            <div className="space-y-1.5 mb-5">
                <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">시나리오 프리셋 (원클릭 체험):</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                        <button
                            key={p.name}
                            onClick={() => applyPreset(p)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${activePreset === p.name && wComp === p.comp && wRel === p.rel && wMkt === p.mkt
                                ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm'
                                : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                                }`}
                        >
                            <div className="text-xs font-bold font-mono mb-0.5">{p.name}</div>
                            <div className="text-[10px] text-gray-400 leading-snug break-keep">{p.summary}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 슬라이더 컨트롤러 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 bg-gray-950 p-4 rounded-xl border border-gray-800">
                <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-blue-400 font-bold">1. 경쟁도 가중치</span>
                        <span>{wComp}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={wComp}
                        onChange={(e) => { setWComp(Number(e.target.value)); setActivePreset(''); }}
                        className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug break-keep">
                        💡 <strong>경쟁사 발송 회피</strong>: 점심 12시나 퇴근 18시처럼 알림이 쏟아지는 피크를 피해 상단을 선점합니다.
                    </p>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-amber-400 font-bold">2. 데이터 신뢰도</span>
                        <span>{wRel}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={wRel}
                        onChange={(e) => { setWRel(Number(e.target.value)); setActivePreset(''); }}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug break-keep">
                        💡 <strong>유령 슬롯 방어</strong>: 배달앱에서 리뷰 1개 5.0보다 리뷰 500개 4.8을 신뢰하듯, 표본이 검증된 시간대에 가산점을 줍니다.
                    </p>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-emerald-400 font-bold">3. 시장 보너스</span>
                        <span>{wMkt}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={wMkt}
                        onChange={(e) => { setWMkt(Number(e.target.value)); setActivePreset(''); }}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug break-keep">
                        💡 <strong>숲을 보는 가산점</strong>: 내 경쟁사는 안 보내도 쿠팡·배민 등 시장 전체가 폭격 중이면 폰이 포화 상태이므로 이를 보정합니다.
                    </p>
                </div>
            </div>

            {/* 실시간 순위 및 설명 카드 */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400">알고리즘 실시간 산출 결과</p>
                    <span className="text-[10px] text-amber-400/80 font-mono">가중치 합산 기준 정규화 100점 만점</span>
                </div>

                {calculatedSlots.map((slot, index) => (
                    <div
                        key={slot.dayTime}
                        className={`p-3.5 rounded-xl border transition-all ${index === 0
                            ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                            : 'bg-gray-950/70 border-gray-800 text-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-400 text-gray-950' : 'bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    {index + 1}
                                </span>
                                <span className="font-bold text-sm text-gray-100">{slot.dayTime}</span>
                                {index === 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-gray-950 font-bold font-sans">
                                        ★ 1위 골든아워
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                                <div className="w-20 bg-gray-800 h-2 rounded-full overflow-hidden hidden sm:block">
                                    <div
                                        className={`h-full ${index === 0 ? 'bg-amber-400' : 'bg-gray-500'}`}
                                        style={{ width: `${slot.score}%` }}
                                    />
                                </div>
                                <span className={`font-bold text-sm ${index === 0 ? 'text-amber-300' : 'text-gray-200'}`}>
                                    {slot.score}점
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed font-sans mt-1 break-keep">
                            {slot.desc}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-800/80 text-[10px] font-mono text-gray-400">
                            <span className="text-blue-400/90">경쟁도: {Math.round(slot.compScore * 100)}점</span>
                            <span>•</span>
                            <span className="text-amber-400/90">신뢰도: {Math.round(slot.relScore * 100)}점</span>
                            <span>•</span>
                            <span className="text-emerald-400/90">시장보너스: {Math.round(slot.mktBonus * 100)}점</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export const Stroy: React.FC = () => {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption: string } | null>(null);
    const [showTopBtn, setShowTopBtn] = useState(false);

    const openLightbox = (src: string, alt: string, caption: string) => setLightbox({ src, alt, caption });
    const closeLightbox = () => setLightbox(null);

    useEffect(() => {
        const handleScroll = () => {
            setShowTopBtn(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {lightbox && (
                <Lightbox src={lightbox.src} alt={lightbox.alt} caption={lightbox.caption} onClose={closeLightbox} />
            )}
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-32 pb-32">
                <div className="flex gap-16">
                    <Sidebar />

                    <main className="flex-1 min-w-0 max-w-[680px]">

                        {/* ── 01 Hero ── */}
                        <section id="hero" className="scroll-mt-28">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                                    Project Story & Full-Stack Architecture
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                                    📱 30대 남성 기기 환경 실시간 수집 기반
                                </span>
                            </div>
                            <h1 className="text-[38px] sm:text-[48px] font-black text-gray-900 mb-6 leading-[1.15] tracking-tight">
                                PushNow
                            </h1>
                            <p className="text-[18px] text-gray-600 leading-relaxed mb-8 break-keep font-normal">
                                마케팅 현업의 가려운 곳을 풀기 위해 코드까지 직접 구축한 1인 풀스택 프로젝트입니다.<br />
                                <strong>PushNow</strong>는 국내 주요 커머스, 패션, 배달, 금융 앱들의 푸시 메시지를 실시간 수집·분석해<br />
                                경쟁을 피하는 최적의 발송 타이밍과 고성과 카피를 도출하는 <strong>Push Intelligence 플랫폼</strong>입니다.
                            </p>
                            <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl mb-8 text-sm text-amber-900 leading-relaxed break-keep">
                                💡 <strong>수집 데이터 환경 (Data Context)</strong>: CRM 푸시는 성별, 연령, 유저 행동에 따라 개인화되어 발송됩니다. 현재 PushNow의 데이터베이스는 <strong>30대 남성 사용자 기기 환경</strong>에서 실제로 수신되는 실전 마케팅 알림을 바탕으로 24시간 실시간 축적되고 있습니다.
                            </div>
                            <div className="flex items-center gap-3.5 pt-7 border-t border-gray-100">
                                <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center text-base font-black flex-shrink-0 shadow-sm">
                                    조
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-[16px]">조종범 · Growth Marketer & Full-Stack Creator</p>
                                    <p className="text-[14px] text-gray-500 mt-0.5 leading-relaxed break-keep">
                                        비즈니스 문제를 데이터로 정의하고, 필요한 제품과 자동화 파이프라인을 직접 구축합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <HR />

                        {/* ── 02 사라지는 푸시 알림 ── */}
                        <section id="why" className="scroll-mt-28">
                            <H2 id="why-title">사라지는 푸시 알림: 수동 기록의 한계</H2>
                            <P>
                                마케터에게 경쟁사가 유저에게 직접 발송하는 CRM 푸시 메시지는 가장 검증된 실전 레퍼런스입니다. 내부 수많은 A/B 테스트와 검토를 거쳐 살아남은 카피와 프로모션 혜택들이기 때문입니다.
                            </P>
                            <P>
                                하지만 푸시 알림에는 치명적인 약점이 있었습니다.
                            </P>
                            <Quote>
                                알림 창에서 스와이프해 지우거나 앱을 실행하는 순간, 데이터는 영원히 증발해 버립니다.
                            </Quote>
                            <P>
                                일일이 수동으로 복사해 노션이나 스프레드시트에 기록하는 것은 업무 리소스 대비 턱없이 비효율적이었고, 결국 작심삼일로 끝나기 일쑤였습니다. 무엇보다 수동 기록으로는 수십 개 경쟁사의 요일별·시간대별 발송 주기나 카테고리 트렌드를 통계적으로 분석하는 것이 불가능했습니다.
                            </P>
                            <P>
                                <strong>"수동 기록 없이, 실제 유저 폰에 도달하는 모든 마케팅 푸시를 24시간 자동으로 구조화할 수는 없을까?"</strong> 이 질문이 PushNow의 시작점이었습니다.
                            </P>
                        </section>

                        <HR />

                        {/* ── 03 의사결정 데이터의 부재 ── */}
                        <section id="problem" className="scroll-mt-28">
                            <H2 id="problem-title">단순 저장이 아니라 ‘의사결정 데이터’의 부재였다</H2>
                            <P>
                                처음에는 단순히 여러 앱들의 푸시 문구를 모아두는 아카이브를 생각했습니다. 하지만 실제 데이터를 모아보며 깨달은 본질적인 병목은 다른 곳에 있었습니다.
                            </P>
                            <PipelineBox steps={[
                                { label: '경쟁사의 실제 마케팅 메시지를 참고하고 싶다' },
                                { label: '수동 기록이 어려워 데이터가 휘발된다' },
                                { label: '시계열 데이터가 없으니 경쟁사의 발송 패턴을 모른다' },
                                { label: '결국 우리 서비스의 발송 요일과 시간도 감(Intuition)에 의존한다', sub: '← 진짜 병목 지점' },
                            ]} />
                            <P>
                                마케터가 진짜 필요로 했던 것은 '남의 문구 구경'이 아니라, <strong>"경쟁사와 겹치지 않는 골든아워가 언제인가?", "어떤 심리적 트리거(마감임박, 할인율, 호기심)가 시장에서 작동하는가?"</strong>에 대한 구체적인 의사결정 근거였습니다.
                            </P>
                        </section>

                        <HR />

                        {/* ── 04 기술 스택 선택 기준 ── */}
                        <section id="tech-choice" className="scroll-mt-28">
                            <H2 id="tech-choice-title">기술 스택 선택 기준 — 바닥부터 만들지 않고 검증된 도구 활용하기</H2>
                            <P>
                                1인 개발 프로젝트에서 모든 인프라와 백엔드를 처음부터 일일이 구축하는 것은 매우 비효율적이라고 판단했습니다.
                                빠르게 가설을 검증하고 실제 푸시 데이터를 축적하는 것이 최우선인데, 백엔드 보일러플레이트 작성과 서버 배포 세팅에 리소스를 낭비할 이유가 없었기 때문입니다.
                            </P>
                            <div className="space-y-4 my-6">
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <strong className="text-gray-900 text-sm block mb-1">1. 왜 자체 백엔드(Node/Express/EC2) 대신 Supabase인가?</strong>
                                    <p className="text-sm text-gray-600 leading-relaxed break-keep">
                                        API 서버 인프라를 바닥부터 구축하지 않고도 PostgreSQL의 정밀한 관계형 스키마, REST API, Database Trigger를 즉시 활용할 수 있기 때문입니다. 특히 알림 수신 시 별도 서버 호출 없이 DB 레벨에서 즉시 전처리·분류하는 <Code>Database Trigger</Code>는 1인 개발 환경에서 가장 빠르고 효율적인 최단 경로였습니다.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <strong className="text-gray-900 text-sm block mb-1">2. 왜 NoSQL(Firebase) 대신 PostgreSQL(Supabase)인가?</strong>
                                    <p className="text-sm text-gray-600 leading-relaxed break-keep">
                                        푸시 데이터 분석은 요일×시간대별 발송량 집계, 카테고리별 트리거 통계, 시계열 히트맵 쿼리 등 <strong>복잡한 다차원 집계 연산</strong>이 필수적입니다. NoSQL의 단방향 조회 구조보다 강력한 SQL 인덱싱과 뷰(View) 생성이 가능한 PostgreSQL이 압도적으로 적합했습니다.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <strong className="text-gray-900 text-sm block mb-1">3. 왜 Vercel 배포인가?</strong>
                                    <p className="text-sm text-gray-600 leading-relaxed break-keep">
                                        React 19 + Vite 기반 프론트엔드를 글로벌 엣지 CDN에 자동 배포하고, GitHub 푸시 시 무중단 CI/CD가 즉각 완료되어 프론트엔드 배포 오버헤드를 0으로 유지할 수 있었습니다.
                                    </p>
                                </div>
                            </div>
                            <Tags items={['Supabase (PostgreSQL)', 'Database Triggers', 'Edge Functions', 'Android (Kotlin)', 'React 19', 'TypeScript', 'Vite', 'Vercel']} />
                        </section>

                        <HR />

                        {/* ── 05 Android 백그라운드 수집 ── */}
                        <section id="android" className="scroll-mt-28">
                            <H2 id="android-title">Android 백그라운드 수집 — 웹보다 앱을 먼저 만든 이유</H2>
                            <P>
                                화면을 그리기 전에 이 프로젝트의 성패를 가를 핵심 전제는 <strong>"실제 디바이스 환경에서 수십 개 주요 앱의 알림을 누락 없이 가로챌 수 있는가?"</strong>였습니다.
                            </P>
                            <P>
                                Android OS의 <Code>NotificationListenerService</Code> API를 활용하여, 테스트 전용 공기계에 설치된 40여 개 주요 앱의 수신 알림을 백그라운드에서 실시간 캡처하는 Kotlin 앱 <strong>PushRadar</strong>를 직접 개발했습니다.
                            </P>

                            <Screenshot
                                src="/about/android-app.png"
                                alt="PushRadar Android 수집 앱"
                                caption="PushRadar — 실시간 푸시 수집 전용 Android 앱. 백그라운드에서 실행되며 40여 개 주요 앱의 알림을 감지해 Supabase로 즉시 전송한다."
                                maxW="280px"
                                onOpen={openLightbox}
                            />

                            <PipelineBox steps={[
                                { label: 'PushRadar (Android 공기계)', sub: 'Kotlin 백그라운드 수집' },
                                { label: 'NotificationListenerService', sub: 'OS 레벨 실시간 알림 가로채기' },
                                { label: 'Supabase REST API Direct INSERT', sub: '별도 API 서버 없이 다이렉트 전송' },
                                { label: 'PostgreSQL Database Triggers', sub: '데이터 정제 및 AI 자동 라벨링' },
                                { label: 'PushNow Web Dashboard', sub: 'React 19 + TypeScript 대시보드 시각화' },
                            ]} />
                        </section>

                        <HR />

                        {/* ── 06 마케팅 맞춤 DB 설계 ── */}
                        <section id="schema" className="scroll-mt-28">
                            <H2 id="schema-title">마케팅 맞춤 DB 설계: 원본 알림에서 심리 트리거까지</H2>
                            <P>
                                단순히 '앱 이름'과 '텍스트'만 저장해서는 키워드 검색 외에 가치 있는 분석을 할 수 없었습니다.
                                <strong>"대시보드에서 어떤 통계와 인사이트를 보여줄 것인가?"</strong>를 역산하여 스키마를 구조화했습니다.
                            </P>

                            <Screenshot
                                src="/about/db-schema.png"
                                alt="push_messages 테이블 스키마"
                                caption="push_messages(20개 컬럼), apps(8개 컬럼) — 수집 메타데이터와 AI 심리 트리거 분석 결과가 한 레코드에 유기적으로 결합되는 구조."
                                onOpen={openLightbox}
                            />

                            <Bullets items={[
                                <><Code>title</Code>, <Code>body</Code>, <Code>package_name</Code>, <Code>posted_at</Code> — 수집된 원본 알림 메타데이터</>,
                                <><Code>is_ad</Code> — 순수 CRM 마케팅 푸시 여부 자동 판별 플래그</>,
                                <><Code>category</Code> — 패션, 커머스, 배달, 뷰티, 금융 등 업종 도메인 분류</>,
                                <><Code>has_emoji</Code>, <Code>message_length</Code> — 카피 구조 분석용</>,
                                <><Code>marketing_hook</Code>, <Code>hook_type</Code>, <Code>hook_trigger</Code> — AI가 추출한 핵심 심리 기법(FOMO, 마감임박, 할인율 등)</>,
                            ]} />
                            <P>
                                이처럼 정규화된 스키마 덕분에 프론트엔드는 추가 전처리 없이도 요일·시간대별 히트맵과 통계를 즉시 렌더링할 수 있습니다. 현재 약 <strong>19,000건 이상의 실제 마케팅 푸시</strong>가 실시간으로 축적되어 있습니다.
                            </P>

                            <Screenshot
                                src="/about/db-tables.png"
                                alt="Supabase 데이터베이스 현황"
                                caption="실제 운영 중인 push_messages 테이블 — 19,000개 이상의 레코드와 최적화된 인덱싱."
                                onOpen={openLightbox}
                            />
                        </section>

                        <HR />

                        {/* ── 07 무인 자동화 트리거 ── */}
                        <section id="pipeline" className="scroll-mt-28">
                            <H2 id="pipeline-title">무인 자동화 트리거: 알림이 들어올 때 일어나는 일</H2>
                            <P>
                                Android 기기가 알림을 캡처해 DB에 <Code>INSERT</Code>하는 순간, Supabase 내부의 <strong>Database Trigger</strong>들이 무인으로 작동합니다.
                            </P>

                            <Screenshot
                                src="/about/db-triggers.png"
                                alt="Supabase Database Triggers"
                                caption="5개의 DB 트리거 — BEFORE / AFTER INSERT 시점에 데이터 정제와 AI 분석을 무인 자동화한다."
                                onOpen={openLightbox}
                            />

                            <PipelineBox steps={[
                                { label: '1. Android 수집 앱 → Raw 알림 INSERT', sub: '기기에서 전송' },
                                { label: '2. BEFORE INSERT: auto_process_message', sub: '광고성 여부 판별 & 카테고리 자동 라벨링' },
                                { label: '3. AFTER INSERT: auto_register_app', sub: '신규 패키지 감지 시 apps 마스터 테이블 자동 등록' },
                                { label: '4. AFTER INSERT: trigger_analyze_marketing', sub: 'Edge Function 비동기 호출 → AI 심리 트리거 태깅' },
                            ]} />
                            <P>
                                기기는 알림 데이터를 DB에 던져주기만 하고, 정제·마스터화·AI 분석은 데이터베이스 트리거와 Edge Function이 백그라운드에서 완료합니다.
                            </P>

                            <Screenshot
                                src="/about/db-data.png"
                                alt="push_messages 테이블 실 데이터"
                                caption="실제 정제·저장된 push_messages 데이터. 무신사, 올리브영, 컬리 등 대표 앱들의 메시지가 실시간으로 쌓인다."
                                onOpen={openLightbox}
                            />
                        </section>

                        <HR />

                        {/* ── 08 예상 밖 복병 ── */}
                        <section id="unexpected" className="scroll-mt-28">
                            <H2 id="unexpected-title">‘알림’과 ‘마케팅 CRM’은 완전히 달랐다</H2>
                            <P>
                                처음 수집 코드를 돌렸을 때 가장 크게 마주친 복병이었습니다. 스마트폰 OS 관점에서는 카드사 결제 알림, 배터리 부족 시스템 알림, 개인 메신저 알림, 쇼핑몰 할인 푸시가 전부 똑같은 <Code>Notification</Code>이었습니다.
                            </P>
                            <BeforeAfter
                                before='"기기에 오는 모든 알림을 빠짐없이 긁어모은다" (단순 크롤링 관점)'
                                after='"쏟아지는 알림 중 무엇이 마케팅 가치가 있는 CRM 푸시인가?" (데이터 정의와 필터링 관점)'
                            />
                            <P>
                                알림 채널 ID(Channel ID), 발송 패키지명, 결제 승인 정규식 패턴을 결합하여 순수 마케팅 CRM 메시지만을 판별하는 알고리즘을 구축했습니다.
                            </P>

                            {/* 인터랙티브 위젯 1: 알림 필터링 테스터 */}
                            <NotificationFilterTester />
                        </section>

                        <HR />

                        {/* ── 09 스케일과 생존 ── */}
                        <section id="scale" className="scroll-mt-28">
                            <H2 id="scale-title">공기계 1대를 넘어설 때 마주친 실전 문제들</H2>
                            <P>
                                수집 앱을 40개 이상으로 늘리고 다중 기기를 투입하면서 24시간 365일 무인 운영을 위한 엔지니어링 이슈들이 발생했습니다.
                            </P>
                            <Bullets items={[
                                <><strong className="text-gray-900">다중 기기 중복 수집 방지:</strong> 동일 앱이 여러 기기에 설치되었을 때 1~2초 간격으로 중복 INSERT되는 문제를 메시지 고유 해시(MD5)와 DB 유니크 제약조건으로 원천 차단</>,
                                <><strong className="text-gray-900">Android Doze 모드 극복:</strong> 화면이 꺼진 야간에 OS가 백그라운드 네트워크를 차단하지 않도록 포그라운드 서비스 및 배터리 최적화 예외 처리 적용</>,
                                <><strong className="text-gray-900">신규 앱 자동 마스터화:</strong> 새로운 앱이 추가되어도 수동 입력 없이 <Code>auto_register_app</Code> 트리거가 패키지 정보를 마스터 테이블에 자동 등록</>,
                            ]} />
                        </section>

                        <HR />

                        {/* ── 10 Timing ── */}
                        <section id="timing" className="scroll-mt-28">
                            <H2 id="timing-title">단순 정렬했더니 새벽 3시를 추천했다: 3중 가중치 알고리즘</H2>
                            <P>
                                발송 타이밍 기능 개발 초기, 단순하게 <strong>"발송량이 가장 적은 시간대 = 경쟁이 없으니 최적의 시간"</strong>으로 정렬했더니 알고리즘이 <strong>'새벽 3시 40분'</strong>을 1위로 추천했습니다.
                            </P>
                            <Quote>
                                통계적으로는 경쟁률 0%였지만, 새벽에 보낸 푸시는 유저의 앱 삭제와 수신 차단을 유발하는 최악의 마케팅 의사결정입니다.
                            </Quote>
                            <P>
                                또한 정보통신망법 제50조에 따라 야간(21:00~08:00) 광고성 정보 전송 제한을 준수해야 했습니다.
                                따라서 분석 윈도우를 <strong>08:00 ~ 23:59 (112개 슬롯)</strong>로 한정하고, 마케팅 도메인 지식을 반영한 <strong>3중 다기준 가중 알고리즘</strong>을 설계했습니다.
                            </P>

                            <div className="my-6 bg-gray-900 text-white rounded-xl p-5 font-mono text-sm shadow-md">
                                <p className="text-amber-400 text-xs uppercase tracking-widest mb-1.5 font-bold">Golden Hour Recommendation Formula</p>
                                <p className="font-bold text-gray-100 mb-2">
                                    추천 점수 = (경쟁도 점수 × 0.65) + (데이터 신뢰도 × 0.25) + (시장 보너스 × 0.15)
                                </p>
                                <p className="text-xs text-gray-400 font-sans">
                                    • 요일 분산 제약(Diversity Guardrail): 1~3위 추천 시 동일 요일 연속 노출 방지
                                </p>
                            </div>

                            {/* 인터랙티브 위젯 2: Timing 가중치 시뮬레이터 */}
                            <TimingSimulator />
                        </section>

                        <HR />

                        {/* ── 11 AI Copy ── */}
                        <section id="ai" className="scroll-mt-28">
                            <H2 id="ai-title">API만 붙였더니 클리셰만 쏟아졌다: 실전 AI Copy 파이프라인</H2>
                            <P>
                                AI 카피 생성 기능(Generate)의 첫 버전은 단순 프롬프트로 LLM API를 호출했습니다. 하지만 실제 마케터 입장에서 써보았을 때 "놀라운 혜택!", "지금 바로 확인하세요!" 같은 진부한 클리셰 문장들만 반복되었습니다.
                            </P>
                            <Bullets items={[
                                <><strong className="text-gray-900">실전 레퍼런스 Few-shot 동적 주입:</strong> DB에서 최근 유저 반응과 완성도가 높은 실제 타사 푸시 사례를 프롬프트 예시로 동적 주입</>,
                                <><strong className="text-gray-900">진부한 클리셰 차단 필터:</strong> 상투적 패턴 및 중복 카피를 걸러내는 후처리 필터링</>,
                                <><strong className="text-gray-900">Edge Function 프록시 & 캐싱:</strong> Supabase Edge Function을 프록시로 두어 API 키 노출을 차단하고 동일 요청 캐싱으로 비용 절감</>,
                            ]} />
                        </section>

                        <HR />

                        {/* ── 12 기능에서 제품으로 ── */}
                        <section id="product" className="scroll-mt-28">
                            <H2 id="product-title">Amplitude로 확인한 ‘내가 만든 것’과 ‘유저가 쓰는 것’</H2>
                            <P>
                                대시보드 런칭 후 <strong>Amplitude</strong>를 연동해 실제 유저들의 사용 행동 데이터를 트래킹했습니다.
                            </P>
                            <BeforeAfter
                                before="“내가 필요해서 만든 기능이니 유저들도 복잡한 통계 차트를 좋아하겠지?”"
                                after="“유저가 어디서 이탈하고, 어떤 버튼을 가장 많이 누르는지 데이터로 확인하고 단순화한다.”"
                            />
                            <P>
                                유저들은 복잡한 차트보다 직관적인 피드 검색과 카피 생성기의 원클릭 복사 버튼을 압도적으로 많이 사용했습니다. 이를 바탕으로 옵션 뎁스를 줄이고 핵심 액션 버튼의 접근성을 개선했습니다.
                            </P>
                            <Tags items={['Amplitude', '이벤트 택소노미', '퍼널 분석', '프로덕트 주도 성장']} />
                        </section>

                        <HR />

                        {/* ── 13 Contact ── */}
                        <section id="contact" className="scroll-mt-28">
                            <H2 id="contact-title">이야기를 나눠보고 싶으시다면</H2>
                            <P>
                                PushNow 프로젝트, 그로스 마케팅과 데이터 엔지니어링에 관한 커피챗은 언제든 환영합니다.
                            </P>
                            <div className="space-y-3.5 mt-7 p-6 bg-gray-50 rounded-2xl border border-gray-200/80">
                                <a href="mailto:jongbeomcho@gmail.com"
                                    className="flex items-center gap-3.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors group p-2.5 rounded-xl hover:bg-white">
                                    <div className="w-9 h-9 rounded-lg bg-gray-200/70 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <Mail className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono">Email</p>
                                        <p className="font-semibold text-gray-900">jongbeomcho@gmail.com</p>
                                    </div>
                                </a>
                                <a href="https://github.com/chojongbeom" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors group p-2.5 rounded-xl hover:bg-white">
                                    <div className="w-9 h-9 rounded-lg bg-gray-200/70 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <Github className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono">GitHub</p>
                                        <p className="font-semibold text-gray-900">github.com/chojongbeom</p>
                                    </div>
                                </a>
                                <a href="https://www.instagram.com/hiimbeom/" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors group p-2.5 rounded-xl hover:bg-white">
                                    <div className="w-9 h-9 rounded-lg bg-gray-200/70 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <Instagram className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono">Instagram</p>
                                        <p className="font-semibold text-gray-900">instagram.com/hiimbeom</p>
                                    </div>
                                </a>
                            </div>
                        </section>

                    </main>
                </div>
            </div>

            {/* 플로팅 Top 버튼 */}
            {showTopBtn && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 rounded-full bg-gray-900 text-white shadow-xl hover:bg-gray-800 transition-all z-40 hover:scale-110"
                    aria-label="맨 위로 가기"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};
