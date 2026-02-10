import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { PushMessage } from '../types/push-message';

interface UseSimilarMessagesResult {
    messages: PushMessage[];
    loading: boolean;
    error: string | null;
    search: (query: string, category?: string) => Promise<void>;
    clear: () => void;
}

export const useSimilarMessages = (): UseSimilarMessagesResult => {
    const [messages, setMessages] = useState<PushMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string, category?: string) => {
        if (!query.trim() || query.length < 2) {
            setMessages([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 키워드 추출 (공백으로 분리, 2글자 이상만)
            const keywords = query
                .split(/\s+/)
                .filter(k => k.length >= 2)
                .slice(0, 5); // 최대 5개 키워드

            if (keywords.length === 0) {
                setMessages([]);
                return;
            }

            // 각 키워드로 검색 (OR 조건)
            const searchConditions = keywords
                .map(k => `body.ilike.%${k}%,title.ilike.%${k}%`)
                .join(',');

            let queryBuilder = supabase
                .from('push_messages')
                .select('*')
                .or(searchConditions)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .order('posted_at', { ascending: false })
                .limit(20);

            // 카테고리 필터 (선택적)
            if (category && category !== 'all') {
                queryBuilder = queryBuilder.eq('category', category);
            }

            const { data, error: fetchError } = await queryBuilder;

            if (fetchError) {
                throw fetchError;
            }

            setMessages(data || []);
        } catch (err) {
            console.error('Error searching similar messages:', err);
            setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        loading,
        error,
        search,
        clear,
    };
};

// 키워드 추출 유틸
export const extractKeywords = (text: string): string[] => {
    // 한글, 영문, 숫자만 추출
    const words = text
        .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 2);

    // 중복 제거
    return Array.from(new Set(words));
};
