import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HOOK_TYPE_INFO, type HookType } from '../hooks/useMarketingHooks';
import { supabase } from '../config/supabase';
import { getAppIcon } from '../utils/appIcons';

// 참조 메시지 타입
interface ReferenceFromFeed {
    app_name: string;
    title: string | null;
    body: string | null;
    category: string;
}

// ============================================
// 앱 카테고리 정의 (확장 가능한 구조)
// ============================================
interface AppCategory {
    id: string;
    name: string;
    emoji: string;
    description: string;
    apps: string[]; // 수집 중인 앱 목록
    status: 'active' | 'collecting' | 'planned'; // 데이터 수집 상태
}

const APP_CATEGORIES: AppCategory[] = [
    {
        id: 'fashion',
        name: '패션/뷰티',
        emoji: '👗',
        description: '의류, 신발, 화장품, 액세서리',
        apps: ['무신사', '29CM', '지그재그', '에이블리', 'W컨셉'],
        status: 'active',
    },
    {
        id: 'ecommerce',
        name: '종합 이커머스',
        emoji: '🛒',
        description: '식품, 생활용품, 가구, 인테리어',
        apps: ['컬리', 'N+스토어', '오늘의집'],
        status: 'active',
    },
    {
        id: 'travel',
        name: '여행/숙박',
        emoji: '✈️',
        description: '항공, 호텔, 액티비티, 렌터카',
        apps: ['마이리얼트립', '야놀자', '여기어때'],
        status: 'active',
    },
    {
        id: 'food',
        name: 'F&B/배달',
        emoji: '🍔',
        description: '음식 배달, 프랜차이즈, 카페',
        apps: ['배달의민족', '요기요', '맥도날드', '스타벅스'],
        status: 'collecting',
    },
    {
        id: 'content',
        name: '콘텐츠/엔터',
        emoji: '🎬',
        description: '웹툰, OTT, 음악, 게임',
        apps: ['네이버웹툰', '카카오웹툰', '넷플릭스'],
        status: 'collecting',
    },
    {
        id: 'education',
        name: '교육/자기계발',
        emoji: '📚',
        description: '어학, 자격증, 온라인 강의',
        apps: ['듀오링고', '클래스101', '야나두'],
        status: 'collecting',
    },
    {
        id: 'finance',
        name: '금융/핀테크',
        emoji: '💳',
        description: '은행, 증권, 간편결제',
        apps: ['토스', '카카오뱅크', '신한은행'],
        status: 'planned',
    },
    {
        id: 'health',
        name: '헬스/의료',
        emoji: '🏥',
        description: '병원 예약, 피트니스, 건강관리',
        apps: ['굿닥', '캐시워크', '눔'],
        status: 'collecting',
    },
];

// ============================================
// 카테고리별 목적 옵션
// ============================================
interface PurposeOption {
    id: string;
    name: string;
    emoji: string;
    description: string;
}

const PURPOSE_BY_CATEGORY: Record<string, PurposeOption[]> = {
    fashion: [
        { id: 'promo', name: '프로모션/할인', emoji: '🏷️', description: '세일, 쿠폰, 특가 알림' },
        { id: 'newproduct', name: '신상품 출시', emoji: '✨', description: '신상, 시즌 컬렉션 알림' },
        { id: 'restock', name: '재입고 알림', emoji: '🔔', description: '품절 상품 재입고' },
        { id: 'retention', name: '재방문 유도', emoji: '💕', description: '장바구니, 찜한 상품' },
    ],
    ecommerce: [
        { id: 'promo', name: '프로모션/할인', emoji: '🏷️', description: '세일, 쿠폰, 적립금' },
        { id: 'newproduct', name: '신상품/입고', emoji: '📦', description: '신규 입점, 새 상품' },
        { id: 'retention', name: '재방문 유도', emoji: '💕', description: '장바구니, 찜, 재구매' },
        { id: 'delivery', name: '배송/주문', emoji: '🚚', description: '배송 시작, 도착 예정' },
    ],
    travel: [
        { id: 'promo', name: '특가 항공/숙소', emoji: '✈️', description: '얼리버드, 땡처리 특가' },
        { id: 'pricedrop', name: '가격 변동 알림', emoji: '📉', description: '관심 여행지 가격 하락' },
        { id: 'retention', name: '예약 리마인드', emoji: '📅', description: '미완료 예약, 출발 임박' },
        { id: 'destination', name: '여행지 추천', emoji: '🌴', description: '인기/추천 여행지' },
    ],
    food: [
        { id: 'promo', name: '할인/쿠폰', emoji: '🎟️', description: '배달비 무료, % 할인' },
        { id: 'newmenu', name: '신메뉴 출시', emoji: '🍽️', description: '신메뉴, 시즌 메뉴' },
        { id: 'retention', name: '재주문 유도', emoji: '🔄', description: '자주 시킨 메뉴, 리오더' },
        { id: 'event', name: '이벤트/캠페인', emoji: '🎉', description: '콜라보, 한정 이벤트' },
    ],
    content: [
        { id: 'newcontent', name: '새 콘텐츠', emoji: '🆕', description: '신규 에피소드, 업데이트' },
        { id: 'recommendation', name: '추천 콘텐츠', emoji: '👍', description: '맞춤 추천, 인기 콘텐츠' },
        { id: 'retention', name: '이어보기', emoji: '▶️', description: '중단한 콘텐츠 리마인드' },
        { id: 'event', name: '이벤트/혜택', emoji: '🎁', description: '무료 이용권, 캠페인' },
    ],
    education: [
        { id: 'promo', name: '할인/이벤트', emoji: '🏷️', description: '강의 할인, 프로모션' },
        { id: 'newcourse', name: '신규 강의', emoji: '📖', description: '새 강의, 커리큘럼' },
        { id: 'retention', name: '학습 리마인드', emoji: '⏰', description: '미완료 강의, 복습' },
        { id: 'achievement', name: '목표 달성', emoji: '🏆', description: '연속 학습, 배지 획득' },
    ],
    finance: [
        { id: 'transaction', name: '거래 알림', emoji: '💸', description: '입출금, 결제 알림' },
        { id: 'benefit', name: '혜택/이벤트', emoji: '🎁', description: '캐시백, 포인트 적립' },
        { id: 'product', name: '금융 상품', emoji: '📊', description: '적금, 대출, 투자 상품' },
        { id: 'reminder', name: '리마인더', emoji: '🔔', description: '납부일, 만기일 알림' },
    ],
    health: [
        { id: 'appointment', name: '예약 알림', emoji: '📅', description: '진료 예약, 건강검진' },
        { id: 'activity', name: '활동 알림', emoji: '🏃', description: '걸음 수, 운동 목표' },
        { id: 'retention', name: '복약/관리', emoji: '💊', description: '복약 리마인드, 건강 팁' },
        { id: 'achievement', name: '목표 달성', emoji: '🎯', description: '목표 달성, 동기부여' },
    ],
};

// 기본 목적 (카테고리 매핑 없을 때)
const DEFAULT_PURPOSE: PurposeOption[] = [
    { id: 'promo', name: '프로모션/할인', emoji: '🏷️', description: '세일, 쿠폰, 특가 알림' },
    { id: 'product', name: '상품/서비스 소개', emoji: '🛍️', description: '신상품, 추천 상품' },
    { id: 'retention', name: '재방문 유도', emoji: '💕', description: '장바구니, 미완료 작업' },
    { id: 'event', name: '이벤트/캠페인', emoji: '🎉', description: '특별 이벤트, 시즌 캠페인' },
];

// ============================================
// 톤 옵션 (공통)
// ============================================
const TONE_OPTIONS = [
    { id: 'friendly', name: '친근한', emoji: '😊', example: '~해볼래요?' },
    { id: 'urgent', name: '긴박한', emoji: '🔥', example: '지금 바로! 마감 임박!' },
    { id: 'playful', name: '재미있는', emoji: '🎮', example: '두근두근~ 열어보세요!' },
    { id: 'premium', name: '프리미엄', emoji: '✨', example: '특별히 선보이는' },
];

// ============================================
// 타입 정의
// ============================================
interface GeneratedMessage {
    title: string;
    body: string;
    hook: string;
    hookType: HookType;
}

interface ReferenceMessage {
    id: number;
    app_name: string;
    title: string;
    body: string;
    marketing_hook: string;
    hook_type: HookType;
}

// ============================================
// 메인 컴포넌트
// ============================================
export const Generate: React.FC = () => {
    const location = useLocation();
    const referenceFromFeed = (location.state as { referenceMessage?: ReferenceFromFeed })?.referenceMessage;

    // Step 0: 앱 카테고리
    const [appCategory, setAppCategory] = useState<string | null>(null);
    // Step 1~4
    const [step, setStep] = useState(0);
    const [purpose, setPurpose] = useState<string | null>(null);
    const [strategy, setStrategy] = useState<HookType | null>(null);
    const [tone, setTone] = useState<string | null>(null);
    const [productName, setProductName] = useState('');
    const [keyBenefit, setKeyBenefit] = useState('');

    // 참고 메시지
    const [referenceMessages, setReferenceMessages] = useState<ReferenceMessage[]>([]);
    const [isLoadingRef, setIsLoadingRef] = useState(false);

    // 생성 결과
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Feed에서 넘어온 참조 메시지로 자동 선택
    const [autoApplied, setAutoApplied] = useState(false);

    useEffect(() => {
        if (referenceFromFeed && !autoApplied) {
            // 1. app_name으로 카테고리 찾기
            const matchedCategory = APP_CATEGORIES.find(cat =>
                cat.apps.some(app =>
                    app.toLowerCase() === referenceFromFeed.app_name.toLowerCase() ||
                    referenceFromFeed.app_name.toLowerCase().includes(app.toLowerCase())
                )
            );

            if (matchedCategory) {
                setAppCategory(matchedCategory.id);
            }

            // 2. category로 목적 매핑
            const categoryToPurpose: Record<string, string> = {
                'promo': 'promo',
                'product': 'newproduct',
                'retention': 'retention',
                'system': 'delivery',
                'transaction': 'transaction',
            };

            const mappedPurpose = categoryToPurpose[referenceFromFeed.category];
            if (mappedPurpose) {
                setPurpose(mappedPurpose);
            }

            // 3. 자동으로 적절한 단계로 이동
            if (matchedCategory && mappedPurpose) {
                setStep(2); // 전략 선택 단계로
            } else if (matchedCategory) {
                setStep(1); // 목적 선택 단계로
            } else if (mappedPurpose) {
                // 카테고리는 없지만 목적은 매핑됨 → 카테고리만 선택하면 됨
                // 목적은 이미 설정되어 있으므로 step 0에서 카테고리 선택 후 바로 step 2로 갈 수 있음
                setStep(0); // 카테고리 선택부터
            }

            setAutoApplied(true);
        }
    }, [referenceFromFeed, autoApplied]);

    // 현재 카테고리의 목적 옵션
    const purposeOptions = useMemo(() => {
        if (!appCategory) return DEFAULT_PURPOSE;
        return PURPOSE_BY_CATEGORY[appCategory] || DEFAULT_PURPOSE;
    }, [appCategory]);

    // 현재 카테고리 정보
    const currentCategory = useMemo(() => {
        return APP_CATEGORIES.find(c => c.id === appCategory);
    }, [appCategory]);

    // 전략 선택 시 참고 메시지 로드
    useEffect(() => {
        if (strategy && appCategory) {
            loadReferenceMessages(strategy, appCategory);
        }
    }, [strategy, appCategory]);

    const loadReferenceMessages = async (hookType: HookType, categoryId: string) => {
        setIsLoadingRef(true);
        try {
            const category = APP_CATEGORIES.find(c => c.id === categoryId);
            const appNames = category?.apps || [];

            let query = supabase
                .from('push_messages')
                .select('id, app_name, title, body, marketing_hook, hook_type')
                .eq('hook_type', hookType)
                .not('marketing_hook', 'is', null)
                .order('posted_at', { ascending: false })
                .limit(10);

            // 해당 카테고리 앱 필터 (앱이 있을 때만)
            if (appNames.length > 0) {
                query = query.in('app_name', appNames);
            }

            const { data, error } = await query;
            if (error) throw error;

            // 카테고리 앱 데이터가 없으면 전체에서 가져오기
            if (!data || data.length === 0) {
                const fallback = await supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, marketing_hook, hook_type')
                    .eq('hook_type', hookType)
                    .not('marketing_hook', 'is', null)
                    .order('posted_at', { ascending: false })
                    .limit(10);

                setReferenceMessages(fallback.data || []);
            } else {
                setReferenceMessages(data);
            }
        } catch (err) {
            console.error('Failed to load reference messages:', err);
        } finally {
            setIsLoadingRef(false);
        }
    };

    const handleGenerate = async () => {
        if (!appCategory || !purpose || !strategy || !tone) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await supabase.functions.invoke('generate-push-message', {
                body: {
                    appCategory,
                    purpose,
                    strategy,
                    tone,
                    productName: productName || undefined,
                    keyBenefit: keyBenefit || undefined,
                    referenceMessages: referenceMessages.slice(0, 5).map(m => ({
                        title: m.title,
                        body: m.body,
                        hook: m.marketing_hook,
                    })),
                },
            });

            if (response.error) throw response.error;

            setGeneratedMessages(response.data.messages || []);
            setStep(5);
        } catch (err) {
            setError(err instanceof Error ? err.message : '메시지 생성에 실패했습니다');
            setStep(5);
        } finally {
            setIsGenerating(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 0: return !!appCategory;
            case 1: return !!purpose;
            case 2: return !!strategy;
            case 3: return !!tone;
            case 4: return true;
            default: return false;
        }
    };

    const nextStep = () => {
        if (canProceed() && step < 4) {
            // 참조 메시지에서 목적이 이미 선택되어 있으면 step 1 건너뛰기
            if (step === 0 && purpose) {
                setStep(2); // 전략 선택으로 바로 이동
            } else {
                setStep(step + 1);
            }
        } else if (step === 4) {
            handleGenerate();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const resetAll = () => {
        setStep(0);
        setAppCategory(null);
        setPurpose(null);
        setStrategy(null);
        setTone(null);
        setProductName('');
        setKeyBenefit('');
        setGeneratedMessages([]);
        setReferenceMessages([]);
        setError(null);
    };

    // 카테고리 변경 시 목적 초기화 (참조 메시지가 있고 목적이 이미 설정되어 있으면 유지)
    const handleCategoryChange = (categoryId: string) => {
        setAppCategory(categoryId);
        // 참조 메시지에서 자동 선택된 목적은 유지
        if (!referenceFromFeed || !purpose) {
            setPurpose(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* 참조 메시지 배너 */}
                {referenceFromFeed && (
                    <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📌</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-violet-800 mb-1">
                                    "{referenceFromFeed.app_name}" 메시지를 참고합니다
                                </p>
                                {/* 자동 선택 상태 표시 */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {appCategory ? (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                            ✓ {currentCategory?.name} 카테고리
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                            ⚠ 카테고리 선택 필요
                                        </span>
                                    )}
                                    {purpose ? (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                            ✓ {purposeOptions.find(p => p.id === purpose)?.name || referenceFromFeed.category} 목적
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            목적 선택 필요
                                        </span>
                                    )}
                                </div>
                                <div className="bg-white/60 rounded-lg p-2 text-xs text-gray-700">
                                    {referenceFromFeed.title && (
                                        <p className="font-medium truncate">{referenceFromFeed.title}</p>
                                    )}
                                    {referenceFromFeed.body && (
                                        <p className="text-gray-500 truncate">{referenceFromFeed.body}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={resetAll}
                                className="text-xs text-violet-600 hover:text-violet-800 underline flex-shrink-0"
                            >
                                처음부터
                            </button>
                        </div>
                    </div>
                )}

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        ✨ AI 메시지 추천
                    </h1>
                    <p className="text-gray-500">
                        5단계로 완성하는 효과적인 푸시 메시지
                    </p>
                </div>

                {/* 진행 바 */}
                {step < 5 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            {[0, 1, 2, 3, 4].map(s => (
                                <div
                                    key={s}
                                    className={`
                                        flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm
                                        transition-all duration-300
                                        ${step >= s
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                        }
                                    `}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gray-900 transition-all duration-500"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>앱 종류</span>
                            <span>목적</span>
                            <span>전략</span>
                            <span>톤</span>
                            <span>상세</span>
                        </div>
                    </div>
                )}

                {/* Step 0: 앱 카테고리 선택 */}
                {step === 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            0️⃣ 어떤 앱인가요?
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {APP_CATEGORIES.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryChange(category.id)}
                                    disabled={category.status === 'planned'}
                                    className={`
                                        p-4 rounded-2xl text-left transition-all relative
                                        ${appCategory === category.id
                                            ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                                            : category.status === 'planned'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    {category.status === 'collecting' && (
                                        <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                                            수집중
                                        </span>
                                    )}
                                    {category.status === 'planned' && (
                                        <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                                            예정
                                        </span>
                                    )}
                                    <span className="text-2xl mb-2 block">{category.emoji}</span>
                                    <h3 className={`font-bold text-sm ${appCategory === category.id ? 'text-white' : category.status === 'planned' ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {category.name}
                                    </h3>
                                    <p className={`text-xs mt-1 line-clamp-1 ${appCategory === category.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {category.description}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* 선택된 카테고리 앱 목록 */}
                        {currentCategory && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                    📱 {currentCategory.name} 수집 앱
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {currentCategory.apps.map(app => (
                                        <span
                                            key={app}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-sm"
                                        >
                                            <img
                                                src={getAppIcon(app)}
                                                alt={app}
                                                className="w-4 h-4 rounded"
                                            />
                                            {app}
                                        </span>
                                    ))}
                                </div>
                                {currentCategory.status === 'collecting' && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        ⚠️ 이 카테고리는 데이터 수집 중입니다. 참고 메시지가 부족할 수 있어요.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: 목적 선택 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            1️⃣ 메시지의 목적을 선택하세요
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {purposeOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setPurpose(option.id)}
                                    className={`
                                        p-5 rounded-2xl text-left transition-all
                                        ${purpose === option.id
                                            ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                                            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <span className="text-3xl mb-2 block">{option.emoji}</span>
                                    <h3 className={`font-bold text-lg ${purpose === option.id ? 'text-white' : 'text-gray-900'}`}>
                                        {option.name}
                                    </h3>
                                    <p className={`text-sm mt-1 ${purpose === option.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {option.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: 전략 선택 */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            2️⃣ 마케팅 전략을 선택하세요
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(Object.entries(HOOK_TYPE_INFO) as [HookType, typeof HOOK_TYPE_INFO[HookType]][])
                                .filter(([type]) => type !== 'other')
                                .map(([type, info]) => (
                                    <button
                                        key={type}
                                        onClick={() => setStrategy(type)}
                                        className={`
                                            p-4 rounded-xl text-left transition-all
                                            ${strategy === type
                                                ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                                                : `${info.color} hover:opacity-80`
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{info.emoji}</span>
                                            <div>
                                                <h3 className={`font-bold ${strategy === type ? 'text-white' : ''}`}>
                                                    {info.name}
                                                </h3>
                                                <p className={`text-xs mt-0.5 ${strategy === type ? 'text-gray-300' : 'opacity-80'}`}>
                                                    {info.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                        </div>

                        {/* 참고 메시지 미리보기 */}
                        {strategy && (
                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-500 mb-3">
                                    📚 {currentCategory?.name || '전체'} - {HOOK_TYPE_INFO[strategy].name} 메시지 참고 예시
                                </h4>
                                {isLoadingRef ? (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                        로딩 중...
                                    </div>
                                ) : referenceMessages.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {referenceMessages.slice(0, 5).map(msg => (
                                            <div
                                                key={msg.id}
                                                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                                            >
                                                <img
                                                    src={getAppIcon(msg.app_name)}
                                                    alt={msg.app_name}
                                                    className="w-6 h-6 rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{msg.title}</p>
                                                    <p className="text-gray-500 truncate">{msg.body}</p>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full flex-shrink-0">
                                                    {msg.marketing_hook}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">참고할 수 있는 메시지가 없습니다</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: 톤 선택 */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            3️⃣ 메시지 톤을 선택하세요
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {TONE_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setTone(option.id)}
                                    className={`
                                        p-5 rounded-2xl text-left transition-all
                                        ${tone === option.id
                                            ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                                            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <span className="text-3xl mb-2 block">{option.emoji}</span>
                                    <h3 className={`font-bold ${tone === option.id ? 'text-white' : 'text-gray-900'}`}>
                                        {option.name}
                                    </h3>
                                    <p className={`text-sm mt-1 ${tone === option.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {option.example}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: 상세 정보 */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            4️⃣ 추가 정보를 입력하세요 (선택)
                        </h2>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    상품/서비스명
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={e => setProductName(e.target.value)}
                                    placeholder="예: 봄 신상 원피스, 제주 3박4일 패키지"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    핵심 혜택/메시지
                                </label>
                                <input
                                    type="text"
                                    value={keyBenefit}
                                    onChange={e => setKeyBenefit(e.target.value)}
                                    placeholder="예: 50% 할인, 무료배송, 오늘만 특가"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* 선택 요약 */}
                        <div className="bg-gray-100 rounded-2xl p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-3">📋 선택 요약</h4>
                            <div className="flex flex-wrap gap-2">
                                {currentCategory && (
                                    <span className="px-3 py-1 bg-white rounded-full text-sm">
                                        {currentCategory.emoji} {currentCategory.name}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-white rounded-full text-sm">
                                    {purposeOptions.find(p => p.id === purpose)?.emoji}{' '}
                                    {purposeOptions.find(p => p.id === purpose)?.name}
                                </span>
                                {strategy && (
                                    <span className={`px-3 py-1 rounded-full text-sm ${HOOK_TYPE_INFO[strategy].color}`}>
                                        {HOOK_TYPE_INFO[strategy].emoji} {HOOK_TYPE_INFO[strategy].name}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-white rounded-full text-sm">
                                    {TONE_OPTIONS.find(t => t.id === tone)?.emoji}{' '}
                                    {TONE_OPTIONS.find(t => t.id === tone)?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: 결과 */}
                {step === 5 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                🎉 AI 추천 메시지
                            </h2>
                            <p className="text-gray-500">
                                마음에 드는 메시지를 선택해 사용하세요
                            </p>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={resetAll}
                                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                                >
                                    다시 시도
                                </button>
                            </div>
                        ) : generatedMessages.length > 0 ? (
                            <div className="space-y-4">
                                {generatedMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                                                {HOOK_TYPE_INFO[msg.hookType]?.emoji || '📱'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 text-lg mb-1">
                                                    {msg.title}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {msg.body}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className={`px-2 py-1 rounded-lg text-xs ${HOOK_TYPE_INFO[msg.hookType]?.color || 'bg-gray-100'}`}>
                                                        {msg.hook}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${msg.title}\n${msg.body}`);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                                title="복사하기"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-2xl p-8 text-center">
                                <p className="text-gray-500">생성된 메시지가 없습니다</p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={resetAll}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                            >
                                처음부터 다시
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                다시 생성
                            </button>
                        </div>
                    </div>
                )}

                {/* 네비게이션 버튼 */}
                {step < 5 && (
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={prevStep}
                            disabled={step === 0}
                            className={`
                                px-6 py-3 rounded-xl font-medium transition-all
                                ${step === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            `}
                        >
                            ← 이전
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!canProceed() || isGenerating}
                            className={`
                                px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                                ${canProceed()
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    생성 중...
                                </>
                            ) : step === 4 ? (
                                '✨ AI 생성하기'
                            ) : (
                                '다음 →'
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
