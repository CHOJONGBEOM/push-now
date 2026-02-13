import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Navbar } from '../components/Navbar';
import { getAppIcon } from '../utils/appIcons';
import { APP_CATEGORIES } from '../utils/appCategories';
import {
HOOK_TYPE_INFO,
TRIGGER_INFO,
type HookType,
type TriggerType
} from '../hooks/useMarketingHooks';

// ==========================================
// 1. 상수 및 데이터 정의 (Configuration)
// ==========================================

// 목적 ID 정의
type PurposeId = 'PROMO' | 'NEWS' | 'RECOVERY' | 'VALUE';

// 1-1. 목적별 UI 라벨
const PURPOSE_CONFIG: Record<string, Record<PurposeId, { name: string, desc: string }>> = {
default: {
PROMO: { name: '💰 혜택/특가', desc: '할인, 쿠폰, 타임세일, 최저가 알림' },
NEWS: { name: '🆕 신상/소식', desc: '신제품 출시, 재입고, 업데이트 소식' },
RECOVERY: { name: '🔔 미완료/리마인드', desc: '장바구니, 포인트 소멸, 미결제 확인' },
VALUE: { name: '🔍 추천/발견', desc: '취향 맞춤 추천, 랭킹, 큐레이션' }
},
fashion: {
PROMO: { name: '💰 혜택/특가', desc: '시즌오프, 랜덤쿠폰, 주말특가' },
NEWS: { name: '✨ 신상/재입고', desc: '브랜드 신규 발매, 품절 풀림 알림' },
RECOVERY: { name: '🔔 장바구니/찜', desc: '고민하던 상품 품절 임박 알림' },
VALUE: { name: '👗 추천/발견', desc: '지금 뜨는 코디, 나를 위한 스타일 추천' },
}
};

// 1-2. 목적별 추천 전략 매핑
const STRATEGIES_BY_PURPOSE: Record<PurposeId, HookType[]> = {
PROMO: ['price', 'urgency', 'benefit', 'newness', 'social_proof', 'curiosity'],
NEWS: ['newness', 'curiosity', 'social_proof', 'personal', 'price', 'benefit'],
RECOVERY: ['personal', 'urgency', 'benefit', 'social_proof', 'curiosity', 'newness'],
VALUE: ['social_proof', 'personal', 'curiosity', 'newness', 'benefit', 'urgency']
};

// 1-3. 전략 -> 심리 트리거 자동 매핑
const STRATEGY_TRIGGER_MAP: Record<HookType, TriggerType> = {
price: 'greed',
urgency: 'scarcity',
personal: 'personalization',
curiosity: 'curiosity',
newness: 'novelty',
social_proof: 'social_proof',
benefit: 'greed',
other: 'none'
};

// 1-4. 톤 옵션
const TONE_OPTIONS = [
{ id: 'friendly', name: '😊 친근/공감', desc: '친구에게 말하듯 부드럽게', example: '00님! 이거 완전 찰떡일 것 같아요 💕' },
{ id: 'direct', name: '🎯 간결/직관', desc: '군더더기 없이 핵심만 명확하게', example: '주문하신 상품이 발송되었습니다.' },
{ id: 'witty', name: '✨ 재치/유머', desc: '센스 있는 드립과 언어유희', example: '이 가격 실화? 담당자가 실수로 올렸어요 ㅋㅋㅋ' },
{ id: 'polite', name: '👔 정중/신뢰', desc: '예의 바르고 신뢰감 있게', example: '소중한 고객님을 위한 특별한 혜택을 준비했습니다.' },
];

// 1-5. 상황별 입력 가이드 & 칩 (CSV 데이터 기반)
const INPUT_GUIDES: Record<PurposeId, {
productPlaceholder: string;
benefitPlaceholder: string;
chips: string[];
}> = {
PROMO: {
productPlaceholder: '예: 설맞이 특가 모음집, 한우 선물세트',
benefitPlaceholder: '예: 최대 50% 쿠폰 즉시 지급, 배달팁 무료',
chips: ['최대 50% 할인', '1만원 쿠폰', '배달팁 무료', '재구매 혜택', '마지막 알림', '선착순 특가']
},
NEWS: {
productPlaceholder: '예: 반스 메탈 컬렉션, 뉴발란스 하트 라인',
benefitPlaceholder: '예: 무신사 단독 발매, 2차 라인업 오픈',
chips: ['단독 발매', '한정판 출시', '시즌 오픈', '사전 예약', '컬렉션 공개', '재입고 알림']
},
RECOVERY: {
productPlaceholder: '예: 장바구니 담은 상품, 찜한 숙소',
benefitPlaceholder: '예: 쿠폰이 2일 뒤 사라져요, 재고가 1개 남았어요',
chips: ['2일 뒤 소멸', '품절 임박', '재고 1개 남음', '가격 인상 예정', '딱 8시간만', '마지막 기회']
},
VALUE: {
productPlaceholder: '예: 성수동 핫플 모음, 살로몬 BEST SELLER',
benefitPlaceholder: '예: 후기 1천개 돌파, 담당자 강력 추천',
chips: ['후기 1천개 돌파', '재구매율 1위', 'MD 강력 추천', '실시간 랭킹', '인기 모음', '좋아요 급상승']
}
};

// ==========================================
// 2. 프롬프트 엔지니어링 데이터
// ==========================================

const PURPOSE_INSTRUCTIONS: Record<PurposeId, string> = {
PROMO: `작성 목표: 고객의 즉각적인 구매 전환. '손해 회피'와 '이득' 심리를 자극. [메인 혜택/숫자]를 문장의 맨 앞에 배치하여 시선을 끌 것.`,
NEWS: `작성 목표: 신규 상품/서비스에 대한 기대감 조성. '새로움'과 '희소성' 심리를 자극. [한정/단독/최초] 수식어 사용 권장.`,
RECOVERY: `작성 목표: 이탈 고객 복귀. '개인화'와 '미련' 심리를 자극. 고객의 상황(장바구니, 포인트)을 구체적으로 언급할 것.`,
VALUE: `작성 목표: 앱 접속 유도. '사회적 증명'과 '호기심' 자극. 질문형이나 감탄형 사용 권장.`
};

const TONE_INSTRUCTIONS: Record<string, string> = {
friendly: "친근한 친구처럼, 이모지 적극 사용, 부드러운 구어체(해요체).",
direct: "핵심 정보만 간결하게 전달, 미사여구 배제(드라이한 톤).",
witty: "피식 웃게 만드는 언어유희나 트렌디한 밈 사용.",
polite: "정중하고 예의 바르게, 신뢰감을 주는 격식체(하십시오체)."
};

const POWER_WORDS: Record<PurposeId, string> = {
PROMO: "최대, 즉시, 단독, 한정, 무료, % 할인, 만원, 0원",
NEWS: "단독 발매, 최초 공개, 시즌 오픈, 1차 드롭, 리미티드",
RECOVERY: "소멸 예정, 마지막 기회, 재고 1개, 품절 임박",
VALUE: "실패 없는, 담당자 추천, 1위, BEST, 꿀팁, 비밀"
};

const COPYWRITING_ANGLES = `
반드시 아래 3가지 서로 다른 스타일로 작성할 것 (중복 금지):

1. [직관적/단도직입형]: 수식어를 배제하고 핵심 혜택/용건부터 말하세요.
2. [상황/공감형]: 고객의 현재 상황이나 고민을 먼저 언급하세요. (You-Language)
3. [호기심/질문형]: 질문을 던지거나 정보를 살짝 가려서 클릭을 유도하세요.
   `;

// ==========================================
// 3. 컴포넌트 구현
// ==========================================

export const Generate: React.FC = () => {
const [appCategory, setAppCategory] = useState<string | null>(null);
const [step, setStep] = useState(0);
const [purpose, setPurpose] = useState<string | null>(null);
const [strategy, setStrategy] = useState<HookType | null>(null);
const [tone, setTone] = useState<string>('friendly');

    const [productName, setProductName] = useState('');
    const [keyBenefit, setKeyBenefit] = useState('');
    const [targetAudience, setTargetAudience] = useState('');

    const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);
    const [referenceMessages, setReferenceMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRef, setIsLoadingRef] = useState(false);
    const [isFallbackRef, setIsFallbackRef] = useState(false);

    // 현재 카테고리 정보 찾기
    const currentCategory = APP_CATEGORIES.find(c => c.id === appCategory);

    const purposeConfig = currentCategory
        ? (PURPOSE_CONFIG[currentCategory.id] || PURPOSE_CONFIG.default)
        : PURPOSE_CONFIG.default;

    // 레퍼런스 로드 함수
    const loadReferenceMessages = async (hookType: HookType, categoryId: string) => {
        setIsLoadingRef(true);
        setIsFallbackRef(false);
        try {
            const category = APP_CATEGORIES.find(c => c.id === categoryId);
            const appNames = category?.apps || []; // 수정된 appCategories.ts 덕분에 apps 참조 가능

            // 1. 내 카테고리 우선 검색 (5개 제한)
            let query = supabase
                .from('push_messages')
                .select('id, app_name, title, body, marketing_hook, hook_type')
                .eq('hook_type', hookType)
                .not('marketing_hook', 'is', null)
                .order('posted_at', { ascending: false })
                .limit(5);

            if (appNames.length > 0) {
                query = query.in('app_name', appNames);
            }

            const { data, error } = await query;
            if (error) throw error;

            if (data && data.length > 0) {
                setReferenceMessages(data);
            } else {
                // 2. Fallback
                const fallbackQuery = await supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, marketing_hook, hook_type')
                    .eq('hook_type', hookType)
                    .not('marketing_hook', 'is', null)
                    .order('posted_at', { ascending: false })
                    .limit(5);

                if (fallbackQuery.data && fallbackQuery.data.length > 0) {
                    setReferenceMessages(fallbackQuery.data);
                    setIsFallbackRef(true);
                } else {
                    setReferenceMessages([]);
                }
            }
        } catch (err) {
            console.error('Failed to load references:', err);
        } finally {
            setIsLoadingRef(false);
        }
    };

    // 생성 요청 함수
    const handleGenerate = async () => {
        if (!purpose || !strategy || !productName || !keyBenefit) return;

        setIsLoading(true);
        try {
            const purposeInstruction = PURPOSE_INSTRUCTIONS[purpose as PurposeId];
            const toneInstruction = TONE_INSTRUCTIONS[tone];
            const powerWords = POWER_WORDS[purpose as PurposeId];
            const hookInfo = HOOK_TYPE_INFO[strategy];
            const triggerInfo = TRIGGER_INFO[STRATEGY_TRIGGER_MAP[strategy]];

            const response = await supabase.functions.invoke('generate-push-message', {
                body: {
                    appName: currentCategory?.apps?.[0] || 'My App',
                    appCategory: currentCategory?.name,
                    productName,
                    keyBenefit,
                    targetAudience: targetAudience || '일반 사용자',

                    systemInstruction: {
                        role: "당신은 10년 차 수석 카피라이터입니다. 클릭률(CTR)이 낮은 메시지는 절대 쓰지 않습니다.",
                        mission: `${purposeInstruction} 위 목표를 달성하기 위해, '${hookInfo.name}' 전략을 사용하여 푸시 메시지 3종을 작성하세요.`,
                        guidelines: [
                            `전략 심리: ${triggerInfo.name} (${triggerInfo.description})을 자극할 것.`,
                            `톤앤매너: ${toneInstruction}`,
                            `필수 사용 어휘: [${powerWords}] 중 1~2개를 자연스럽게 섞어 쓸 것.`,
                            `핵심 내용 포함: '${keyBenefit}'와 '${productName}'을 반드시 포함할 것.`
                        ].join('\n'),
                        outputFormat: COPYWRITING_ANGLES,
                        constraints: {
                            maxLength: 35,
                            bodyMaxLength: 65,
                            noRepetition: "3가지 메시지의 문장 구조가 겹치지 않게 하세요."
                        }
                    },
                    referenceMessages: referenceMessages.slice(0, 5)
                },
            });

            if (response.error) throw response.error;
            setGeneratedMessages(response.data.messages || []);
            setStep(5);

        } catch (error) {
            console.error('Generation failed:', error);
            alert('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddChip = (text: string) => {
        if (keyBenefit.includes(text)) return;
        setKeyBenefit(prev => prev ? `${prev}, ${text}` : text);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">✍️ AI 카피라이터</h1>
                    <p className="text-gray-500">클릭을 부르는 푸시 메시지, 30초 만에 완성하세요.</p>
                </div>

                {/* Step 0: 카테고리 선택 */}
                {step === 0 && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900">0️⃣ 어떤 앱의 메시지를 만드나요?</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {APP_CATEGORIES.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setAppCategory(category.id);
                                        setStep(1);
                                    }}
                                    className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                                >
                                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{category.emoji}</span>
                                    <span className="font-bold text-gray-900 block">{category.name}</span>
                                    {/* 수정된 appCategories.ts가 적용되어야 아래 apps가 보입니다 */}
                                    <div className="flex -space-x-2 mt-3 overflow-hidden">
                                        {category.apps?.slice(0, 3).map(app => (
                                            <img key={app} src={getAppIcon(app)} alt={app} className="w-6 h-6 rounded-full border border-white" />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: 목적 선택 */}
                {step >= 1 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 animate-fade-in">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">1️⃣ 메시지의 목적은 무엇인가요?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(Object.keys(purposeConfig) as PurposeId[]).map((pId) => (
                                        <button
                                            key={pId}
                                            onClick={() => {
                                                setPurpose(pId);
                                                setStep(2);
                                            }}
                                            className="p-4 text-left border rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all"
                                        >
                                            <div className="font-bold text-lg mb-1">{purposeConfig[pId].name}</div>
                                            <div className="text-sm text-gray-500">{purposeConfig[pId].desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setStep(1)}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <div className="text-xs text-gray-400">목적</div>
                                        <div className="font-bold text-gray-900">{purpose && purposeConfig[purpose as PurposeId].name}</div>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-sm">수정 ›</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: 전략 선택 */}
                {step >= 2 && purpose && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 animate-fade-in">
                        {step === 2 ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <h2 className="text-xl font-bold text-gray-900">2️⃣ 어떤 전략으로 보낼까요?</h2>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                        {purposeConfig[purpose as PurposeId].name}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {STRATEGIES_BY_PURPOSE[purpose as PurposeId].map((hookId) => {
                                        const info = HOOK_TYPE_INFO[hookId];
                                        return (
                                            <button
                                                key={hookId}
                                                onClick={() => {
                                                    setStrategy(hookId);
                                                    loadReferenceMessages(hookId, appCategory!);
                                                }}
                                                className={`
                                                    relative p-4 rounded-xl text-left transition-all duration-200 group border-2
                                                    ${strategy === hookId
                                                        ? 'bg-gray-900 text-white border-gray-900 ring-2 ring-gray-900/20'
                                                        : `bg-white border-gray-100 hover:border-${info.color.split('-')[1]}-200`
                                                    }
                                                `}
                                            >
                                                <span className="text-2xl block mb-2">{info.emoji}</span>
                                                <h3 className={`font-bold text-sm mb-1 ${strategy === hookId ? 'text-white' : 'text-gray-900'}`}>{info.name}</h3>
                                                <p className={`text-xs ${strategy === hookId ? 'text-gray-300' : 'text-gray-500'}`}>{info.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                {strategy && (
                                    <>
                                        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-xl border border-violet-100 flex gap-3 items-start animate-fade-in mt-4">
                                            <span className="text-xl">💡</span>
                                            <div className="text-sm text-gray-700">
                                                <p>
                                                    <span className="font-bold text-violet-700">{HOOK_TYPE_INFO[strategy].name}</span> 전략은
                                                    <span className="font-bold mx-1">{TRIGGER_INFO[STRATEGY_TRIGGER_MAP[strategy]].name}</span>
                                                    심리를 자극하여 클릭을 유도해요.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-gray-700">📚 참고 레퍼런스</h4>
                                                {isFallbackRef && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">⚠️ 타 업종 예시</span>}
                                            </div>
                                            {isLoadingRef ? (
                                                <div className="text-center py-4 text-gray-400 text-sm">불러오는 중...</div>
                                            ) : referenceMessages.length > 0 ? (
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {referenceMessages.map(msg => (
                                                        <div key={msg.id} className="p-2 bg-white rounded border border-gray-100 text-xs">
                                                            <div className="font-bold mb-0.5 text-gray-900">{msg.title}</div>
                                                            <div className="text-gray-500 truncate">{msg.body}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-400 text-xs">참고할 메시지가 아직 없어요.</div>
                                            )}
                                        </div>
                                        <button onClick={() => setStep(3)} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all mt-4">
                                            다음: 톤앤매너 선택하기
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setStep(2)}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{strategy && HOOK_TYPE_INFO[strategy].emoji}</span>
                                    <div>
                                        <div className="text-xs text-gray-400">전략</div>
                                        <div className="font-bold text-gray-900">{strategy && HOOK_TYPE_INFO[strategy].name}</div>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-sm">수정 ›</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: 톤 선택 */}
                {step >= 3 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 animate-fade-in">
                        {step === 3 ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">3️⃣ 어떤 말투로 전할까요?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {TONE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setTone(opt.id);
                                                setStep(4);
                                            }}
                                            className="p-5 rounded-xl text-left border-2 bg-white hover:border-gray-300 transition-all"
                                        >
                                            <div className="font-bold text-lg mb-1">{opt.name}</div>
                                            <p className="text-sm text-gray-500 mb-3">{opt.desc}</p>
                                            <div className="text-xs p-3 rounded-lg bg-gray-50 text-gray-600">"{opt.example}"</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setStep(3)}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🗣️</span>
                                    <div>
                                        <div className="text-xs text-gray-400">톤앤매너</div>
                                        <div className="font-bold text-gray-900">{TONE_OPTIONS.find(t => t.id === tone)?.name}</div>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-sm">수정 ›</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: 상세 입력 */}
                {step >= 4 && purpose && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">4️⃣ 마지막! 핵심 내용을 알려주세요</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">누구에게 보내나요?</label>
                                <input
                                    type="text"
                                    value={targetAudience}
                                    onChange={e => setTargetAudience(e.target.value)}
                                    placeholder="예: 장바구니에 담고 결제 안 한 유저, 30대 직장인"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">무엇을 알리나요? (상품/서비스명)</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={e => setProductName(e.target.value)}
                                    placeholder={INPUT_GUIDES[purpose as PurposeId].productPlaceholder}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">강조하고 싶은 내용은?</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {INPUT_GUIDES[purpose as PurposeId].chips.map((chip) => (
                                        <button
                                            key={chip}
                                            onClick={() => handleAddChip(chip)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                                keyBenefit.includes(chip)
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                                                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            + {chip}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={keyBenefit}
                                    onChange={e => setKeyBenefit(e.target.value)}
                                    placeholder={INPUT_GUIDES[purpose as PurposeId].benefitPlaceholder}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900"
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !productName || !keyBenefit}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'AI가 메시지를 작성 중입니다...' : '✨ 메시지 생성하기'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: 결과 화면 */}
                {step === 5 && (
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎉 AI가 만든 메시지입니다</h2>
                        <div className="space-y-4">
                            {generatedMessages.map((msg, idx) => (
                                <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-1 bg-white rounded border text-gray-500">Option {idx + 1}</span>
                                        <h3 className="font-bold text-gray-900">{msg.title}</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">{msg.body}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 justify-center mt-6">
                            <button onClick={resetAll} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium">처음부터 다시</button>
                            <button onClick={() => setStep(4)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium">다시 생성</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};
