import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import {
    calculateKeywordFrequency,
    calculateEmojiFrequency,
    calculateBurstingKeywords,
    extractKeywordPairs,
    calculateTfIdf,
    analyzeKeywordTypes,
    KEYWORD_TYPES,
    type KeywordType,
} from '../utils/keywordExtractor';

interface Message {
    id: number;
    app_name: string | null;
    title: string | null;
    body: string | null;
    posted_at: string | null;
}

export interface KeywordItem {
    keyword: string;
    count: number;
    change?: number;
    changePercent?: number;
}

export interface TfIdfKeyword {
    keyword: string;
    score: number;
    count: number;
    appName: string;
}

export interface KeywordPair {
    source: string;
    target: string;
    count: number;
}

export interface KeywordTypeDistribution {
    type: KeywordType;
    name: string;
    emoji: string;
    color: string;
    count: number;
    percentage: number;
}

export interface EmojiItem {
    emoji: string;
    count: number;
    percentage: number;
}

export interface DailyKeywordTrend {
    date: string;
    keywords: Map<string, number>;
}

export interface UseKeywordTrendsOptions {
    days?: number;
    appNames?: string[];
}

export interface UseKeywordTrendsResult {
    // 로딩/에러 상태
    isLoading: boolean;
    error: string | null;

    // TOP 키워드
    topKeywords: KeywordItem[];

    // 급상승 키워드 (Burst Detection)
    burstingKeywords: KeywordItem[];

    // 앱별 차별화 키워드 (TF-IDF)
    distinctiveKeywords: TfIdfKeyword[];

    // 연관 키워드 쌍
    keywordPairs: KeywordPair[];

    // 키워드 유형 분포
    keywordTypeDistribution: KeywordTypeDistribution[];

    // 이모지 분포
    emojiDistribution: EmojiItem[];

    // 일별 키워드 추이 (차트용)
    dailyTrends: Array<{ date: string; [keyword: string]: string | number }>;

    // 총 메시지 수
    totalMessages: number;
}

export const useKeywordTrends = (
    options: UseKeywordTrendsOptions = {}
): UseKeywordTrendsResult => {
    const { days = 7, appNames = [] } = options;

    const [messages, setMessages] = useState<Message[]>([]);
    const [previousMessages, setPreviousMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 페치
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const now = new Date();
                const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

                // 최근 기간 메시지
                let recentQuery = supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, posted_at')
                    .gte('posted_at', startDate.toISOString())
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .order('posted_at', { ascending: false });

                // 이전 기간 메시지 (급상승 비교용)
                let previousQuery = supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, posted_at')
                    .gte('posted_at', previousStartDate.toISOString())
                    .lt('posted_at', startDate.toISOString())
                    .or('is_hidden.is.null,is_hidden.eq.false');

                if (appNames.length > 0) {
                    recentQuery = recentQuery.in('app_name', appNames);
                    previousQuery = previousQuery.in('app_name', appNames);
                }

                const [recentResult, previousResult] = await Promise.all([
                    recentQuery,
                    previousQuery,
                ]);

                if (recentResult.error) throw recentResult.error;
                if (previousResult.error) throw previousResult.error;

                setMessages((recentResult.data as Message[]) || []);
                setPreviousMessages((previousResult.data as Message[]) || []);
            } catch (err) {
                console.error('Error fetching messages for trends:', err);
                setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [days, appNames.join(',')]);

    // 분석 결과 계산
    const analysisResult = useMemo(() => {
        if (messages.length === 0) {
            return {
                topKeywords: [],
                burstingKeywords: [],
                distinctiveKeywords: [],
                keywordPairs: [],
                keywordTypeDistribution: [],
                emojiDistribution: [],
                dailyTrends: [],
            };
        }

        // 키워드 빈도 계산
        const recentFreq = calculateKeywordFrequency(messages);
        const previousFreq = calculateKeywordFrequency(previousMessages);

        // TOP 키워드
        const topKeywords: KeywordItem[] = [...recentFreq.entries()]
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        // 급상승 키워드
        const burstingKeywords = calculateBurstingKeywords(recentFreq, previousFreq, 1)
            .slice(0, 10);

        // 앱별 키워드 맵 생성 (TF-IDF용)
        const keywordsByApp = new Map<string, Map<string, number>>();
        for (const msg of messages) {
            if (!msg.app_name) continue;
            if (!keywordsByApp.has(msg.app_name)) {
                keywordsByApp.set(msg.app_name, new Map());
            }
            const appFreq = keywordsByApp.get(msg.app_name)!;
            const text = `${msg.title || ''} ${msg.body || ''}`;
            const keywords = text.toLowerCase().split(/\s+/);
            for (const kw of keywords) {
                if (kw.length >= 2) {
                    appFreq.set(kw, (appFreq.get(kw) || 0) + 1);
                }
            }
        }

        // 앱별 TF-IDF 계산
        const distinctiveKeywords: TfIdfKeyword[] = [];
        for (const appName of keywordsByApp.keys()) {
            const tfidf = calculateTfIdf(keywordsByApp, appName);
            distinctiveKeywords.push(
                ...tfidf.slice(0, 3).map(item => ({
                    ...item,
                    appName,
                }))
            );
        }
        distinctiveKeywords.sort((a, b) => b.score - a.score);

        // 연관 키워드 쌍
        const pairsMap = extractKeywordPairs(messages);
        const keywordPairs: KeywordPair[] = [...pairsMap.entries()]
            .map(([pair, count]) => {
                const [source, target] = pair.split('::');
                return { source, target, count };
            })
            .filter(p => p.count >= 2)
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        // 키워드 유형 분포
        const typeCountMap: Record<KeywordType, number> = {
            urgency: 0,
            benefit: 0,
            cta: 0,
            newness: 0,
            personalized: 0,
        };

        for (const msg of messages) {
            const text = `${msg.title || ''} ${msg.body || ''}`;
            const types = analyzeKeywordTypes(text);
            for (const [type, count] of Object.entries(types)) {
                typeCountMap[type as KeywordType] += count;
            }
        }

        const totalTypeCount = Object.values(typeCountMap).reduce((a, b) => a + b, 0);
        const keywordTypeDistribution: KeywordTypeDistribution[] = Object.entries(KEYWORD_TYPES)
            .map(([type, config]) => ({
                type: type as KeywordType,
                name: config.name,
                emoji: config.emoji,
                color: config.color,
                count: typeCountMap[type as KeywordType],
                percentage: totalTypeCount > 0
                    ? Math.round((typeCountMap[type as KeywordType] / totalTypeCount) * 100)
                    : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 이모지 분포
        const emojiFreq = calculateEmojiFrequency(messages);
        const totalEmojis = [...emojiFreq.values()].reduce((a, b) => a + b, 0);
        const emojiDistribution: EmojiItem[] = [...emojiFreq.entries()]
            .map(([emoji, count]) => ({
                emoji,
                count,
                percentage: totalEmojis > 0 ? Math.round((count / totalEmojis) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 일별 키워드 추이 (상위 5개 키워드)
        const top5Keywords = topKeywords.slice(0, 5).map(k => k.keyword);
        const dailyMap = new Map<string, Map<string, number>>();

        for (const msg of messages) {
            if (!msg.posted_at) continue;
            const date = msg.posted_at.split('T')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, new Map());
            }
            const dayFreq = dailyMap.get(date)!;
            const text = `${msg.title || ''} ${msg.body || ''}`.toLowerCase();
            for (const kw of top5Keywords) {
                if (text.includes(kw)) {
                    dayFreq.set(kw, (dayFreq.get(kw) || 0) + 1);
                }
            }
        }

        const dailyTrends = [...dailyMap.entries()]
            .map(([date, freq]) => {
                const row: { date: string; [keyword: string]: string | number } = { date };
                for (const kw of top5Keywords) {
                    row[kw] = freq.get(kw) || 0;
                }
                return row;
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            topKeywords,
            burstingKeywords,
            distinctiveKeywords,
            keywordPairs,
            keywordTypeDistribution,
            emojiDistribution,
            dailyTrends,
        };
    }, [messages, previousMessages]);

    return {
        isLoading,
        error,
        totalMessages: messages.length,
        ...analysisResult,
    };
};
