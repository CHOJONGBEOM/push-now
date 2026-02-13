import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';

export type HookType = 'price' | 'urgency' | 'benefit' | 'newness' | 'social_proof' | 'personal' | 'curiosity' | 'content' | 'event' | 'community' | 'other';
export type TriggerType = 'urgency' | 'loss_aversion' | 'greed' | 'personalization' | 'relevance' | 'curiosity' | 'social_proof' | 'novelty' | 'fun' | 'habit' | 'reminder' | 'none';

export const HOOK_TYPE_INFO: Record<HookType, { name: string; emoji: string; color: string; description: string }> = {
    price: {
        name: '가격/할인',
        emoji: '💰',
        color: 'bg-red-100 text-red-700',
        description: '구체적인 할인율, 가격 인하 등 금전적 이득을 숫자로 강조',
    },
    urgency: {
        name: '긴급성',
        emoji: '⏰',
        color: 'bg-orange-100 text-orange-700',
        description: '시간/수량 제한으로 즉각적인 행동을 유도하는 FOMO 전략',
    },
    personal: {
        name: '개인화',
        emoji: '💝',
        color: 'bg-violet-100 text-violet-700',
        description: '장바구니, 찜, 최근 본 상품 등 개인 행동 데이터 기반 메시지',
    },
    curiosity: {
        name: '호기심',
        emoji: '🎁',
        color: 'bg-yellow-100 text-yellow-700',
        description: '정보를 숨겨 클릭을 유도하는 티저/미스터리 전략',
    },
    newness: {
        name: '신상/트렌드',
        emoji: '✨',
        color: 'bg-purple-100 text-purple-700',
        description: '신상품, 첫 출시, 시즌 오픈 등 새로움 강조',
    },
    social_proof: {
        name: '인기/베스트',
        emoji: '🔥',
        color: 'bg-pink-100 text-pink-700',
        description: '베스트셀러, 리뷰 수, 랭킹 등 검증된 인기를 수치로 어필',
    },
    benefit: {
        name: '구매 혜택',
        emoji: '🎀',
        color: 'bg-green-100 text-green-700',
        description: '무료배송, 사은품, 적립금 등 구매 시 부가 혜택',
    },
    content: {
        name: '콘텐츠',
        emoji: '📚',
        color: 'bg-cyan-100 text-cyan-700',
        description: '팁, 가이드, 영상, 학습 콘텐츠 등 정보성 콘텐츠',
    },
    event: {
        name: '참여 이벤트',
        emoji: '🎯',
        color: 'bg-amber-100 text-amber-700',
        description: '챌린지, 출석체크, 미션 등 참여형 이벤트 보상',
    },
    community: {
        name: '커뮤니티',
        emoji: '💬',
        color: 'bg-indigo-100 text-indigo-700',
        description: '좋아요, 댓글, 팔로우 등 SNS/커뮤니티 알림',
    },
    other: {
        name: '기타',
        emoji: '📌',
        color: 'bg-gray-100 text-gray-600',
        description: '단순 정보성 알림, 시스템 메시지',
    },
};

export const TRIGGER_INFO: Record<TriggerType, { name: string; emoji: string; description: string }> = {
    urgency: {
        name: '긴급성',
        emoji: '⏰',
        description: '지금 안 하면 늦는다 - 시간/수량 제한, 마감 임박',
    },
    loss_aversion: {
        name: '손실 회피',
        emoji: '😰',
        description: '가진 걸 잃는다 - 포인트 소멸, 품절 직전, 혜택 사라짐',
    },
    greed: {
        name: '이득 욕구',
        emoji: '🤑',
        description: '득을 보고 싶다 - 할인, 무료, 절약',
    },
    personalization: {
        name: '개인 맞춤',
        emoji: '🎯',
        description: '내 데이터 기반 - 찜한 상품, 최근 본 상품',
    },
    relevance: {
        name: '상황 적합',
        emoji: '🌧️',
        description: '지금 맥락에 딱 - 비 오는 날, 출근길, 시즌',
    },
    curiosity: {
        name: '궁금증',
        emoji: '❓',
        description: '숨겨진 정보 - 비밀 혜택, 선물 도착',
    },
    social_proof: {
        name: '인기 심리',
        emoji: '👥',
        description: '남들도 한다 - 판매 1위, 리뷰 1만개',
    },
    novelty: {
        name: '새로움',
        emoji: '🆕',
        description: '새 것 보고 싶다 - 신상, NEW, 첫 출시',
    },
    fun: {
        name: '재미/성취',
        emoji: '🎮',
        description: '보상, 즐거움 - 룰렛, 챌린지, 미션',
    },
    habit: {
        name: '습관 유지',
        emoji: '🔥',
        description: '스트릭 끊기 싫다 - 연속 출석, 매일 학습',
    },
    reminder: {
        name: '상기',
        emoji: '💭',
        description: '까먹은 걸 떠올림 - 장바구니, 아직 안 봤어요',
    },
    none: {
        name: '해당 없음',
        emoji: '➖',
        description: '명확한 트리거 없음 - 시스템 알림',
    },
};

const ANALYZABLE_TRIGGER_SET = new Set<TriggerType>([
    'urgency',
    'loss_aversion',
    'greed',
    'personalization',
    'relevance',
    'curiosity',
    'social_proof',
    'novelty',
    'fun',
    'habit',
    'reminder',
]);

const EXCLUDED_TRIGGER_VALUES = new Set([
    '',
    'none',
    'other',
    'unknown',
    'uncategorized',
    '미분류',
    '기타',
]);

function normalizeTrigger(trigger: unknown): TriggerType | null {
    const raw = String(trigger ?? '').trim().toLowerCase();
    if (!raw || EXCLUDED_TRIGGER_VALUES.has(raw)) return null;

    const candidate = raw as TriggerType;
    return ANALYZABLE_TRIGGER_SET.has(candidate) ? candidate : null;
}

interface MessageWithHook {
    id: number;
    app_name: string | null;
    title: string | null;
    body: string | null;
    marketing_hook: string | null;
    hook_type: HookType | null;
    hook_trigger: TriggerType | null;
    posted_at: string | null;
}

export interface HookDistribution {
    type: HookType;
    count: number;
    percentage: number;
}

export interface TriggerDistribution {
    trigger: TriggerType;
    count: number;
    percentage: number;
}

export interface AppStrategy {
    appName: string;
    totalMessages: number;
    primaryStrategy: HookType;
    strategies: { type: HookType; count: number; percentage: number }[];
    topHooks: string[];
}

export interface HookTrendItem {
    hook: string;
    type: HookType;
    trigger: TriggerType | null;
    count: number;
    apps: string[];
}

export interface UseMarketingHooksOptions {
    days?: number;
    appNames?: string[];
}

export const useMarketingHooks = (options: UseMarketingHooksOptions = {}) => {
    const { days = 30, appNames = [] } = options;

    const [messages, setMessages] = useState<MessageWithHook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

                let query = supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, marketing_hook, hook_type, hook_trigger, posted_at')
                    .not('marketing_hook', 'is', null)
                    .gte('posted_at', startDate.toISOString())
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .order('posted_at', { ascending: false });

                if (appNames.length > 0) {
                    query = query.in('app_name', appNames);
                }

                const { data, error: err } = await query;
                if (err) throw err;

                setMessages((data as MessageWithHook[]) || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : '데이터 로딩 실패');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [days, appNames.join(',')]);

    // 분석 결과 계산
    const analysis = useMemo(() => {
        if (messages.length === 0) {
            return {
                hookDistribution: [],
                triggerDistribution: [],
                appStrategies: [],
                topHooks: [],
                totalAnalyzed: 0,
            };
        }

        // 1. 훅 유형별 분포
        const typeCounts = new Map<HookType, number>();
        for (const msg of messages) {
            if (msg.hook_type) {
                typeCounts.set(msg.hook_type, (typeCounts.get(msg.hook_type) || 0) + 1);
            }
        }

        const total = messages.length;
        const hookDistribution: HookDistribution[] = [...typeCounts.entries()]
            .map(([type, count]) => ({
                type,
                count,
                percentage: Math.round((count / total) * 100),
            }))
            .sort((a, b) => b.count - a.count);

        // 2. 트리거별 분포
        const triggerCounts = new Map<TriggerType, number>();
        let analyzedTriggerTotal = 0;
        for (const msg of messages) {
            const trigger = normalizeTrigger(msg.hook_trigger);
            if (!trigger) continue;

            analyzedTriggerTotal++;
            triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
        }

        const triggerDistribution: TriggerDistribution[] = analyzedTriggerTotal === 0
            ? []
            : [...triggerCounts.entries()]
                .map(([trigger, count]) => ({
                    trigger,
                    count,
                    percentage: Math.round((count / analyzedTriggerTotal) * 100),
                }))
                .sort((a, b) => b.count - a.count);

        // 3. 앱별 전략 분석
        const appData = new Map<string, { types: Map<HookType, number>; hooks: string[] }>();
        for (const msg of messages) {
            if (!msg.app_name) continue;

            if (!appData.has(msg.app_name)) {
                appData.set(msg.app_name, { types: new Map(), hooks: [] });
            }

            const data = appData.get(msg.app_name)!;
            if (msg.hook_type) {
                data.types.set(msg.hook_type, (data.types.get(msg.hook_type) || 0) + 1);
            }
            if (msg.marketing_hook) {
                data.hooks.push(msg.marketing_hook);
            }
        }

        const appStrategies: AppStrategy[] = [...appData.entries()]
            .map(([appName, data]) => {
                const strategies = [...data.types.entries()]
                    .map(([type, count]) => ({
                        type,
                        count,
                        percentage: Math.round((count / data.hooks.length) * 100),
                    }))
                    .sort((a, b) => b.count - a.count);

                return {
                    appName,
                    totalMessages: data.hooks.length,
                    primaryStrategy: strategies[0]?.type || 'other',
                    strategies,
                    topHooks: [...new Set(data.hooks)].slice(0, 5),
                };
            })
            .sort((a, b) => b.totalMessages - a.totalMessages);

        // 4. 인기 훅 (중복 제거 후 빈도순)
        const hookCounts = new Map<string, { count: number; type: HookType; trigger: TriggerType | null; apps: Set<string> }>();
        for (const msg of messages) {
            if (!msg.marketing_hook || !msg.hook_type) continue;

            const hook = msg.marketing_hook;
            if (!hookCounts.has(hook)) {
                hookCounts.set(hook, { count: 0, type: msg.hook_type, trigger: normalizeTrigger(msg.hook_trigger), apps: new Set() });
            }
            const data = hookCounts.get(hook)!;
            data.count++;
            if (msg.app_name) data.apps.add(msg.app_name);
        }

        const topHooks: HookTrendItem[] = [...hookCounts.entries()]
            .map(([hook, data]) => ({
                hook,
                type: data.type,
                trigger: data.trigger,
                count: data.count,
                apps: [...data.apps],
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        return {
            hookDistribution,
            triggerDistribution,
            appStrategies,
            topHooks,
            totalAnalyzed: messages.length,
        };
    }, [messages]);

    return {
        isLoading,
        error,
        messages,
        ...analysis,
    };
};
