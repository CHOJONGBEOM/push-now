import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { HOOK_TYPE_INFO, TRIGGER_INFO, type HookType, type TriggerType } from '../hooks/useMarketingHooks';
import { supabase } from '../config/supabase';
import { getAppIcon } from '../utils/appIcons';
import { GENERATE_APP_CATEGORIES, getGenerateCategoryById } from '../utils/appCategories';
import { trackEvent } from '../utils/analytics';

// ==========================================
// 1. 타입 정의
// ==========================================
type PurposeId = 'PROMO' | 'NEWS' | 'RECOVERY' | 'VALUE';

interface GeneratedMessage {
    title: string;
    body: string;
    hook: string;
    hookType: HookType;
    style?: string;
    angle?: string;
}

interface ReferenceMessage {
    id: number;
    app_name: string;
    title: string;
    body: string;
    marketing_hook: string;
    hook_type: HookType;
}

// ==========================================
// 3. 목적별 설정 (MECE 분류)
// ==========================================
const PURPOSE_CONFIG: Record<PurposeId, { name: string; emoji: string; desc: string }> = {
    PROMO: { name: '혜택/특가', emoji: '💰', desc: '할인, 쿠폰, 타임세일, 최저가 알림' },
    NEWS: { name: '신상/소식', emoji: '🆕', desc: '신제품 출시, 재입고, 업데이트 소식' },
    RECOVERY: { name: '미완료/리마인드', emoji: '🔔', desc: '장바구니, 포인트 소멸, 미결제 확인' },
    VALUE: { name: '추천/발견', emoji: '🔍', desc: '취향 맞춤 추천, 랭킹, 큐레이션' },
};

// 목적별 추천 전략 매핑
const STRATEGIES_BY_PURPOSE: Record<PurposeId, HookType[]> = {
    PROMO: ['price', 'urgency', 'benefit', 'newness', 'social_proof', 'curiosity'],
    NEWS: ['newness', 'curiosity', 'social_proof', 'personal', 'price', 'benefit'],
    RECOVERY: ['personal', 'urgency', 'benefit', 'social_proof', 'curiosity', 'newness'],
    VALUE: ['social_proof', 'personal', 'curiosity', 'newness', 'benefit', 'urgency'],
};

// 전략 → 심리 트리거 매핑
const STRATEGY_TRIGGER_MAP: Record<HookType, TriggerType> = {
    price: 'greed',
    urgency: 'urgency',
    personal: 'personalization',
    curiosity: 'curiosity',
    newness: 'novelty',
    social_proof: 'social_proof',
    benefit: 'greed',
    content: 'relevance',
    event: 'fun',
    community: 'social_proof',
    other: 'none',
};

// ==========================================
// 4. 톤 옵션
// ==========================================
const TONE_OPTIONS = [
    { id: 'friendly', name: '친근/공감', emoji: '😊', desc: '친구에게 말하듯 부드럽게', example: '이거 완전 찰떡일 것 같아요 💕' },
    { id: 'direct', name: '간결/직관', emoji: '🎯', desc: '군더더기 없이 핵심만', example: '주문하신 상품이 발송되었습니다.' },
    { id: 'witty', name: '재치/유머', emoji: '✨', desc: '센스 있는 드립', example: '이 가격 실화? 담당자 실수인듯 ㅋㅋ' },
    { id: 'polite', name: '정중/신뢰', emoji: '👔', desc: '예의 바르고 신뢰감', example: '소중한 고객님을 위한 특별한 혜택입니다.' },
];

// ==========================================
// 5. 전략별 설명 문구 (동어반복 피하기)
// ==========================================
const STRATEGY_DESCRIPTIONS: Record<HookType, string> = {
    price: '"이 가격에 살 수 있다고?" 합리적 소비 욕구를 자극해요.',
    urgency: '"지금 아니면 못 산다!" 즉각적인 행동을 유도해요.',
    personal: '"나만을 위한 추천이네?" 특별함을 느끼게 해요.',
    curiosity: '"뭐지? 궁금해!" 클릭하고 싶은 충동을 만들어요.',
    newness: '"새로 나왔대!" 트렌드에 뒤처지기 싫은 심리를 건드려요.',
    social_proof: '"다들 사나봐" 검증된 선택이라는 안심을 줘요.',
    benefit: '"덤으로 이것까지?" 얻는 게 많다는 느낌을 줘요.',
    content: '유용한 정보로 자연스럽게 관심을 끌어요.',
    event: '참여하고 싶은 재미를 제공해요.',
    community: '소속감과 연결의 욕구를 자극해요.',
    other: '다양한 심리 요소를 활용해요.',
};

const REFERENCE_MESSAGE_LIMIT = 20;

function pickBySeed(items: string[], seed: number): string {
    if (items.length === 0) return '';
    let hash = seed >>> 0;
    for (let i = 0; i < items.length; i++) {
        hash = (hash * 33 + items[i].charCodeAt(0)) >>> 0;
    }
    return items[hash % items.length];
}

// ==========================================
// 6. 목적별 입력 가이드 & 칩
// ==========================================
const INPUT_GUIDES: Record<PurposeId, {
    targetPlaceholder: string;
    targetPlaceholderVariants?: string[];
    targetChips: string[];
    productPlaceholder: string;
    productPlaceholderVariants?: string[];
    productChips: string[];
    benefitPlaceholder: string;
    benefitPlaceholderVariants?: string[];
    benefitChips: string[];
}> = {
    PROMO: {
        targetPlaceholder: '예: 장바구니에 담고 결제 안 한 유저',
        targetPlaceholderVariants: ['예: 최근 7일 내 상품 조회 후 이탈한 유저', '예: 쿠폰 발급 후 미사용 고객', '예: 재방문 빈도가 높은 VIP 고객'],
        targetChips: ['전체 회원', 'VIP 고객', '휴면 회원', '첫 구매 유저', '재구매 고객', '앱 미설치자', '쿠폰 보유 고객', '최근 이탈 고객', '장바구니 보유 고객', '앱 푸시 동의 고객'],
        productPlaceholder: '예: 설맞이 특가 모음집, 한우 선물세트',
        productPlaceholderVariants: ['예: 주말 한정 타임딜 상품', '예: 시즌오프 아우터 모음', '예: 브랜드 위크 특가 상품'],
        productChips: ['시즌 세일', '브랜드 특가', '타임딜 상품', '베스트셀러', '신상품 할인', '카테고리 특가', '원플원 상품', '선물세트', '주말 특가', '오늘의 추천'],
        benefitPlaceholder: '예: 최대 50% 쿠폰 즉시 지급',
        benefitPlaceholderVariants: ['예: 결제 시 즉시 10% 추가 할인', '예: 구매 금액대별 쿠폰 자동 적용', '예: 적립금 더블 적립 이벤트'],
        benefitChips: ['최대 50% 할인', '1만원 쿠폰', '무료배송', '적립금 2배', '선착순 100명', '오늘만 특가', '추가 10% 할인', '사은품 증정', '카드사 할인', '첫 구매 쿠폰', '묶음 구매 할인', '즉시 할인'],
    },
    NEWS: {
        targetPlaceholder: '예: 브랜드 찜한 유저, 관심 카테고리 구독자',
        targetPlaceholderVariants: ['예: 신상품 알림 구독 고객', '예: 최근 30일 내 브랜드 방문 고객', '예: 컬렉션 공개 알림 신청자'],
        targetChips: ['브랜드 팬', '카테고리 관심자', '알림 수신 동의자', '최근 방문자', '위시리스트 유저', '신상품 알림 구독자', '콜라보 관심자', '런칭 페이지 방문자', '재입고 대기 고객', '콘텐츠 구독자'],
        productPlaceholder: '예: 반스 메탈 컬렉션, 뉴발란스 하트 라인',
        productPlaceholderVariants: ['예: 단독 런칭 컬렉션', '예: 재입고 예정 인기 제품', '예: 신규 브랜드 입점 라인업'],
        productChips: ['신상품', '한정판', '콜라보', '시즌 컬렉션', '단독 발매', '재입고 상품', '신규 입점', '룩북 공개', '프리오더', '라이브 특집'],
        benefitPlaceholder: '예: 무신사 단독 발매, 2차 라인업 오픈',
        benefitPlaceholderVariants: ['예: 런칭 첫 주 한정 혜택', '예: 사전 알림 신청자 우선 공개', '예: 입점 기념 쿠폰 즉시 지급'],
        benefitChips: ['단독 선발매', '사전 예약 오픈', '얼리버드 특가', '런칭 기념 쿠폰', '한정 수량', '컬렉션 공개', '재입고 알림', '시즌 오픈', '첫 공개 특전', '입점 기념 혜택', '프리오더 혜택', '라이브 한정 혜택'],
    },
    RECOVERY: {
        targetPlaceholder: '예: 장바구니 이탈자, 결제 미완료 유저',
        targetPlaceholderVariants: ['예: 결제 단계에서 이탈한 고객', '예: 쿠폰 만료 임박 고객', '예: 최근 관심 상품 재방문 고객'],
        targetChips: ['장바구니 이탈자', '찜만 한 유저', '검색만 한 유저', '앱 미접속 7일', '쿠폰 미사용자', '포인트 소멸 예정자', '최근 3일 이탈자', '결제 직전 이탈자', '가격 비교 고객', '재방문 고객'],
        productPlaceholder: '예: 장바구니 담은 상품, 찜한 숙소',
        productPlaceholderVariants: ['예: 결제 직전까지 본 상품', '예: 관심 등록한 숙소/상품', '예: 최근 조회한 카테고리 상품'],
        productChips: ['장바구니 상품', '찜한 상품', '최근 본 상품', '비교한 상품', '검색한 상품', '재입고 상품', '가격 인하 상품', '옵션 재고 확보 상품', '유사 추천 상품', '관심 카테고리 상품'],
        benefitPlaceholder: '예: 쿠폰이 2일 뒤 사라져요',
        benefitPlaceholderVariants: ['예: 오늘 자정 전 결제 시 추가 할인', '예: 포인트 소멸 전 사용 가능', '예: 재입고 기념 한정 쿠폰'],
        benefitChips: ['2일 뒤 소멸', '품절 임박', '재고 3개 남음', '가격 인상 예정', '딱 24시간', '마지막 기회', '곧 종료', '지금 결제 시 추가 할인', '소멸 예정 포인트', '주말 한정 쿠폰', '배송비 무료', '즉시 복귀 혜택'],
    },
    VALUE: {
        targetPlaceholder: '예: 20대 여성, 운동 관심 유저',
        targetPlaceholderVariants: ['예: 출근길에 앱을 자주 여는 고객', '예: 주말 레저/여행 관심 고객', '예: 라이프스타일 콘텐츠 관심 고객'],
        targetChips: ['20대 여성', '30대 직장인', '신혼부부', '자취생', '운동러', '뷰티 관심자', '맛집 탐방러', '여행 관심자', '가성비 선호층', '프리미엄 선호층'],
        productPlaceholder: '예: 성수동 핫플 모음, 살로몬 BEST SELLER',
        productPlaceholderVariants: ['예: 이번 주 인기 급상승 리스트', '예: 에디터 큐레이션 모음', '예: 실시간 트렌드 아이템'],
        productChips: ['인기 급상승', '베스트셀러', '에디터 픽', 'MD 추천', '숨은 맛집', '핫플 모음', '실시간 인기', '카테고리 추천', '트렌드 아이템', '입문자 추천'],
        benefitPlaceholder: '예: 후기 1천개 돌파, 담당자 강력 추천',
        benefitPlaceholderVariants: ['예: 최근 후기 급증, 만족도 상위권', '예: 실시간 인기 순위 상위', '예: 재구매율 높은 추천 아이템'],
        benefitChips: ['후기 1천개 돌파', '재구매율 1위', 'MD 강력 추천', '실시간 랭킹 1위', '평점 4.9', '좋아요 급상승', '이번 주 BEST', '찜 1만 돌파', '구매 전환율 상위', '리뷰 평점 우수', '추천 순위 급상승', '커뮤니티 인기'],
    },
};

const CATEGORY_PRODUCT_PLACEHOLDER_HINTS: Record<string, Partial<Record<PurposeId, string[]>>> = {
    fashion: {
        PROMO: ['예: 봄 아우터 특가, 데님 컬렉션 할인', '예: 신상 스니커즈 타임세일, 브랜드 위크'],
        NEWS: ['예: 25SS 신상 컬렉션, 한정 드롭 라인'],
        RECOVERY: ['예: 장바구니 속 원피스, 찜한 자켓'],
        VALUE: ['예: 에디터 추천 코디, 실시간 인기 룩'],
    },
    ecommerce: {
        PROMO: ['예: 리빙 특가 모음, 주방 가전 타임딜'],
    },
    travel: {
        PROMO: ['예: 제주 숙소 특가, 주말 항공권 할인'],
    },
};

// ==========================================
// 6. 메인 컴포넌트
// ==========================================
export const Generate: React.FC = () => {
    // 상태
    const [appCategory, setAppCategory] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [purpose, setPurpose] = useState<PurposeId | null>(null);
    const [strategy, setStrategy] = useState<HookType | null>(null);
    const [tone, setTone] = useState<string>('friendly');
    const [productName, setProductName] = useState('');
    const [keyBenefit, setKeyBenefit] = useState('');
    const [targetAudience, setTargetAudience] = useState('');

    // 참고 메시지
    const [referenceMessages, setReferenceMessages] = useState<ReferenceMessage[]>([]);
    const [styleCorpusMessages, setStyleCorpusMessages] = useState<ReferenceMessage[]>([]);
    const [isLoadingRef, setIsLoadingRef] = useState(false);
    const [isFallbackRef, setIsFallbackRef] = useState(false);

    // 생성 결과
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 복사 토스트
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [placeholderSeed, setPlaceholderSeed] = useState(() => Date.now());

    // 현재 카테고리 정보
    const currentCategory = useMemo(() => {
        return getGenerateCategoryById(appCategory);
    }, [appCategory]);

    const currentGuide = useMemo(() => {
        if (!purpose) return null;
        const guide = INPUT_GUIDES[purpose];
        const categoryProductHints = appCategory
            ? (CATEGORY_PRODUCT_PLACEHOLDER_HINTS[appCategory]?.[purpose] || [])
            : [];
        const targetPool = [guide.targetPlaceholder, ...(guide.targetPlaceholderVariants || [])];
        const productPool = [...categoryProductHints, guide.productPlaceholder, ...(guide.productPlaceholderVariants || [])];
        const benefitPool = [guide.benefitPlaceholder, ...(guide.benefitPlaceholderVariants || [])];

        return {
            ...guide,
            targetPlaceholder: pickBySeed(targetPool, placeholderSeed + 11),
            productPlaceholder: pickBySeed(productPool, placeholderSeed + 23),
            benefitPlaceholder: pickBySeed(benefitPool, placeholderSeed + 37),
        };
    }, [purpose, placeholderSeed, appCategory]);

    // 배열 랜덤 셔플 함수
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const countChars = (text: string) => Array.from((text || '').trim()).length;

    // 참고 메시지 로드 (최근 1년 + 작년 동월 2개 우선)
    const loadReferenceMessages = async (hookType: HookType, categoryId: string) => {
        setIsLoadingRef(true);
        setIsFallbackRef(false);
        try {
            const category = getGenerateCategoryById(categoryId);
            const appNames = category?.apps || [];

            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();

            // 작년 동월 범위 (계절감 반영)
            const lastYearSameMonthStart = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();
            const lastYearSameMonthEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0, 23, 59, 59).toISOString();

            let seasonalMessages: ReferenceMessage[] = [];
            let recentMessages: ReferenceMessage[] = [];

            // 1. 작년 동월 메시지 (계절감) - 최대 2개
            let seasonalQuery = supabase
                .from('push_messages')
                .select('id, app_name, title, body, marketing_hook, hook_type')
                .eq('hook_type', hookType)
                .not('marketing_hook', 'is', null)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .gte('posted_at', lastYearSameMonthStart)
                .lte('posted_at', lastYearSameMonthEnd)
                .limit(20);

            if (appNames.length > 0) {
                seasonalQuery = seasonalQuery.in('app_name', appNames);
            }

            const { data: seasonalData } = await seasonalQuery;
            if (seasonalData && seasonalData.length > 0) {
                seasonalMessages = shuffleArray(seasonalData as ReferenceMessage[]).slice(0, 2);
            }

            // 2. 최근 1년 메시지 (작년 동월 제외) - 나머지 채우기
            const seasonalIds = seasonalMessages.map(m => m.id);
            const remainingCount = REFERENCE_MESSAGE_LIMIT - seasonalMessages.length;

            let recentQuery = supabase
                .from('push_messages')
                .select('id, app_name, title, body, marketing_hook, hook_type')
                .eq('hook_type', hookType)
                .not('marketing_hook', 'is', null)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .gte('posted_at', oneYearAgo)
                .limit(60); // 랜덤 샘플링 위해 넉넉히

            if (appNames.length > 0) {
                recentQuery = recentQuery.in('app_name', appNames);
            }

            const { data: recentData, error } = await recentQuery;
            if (error) throw error;

            if (recentData && recentData.length > 0) {
                // 이미 선택된 계절 메시지 제외 후 랜덤 샘플링
                const filtered = (recentData as ReferenceMessage[]).filter(m => !seasonalIds.includes(m.id));
                recentMessages = shuffleArray(filtered).slice(0, remainingCount);
            }

            // 3. 결과 합치기
            const combined = [...seasonalMessages, ...recentMessages];

            if (combined.length > 0) {
                setReferenceMessages(combined);
            } else {
                // Fallback: 전체에서 (카테고리 무관)
                const fallback = await supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, marketing_hook, hook_type')
                    .eq('hook_type', hookType)
                    .not('marketing_hook', 'is', null)
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .gte('posted_at', oneYearAgo)
                    .limit(40);

                if (fallback.data && fallback.data.length > 0) {
                    setReferenceMessages(shuffleArray(fallback.data as ReferenceMessage[]).slice(0, REFERENCE_MESSAGE_LIMIT));
                    setIsFallbackRef(true);
                } else {
                    // 1년 내 데이터도 없으면 전체에서
                    const anyData = await supabase
                        .from('push_messages')
                        .select('id, app_name, title, body, marketing_hook, hook_type')
                        .eq('hook_type', hookType)
                        .not('marketing_hook', 'is', null)
                        .or('is_hidden.is.null,is_hidden.eq.false')
                        .order('posted_at', { ascending: false })
                        .limit(REFERENCE_MESSAGE_LIMIT);

                    if (anyData.data && anyData.data.length > 0) {
                        setReferenceMessages(shuffleArray(anyData.data as ReferenceMessage[]));
                        setIsFallbackRef(true);
                    } else {
                        setReferenceMessages([]);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load references:', err);
        } finally {
            setIsLoadingRef(false);
        }
    };

    // 스타일 코퍼스 로드 (카테고리 기준, 전략 무관)
    const loadStyleCorpusMessages = async (categoryId: string) => {
        try {
            const category = getGenerateCategoryById(categoryId);
            const appNames = category?.apps || [];
            const oneYearAgo = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).toISOString();

            let query = supabase
                .from('push_messages')
                .select('id, app_name, title, body, marketing_hook, hook_type')
                .not('marketing_hook', 'is', null)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .gte('posted_at', oneYearAgo)
                .limit(400);

            if (appNames.length > 0) {
                query = query.in('app_name', appNames);
            }

            const { data, error } = await query;
            if (error) throw error;
            const rows = (data || []) as ReferenceMessage[];
            setStyleCorpusMessages(shuffleArray(rows).slice(0, 120));
        } catch (err) {
            console.error('Failed to load style corpus:', err);
            setStyleCorpusMessages([]);
        }
    };

    // 전략 선택 시 참고 메시지 로드
    useEffect(() => {
        if (strategy && appCategory) {
            loadReferenceMessages(strategy, appCategory);
        }
    }, [strategy, appCategory]);

    useEffect(() => {
        if (appCategory) loadStyleCorpusMessages(appCategory);
    }, [appCategory]);

    useEffect(() => {
        if (purpose) setPlaceholderSeed(Date.now());
    }, [purpose]);

    // 메시지 생성
    const handleGenerate = async () => {
        if (!purpose || !strategy || !tone) return;

        trackEvent('generate_started', {
            category: appCategory,
            purpose,
            strategy,
            tone,
        });

        setIsGenerating(true);
        setError(null);

        try {
            // Edge Function 호출
            const response = await supabase.functions.invoke('generate-push-message', {
                body: {
                    appCategory: currentCategory?.id || 'general',
                    purpose: purpose.toLowerCase(),
                    strategy,
                    tone,
                    productName: productName || undefined,
                    keyBenefit: keyBenefit || undefined,
                    targetAudience: targetAudience || undefined,
                    referenceMessages: referenceMessages.slice(0, REFERENCE_MESSAGE_LIMIT).map(m => ({
                        title: m.title,
                        body: m.body,
                        hook: m.marketing_hook,
                    })),
                    styleMessages: styleCorpusMessages.slice(0, 120).map(m => ({
                        title: m.title,
                        body: m.body,
                        hook: m.marketing_hook,
                    })),
                    previousMessages: generatedMessages.map(m => ({
                        title: m.title,
                        body: m.body,
                        angle: m.angle,
                    })),
                    generationNonce: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                },
            });

            if (response.error) throw response.error;

            const msgs = response.data.messages || [];
            setGeneratedMessages(msgs);
            trackEvent('generate_completed', {
                category: appCategory,
                purpose,
                strategy,
                tone,
                message_count: msgs.length,
            });
            setStep(6);
        } catch (err) {
            trackEvent('generate_failed', { category: appCategory, purpose, strategy });
            setError(err instanceof Error ? err.message : '메시지 생성에 실패했습니다');
            setStep(6);
        } finally {
            setIsGenerating(false);
        }
    };

    // 칩 토글 (추가/제거)
    const toggleChip = (
        text: string,
        currentValue: string,
        setValue: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const chips = currentValue.split(', ').filter(c => c.trim());
        if (chips.includes(text)) {
            // 제거
            setValue(chips.filter(c => c !== text).join(', '));
        } else {
            // 추가
            setValue(currentValue ? `${currentValue}, ${text}` : text);
        }
    };

    // 복사
    const handleCopy = (title: string, body: string) => {
        navigator.clipboard.writeText(`${title}\n${body}`);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
        trackEvent('message_copied', { category: appCategory, purpose, strategy, tone });
    };

    // 리셋
    const resetAll = () => {
        setStep(1);
        setAppCategory(null);
        setPurpose(null);
        setStrategy(null);
        setTone('friendly');
        setProductName('');
        setKeyBenefit('');
        setTargetAudience('');
        setPlaceholderSeed(Date.now());
        setGeneratedMessages([]);
        setReferenceMessages([]);
        setError(null);
    };

    // 스텝 정보
    const STEPS = [
        { num: 1, label: '앱 종류' },
        { num: 2, label: '목적' },
        { num: 3, label: '전략' },
        { num: 4, label: '톤' },
        { num: 5, label: '상세' },
    ];

    // 다음 스텝으로 이동 가능 여부
    const canGoNext = useMemo(() => {
        switch (step) {
            case 1: return !!appCategory;
            case 2: return !!purpose;
            case 3: return !!strategy;
            case 4: return !!tone;
            case 5: return true;
            default: return false;
        }
    }, [step, appCategory, purpose, strategy, tone]);

    // 네비게이션
    const goNext = () => {
        if (step < 5 && canGoNext) {
            trackEvent('generate_step_changed', { from_step: step, to_step: step + 1, category: appCategory, purpose, strategy });
            setStep(step + 1);
        }
    };
    const goPrev = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-32">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                {/* 헤더 */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">✨ AI 메시지 추천</h1>
                    <p className="text-gray-500">5단계로 완성하는 효과적인 푸시 메시지</p>
                </div>

                {/* 프로그레스 바 */}
                {step < 6 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between">
                            {STEPS.map((s, idx) => (
                                <React.Fragment key={s.num}>
                                    <button
                                        onClick={() => s.num < step && setStep(s.num)}
                                        disabled={s.num > step}
                                        className={`
                                            flex flex-col items-center gap-2 transition-all
                                            ${s.num < step ? 'cursor-pointer' : s.num === step ? '' : 'opacity-40 cursor-not-allowed'}
                                        `}
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all
                                            ${s.num < step
                                                ? 'bg-amber-400 text-white'
                                                : s.num === step
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }
                                        `}>
                                            {s.num}
                                        </div>
                                        <span className={`text-sm ${s.num === step ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                            {s.label}
                                        </span>
                                    </button>
                                    {idx < STEPS.length - 1 && (
                                        <div className={`flex-1 h-1 mx-3 rounded-full ${s.num < step ? 'bg-amber-400' : 'bg-gray-200'}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 0: 카테고리 선택 */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white text-sm flex items-center justify-center">1</span>
                            어떤 앱인가요?
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {GENERATE_APP_CATEGORIES.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setAppCategory(category.id)}
                                    className={`
                                        relative p-5 rounded-2xl border-2 text-left transition-all bg-white
                                        ${appCategory === category.id
                                            ? 'border-gray-900 shadow-lg'
                                            : 'border-transparent hover:border-gray-200 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <span className="text-3xl mb-3 block">{category.emoji}</span>
                                    <span className="font-bold text-gray-900 block mb-1">{category.name}</span>
                                    <span className="text-xs text-gray-500 leading-relaxed">{category.description}</span>
                                </button>
                            ))}
                        </div>

                        {/* 선택된 카테고리의 수집 앱 목록 */}
                        {currentCategory && (
                            <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">{currentCategory.emoji}</span>
                                    <span className="font-bold text-gray-900">{currentCategory.name} 수집 앱</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentCategory.apps.map(app => (
                                        <div
                                            key={app}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100"
                                        >
                                            <img src={getAppIcon(app)} alt={app} className="w-5 h-5 rounded" />
                                            <span className="text-sm text-gray-700">{app}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: 목적 선택 */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-gray-900 text-white text-sm flex items-center justify-center">2</span>
                                어떤 목적인가요?
                            </h2>
                            <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-500">{currentCategory?.emoji} {currentCategory?.name}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(Object.keys(PURPOSE_CONFIG) as PurposeId[]).map((pId) => {
                                const config = PURPOSE_CONFIG[pId];
                                return (
                                    <button
                                        key={pId}
                                        onClick={() => {
                                            setPurpose(pId);
                                            setStrategy(null);
                                        }}
                                        className={`
                                            p-5 text-left border-2 rounded-2xl transition-all bg-white
                                            ${purpose === pId
                                                ? 'border-gray-900 shadow-lg'
                                                : 'border-transparent hover:border-gray-200 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div className="text-2xl mb-2">{config.emoji}</div>
                                        <div className="font-bold text-gray-900 mb-1">{config.name}</div>
                                        <div className="text-sm text-gray-500">{config.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: 전략 선택 */}
                {step === 3 && purpose && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-gray-900 text-white text-sm flex items-center justify-center">3</span>
                                어떤 전략으로?
                            </h2>
                            <span className="text-xs bg-violet-50 text-violet-600 px-3 py-1.5 rounded-full font-medium">
                                {PURPOSE_CONFIG[purpose].emoji} {PURPOSE_CONFIG[purpose].name}에 맞는 전략
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {STRATEGIES_BY_PURPOSE[purpose].map((hookId) => {
                                const info = HOOK_TYPE_INFO[hookId];
                                if (!info) return null;
                                return (
                                    <button
                                        key={hookId}
                                        onClick={() => setStrategy(hookId)}
                                        className={`
                                            p-5 rounded-2xl text-left transition-all border-2 bg-white
                                            ${strategy === hookId
                                                ? 'border-gray-900 shadow-lg'
                                                : 'border-transparent hover:border-gray-200 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl block mb-2">{info.emoji}</span>
                                        <h3 className="font-bold text-gray-900 mb-1">{info.name}</h3>
                                        <p className="text-xs text-gray-500">{info.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {strategy && (
                            <>
                                {/* 전략 설명 */}
                                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-xl border border-violet-100 flex gap-3 items-start mt-6">
                                    <span className="text-xl">💡</span>
                                    <div className="text-sm text-gray-700">
                                        <span className="font-bold text-violet-700">{HOOK_TYPE_INFO[strategy].name}</span> 전략 → {STRATEGY_DESCRIPTIONS[strategy]}
                                    </div>
                                </div>

                                {/* 참고 레퍼런스 */}
                                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-gray-700">📚 참고 레퍼런스</h4>
                                        {isFallbackRef && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">⚠️ 타 업종 예시</span>}
                                    </div>
                                    {isLoadingRef ? (
                                        <div className="text-center py-4 text-gray-400 text-sm">불러오는 중...</div>
                                    ) : referenceMessages.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {referenceMessages.map(msg => (
                                                <div key={msg.id} className="p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <img src={getAppIcon(msg.app_name)} alt={msg.app_name} className="w-4 h-4 rounded" />
                                                        <span className="font-bold text-gray-900 truncate">{msg.title}</span>
                                                    </div>
                                                    <div className="text-gray-500 truncate">{msg.body}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-400 text-xs">참고할 메시지가 아직 없어요.</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 3: 톤 선택 */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white text-sm flex items-center justify-center">4</span>
                            어떤 말투로?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {TONE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTone(opt.id)}
                                    className={`
                                        p-5 rounded-2xl text-left border-2 transition-all bg-white
                                        ${tone === opt.id
                                            ? 'border-gray-900 shadow-lg'
                                            : 'border-transparent hover:border-gray-200 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="text-2xl mb-2">{opt.emoji}</div>
                                    <div className="font-bold text-gray-900 mb-1">{opt.name}</div>
                                    <p className="text-sm text-gray-500 mb-3">{opt.desc}</p>
                                    <div className="text-xs p-2 rounded-lg bg-gray-100 text-gray-600">"{opt.example}"</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: 상세 입력 */}
                {step === 5 && purpose && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white text-sm flex items-center justify-center">5</span>
                            상세 내용
                        </h2>

                        {/* 선택 요약 */}
                        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                            <span className="text-xs px-3 py-1.5 bg-gray-200 rounded-full">{currentCategory?.emoji} {currentCategory?.name}</span>
                            <span className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full">{PURPOSE_CONFIG[purpose].emoji} {PURPOSE_CONFIG[purpose].name}</span>
                            {strategy && <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">{HOOK_TYPE_INFO[strategy].emoji} {HOOK_TYPE_INFO[strategy].name}</span>}
                            <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">{TONE_OPTIONS.find(t => t.id === tone)?.emoji} {TONE_OPTIONS.find(t => t.id === tone)?.name}</span>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="space-y-6">
                                {/* 타겟 + 칩 */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">누구에게 보내나요? (선택)</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(currentGuide?.targetChips || []).map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => toggleChip(chip, targetAudience, setTargetAudience)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${targetAudience.includes(chip)
                                                    ? 'bg-gray-900 border-gray-900 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {targetAudience.includes(chip) ? '✓' : '+'} {chip}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={targetAudience}
                                        onChange={e => setTargetAudience(e.target.value)}
                                        placeholder={currentGuide?.targetPlaceholder || ''}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900 transition-colors"
                                    />
                                </div>

                                {/* 상품명 + 칩 */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">무엇을 알리나요?</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(currentGuide?.productChips || []).map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => toggleChip(chip, productName, setProductName)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${productName.includes(chip)
                                                    ? 'bg-gray-900 border-gray-900 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {productName.includes(chip) ? '✓' : '+'} {chip}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={e => setProductName(e.target.value)}
                                        placeholder={currentGuide?.productPlaceholder || ''}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900 transition-colors"
                                    />
                                </div>

                                {/* 핵심 혜택 + 칩 */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">강조하고 싶은 내용은?</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(currentGuide?.benefitChips || []).map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => toggleChip(chip, keyBenefit, setKeyBenefit)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${keyBenefit.includes(chip)
                                                    ? 'bg-gray-900 border-gray-900 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {keyBenefit.includes(chip) ? '✓' : '+'} {chip}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={keyBenefit}
                                        onChange={e => setKeyBenefit(e.target.value)}
                                        placeholder={currentGuide?.benefitPlaceholder || ''}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900 transition-colors"
                                    />
                                </div>

                                {/* 생성 버튼 */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={goPrev}
                                        className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                                    >
                                        ← 이전
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                AI가 메시지를 작성 중...
                                            </>
                                        ) : (
                                            '✨ 메시지 생성하기'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 하단 네비게이션 */}
                {step < 6 && step < 5 && (
                    <div className="flex justify-end mt-8">
                        <div className="flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={goPrev}
                                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-all"
                                >
                                    ← 이전
                                </button>
                            )}
                            <button
                                onClick={goNext}
                                disabled={!canGoNext}
                                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                다음 →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: 결과 */}
                {step === 6 && (
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-violet-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">🎉 AI가 만든 메시지</h2>

                        {/* 선택 요약 */}
                        <div className="flex flex-wrap gap-2 mb-8 justify-center">
                            {currentCategory && <span className="text-xs px-3 py-1.5 bg-gray-200 rounded-full">{currentCategory.emoji} {currentCategory.name}</span>}
                            {purpose && PURPOSE_CONFIG[purpose] && <span className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full">{PURPOSE_CONFIG[purpose].emoji} {PURPOSE_CONFIG[purpose].name}</span>}
                            {strategy && HOOK_TYPE_INFO[strategy] && <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">{HOOK_TYPE_INFO[strategy].emoji} {HOOK_TYPE_INFO[strategy].name}</span>}
                            {tone && <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">{TONE_OPTIONS.find(t => t.id === tone)?.emoji} {TONE_OPTIONS.find(t => t.id === tone)?.name}</span>}
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-4">
                                <p className="text-red-600 mb-3">{error}</p>
                                <button onClick={resetAll} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                    다시 시도
                                </button>
                            </div>
                        ) : generatedMessages.length > 0 ? (
                            <div className="space-y-4">
                                {generatedMessages.map((msg, idx) => {
                                    const hookInfo = HOOK_TYPE_INFO[msg.hookType];
                                    // 6가지 화법 라벨
                                    const angleLabels: Record<string, { label: string; emoji: string; color: string }> = {
                                        direct: { label: '단도직입', emoji: '🎯', color: 'bg-blue-100 text-blue-700' },
                                        situation: { label: '상황/공감', emoji: '💭', color: 'bg-green-100 text-green-700' },
                                        question: { label: '의문/호기심', emoji: '❓', color: 'bg-amber-100 text-amber-700' },
                                        emotional: { label: '감성/스토리', emoji: '💖', color: 'bg-pink-100 text-pink-700' },
                                        cta: { label: '행동촉구', emoji: '👆', color: 'bg-violet-100 text-violet-700' },
                                        creative: { label: '무작위 생성', emoji: '🎲', color: 'bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700' },
                                    };
                                    const angleInfo = msg.angle ? angleLabels[msg.angle] : null;
                                    const isCreativeRandom = msg.angle === 'creative';
                                    const titleChars = countChars(msg.title);
                                    const bodyChars = countChars(msg.body);

                                    return (
                                        <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold px-2 py-1 bg-white rounded border text-gray-500">
                                                            {idx + 1}
                                                        </span>
                                                        <h3 className="font-bold text-gray-900">{msg.title}</h3>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">{msg.body}</p>
                                                    <div className="text-[11px] text-gray-400 mb-3">
                                                        제목 {titleChars}자 · 본문 {bodyChars}자
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isCreativeRandom ? (
                                                            <span className="px-2 py-1 rounded-lg text-xs bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700">
                                                                🎲 무작위 생성
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {hookInfo && (
                                                                    <span className={`px-2 py-1 rounded-lg text-xs ${hookInfo.color}`}>
                                                                        {hookInfo.emoji} {hookInfo.name}
                                                                    </span>
                                                                )}
                                                                {angleInfo && (
                                                                    <span className={`px-2 py-1 rounded-lg text-xs ${angleInfo.color}`}>
                                                                        {angleInfo.emoji} {angleInfo.label}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(msg.title, msg.body)}
                                                    className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                                                    title="복사하기"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-xl p-8 text-center">
                                <p className="text-gray-500">생성된 메시지가 없습니다</p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center mt-6">
                            <button
                                onClick={() => setStep(5)}
                                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                ← 뒤로가기
                            </button>
                            <button
                                onClick={resetAll}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                            >
                                처음부터 다시
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    '🔄 다시 생성'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 복사 토스트 */}
            {showCopyToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        클립보드에 복사되었어요
                    </div>
                </div>
            )}
        </div>
    );
};
