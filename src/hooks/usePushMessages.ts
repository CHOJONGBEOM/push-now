import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { PushMessage, FeedFilters } from '../types/push-message';
import { isValidMessage } from '../types/push-message';

const PAGE_SIZE = 20;

// 카테고리별 앱 이름 캐시
const categoryAppsCache: Record<string, string[]> = {};

export const usePushMessages = (filters: FeedFilters) => {
    const [messages, setMessages] = useState<PushMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const [allApps, setAllApps] = useState<string[]>([]);
    const [dateCounts, setDateCounts] = useState<Record<string, number>>({});
    const [categoryApps, setCategoryApps] = useState<string[]>([]);
    const [latestMessageTime, setLatestMessageTime] = useState<string | null>(null);

    // 전체 앱 목록 가져오기 (필터 드롭다운용)
    useEffect(() => {
        const fetchAllApps = async () => {
            const { data, error } = await supabase
                .from('push_messages')
                .select('app_name')
                .order('app_name');

            if (!error && data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const appNames = (data as any[]).map(item => item.app_name);
                const uniqueApps = Array.from(new Set(appNames)).sort() as string[];
                setAllApps(uniqueApps);
            }
        };

        fetchAllApps();
    }, []);

    // 카테고리별 앱 목록 가져오기 (업종 카테고리 필터용)
    useEffect(() => {
        const fetchCategoryApps = async () => {
            if (filters.category === 'all') {
                setCategoryApps([]);
                return;
            }

            // 캐시 확인
            if (categoryAppsCache[filters.category]) {
                setCategoryApps(categoryAppsCache[filters.category]);
                return;
            }

            // apps 테이블에서 해당 카테고리의 앱 이름 가져오기
            const { data, error } = await supabase
                .from('apps')
                .select('app_name')
                .eq('category', filters.category);

            if (!error && data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const appNames = (data as any[]).map(item => item.app_name) as string[];
                categoryAppsCache[filters.category] = appNames;
                setCategoryApps(appNames);
            }
        };

        fetchCategoryApps();
    }, [filters.category]);

    // 날짜별 메시지 수 가져오기 (캘린더용)
    useEffect(() => {
        const fetchDateCounts = async () => {
            // 최근 90일간의 데이터
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);

            let query = supabase
                .from('push_messages')
                .select('posted_at')
                .or('is_hidden.is.null,is_hidden.eq.false')
                .gte('posted_at', startDate.toISOString());

            // 앱 필터 적용
            if (filters.apps.length > 0) {
                query = query.in('app_name', filters.apps);
            }

            const { data, error } = await query;

            if (!error && data) {
                const counts: Record<string, number> = {};
                for (const item of data) {
                    if (item.posted_at) {
                        const date = item.posted_at.split('T')[0];
                        counts[date] = (counts[date] || 0) + 1;
                    }
                }
                setDateCounts(counts);
            }
        };

        fetchDateCounts();
    }, [filters.apps.join(',')]);

    // 메시지 로드
    const loadMessages = async (pageNum: number, reset: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('push_messages')
                .select('*')
                .or('is_hidden.is.null,is_hidden.eq.false')
                .order('posted_at', { ascending: false })
                .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

            // 카테고리 필터 (apps 테이블의 업종 카테고리 기반)
            if (filters.category !== 'all' && categoryApps.length > 0) {
                query = query.in('app_name', categoryApps);
            }

            // 앱 필터
            if (filters.apps.length > 0) {
                query = query.in('app_name', filters.apps);
            }

            // 날짜 필터 (선택된 날짜들의 메시지만)
            if (filters.selectedDates && filters.selectedDates.length > 0) {
                // 다중 날짜 필터링: OR 조건으로 연결
                const dateConditions = filters.selectedDates.map(date => {
                    const startOfDay = `${date}T00:00:00.000Z`;
                    const endOfDay = `${date}T23:59:59.999Z`;
                    return `and(posted_at.gte.${startOfDay},posted_at.lte.${endOfDay})`;
                }).join(',');
                query = query.or(dateConditions);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.error('Supabase fetch error:', fetchError);
                throw fetchError;
            }

            // 의미없는 메시지 필터링
            const validMessages = ((data || []) as PushMessage[]).filter(isValidMessage);

            if (reset) {
                setMessages(validMessages);
                // 첫 페이지 로드 시 최신 메시지 시간 설정
                if (validMessages.length > 0 && validMessages[0].posted_at) {
                    setLatestMessageTime(validMessages[0].posted_at);
                }
            } else {
                setMessages(prev => [...prev, ...validMessages]);
            }

            setHasMore((data || []).length === PAGE_SIZE);
        } catch (err) {
            console.error('Error loading messages:', err);

            // Supabase 설정 확인
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                setError('⚙️ Supabase 설정이 필요합니다. .env 파일을 확인해주세요.');
            } else {
                setError(err instanceof Error ? `❌ ${err.message}` : '데이터를 불러오는데 실패했습니다');
            }
        } finally {
            setLoading(false);
        }
    };

    // 필터 변경 시 리셋
    useEffect(() => {
        // 카테고리 선택 시 categoryApps가 로드될 때까지 대기
        if (filters.category !== 'all' && categoryApps.length === 0) {
            return;
        }
        setPage(0);
        loadMessages(0, true);
    }, [filters.category, filters.apps.join(','), filters.selectedDates?.join(','), categoryApps.join(',')]);

    // 다음 페이지 로드
    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadMessages(nextPage, false);
        }
    };

    // 실시간 구독 (optional)
    useEffect(() => {
        const subscription = supabase
            .channel('push_messages_feed')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'push_messages',
                },
                (payload) => {
                    const newMessage = payload.new as PushMessage;

                    // 새 앱이 추가되었을 수 있으므로 앱 목록 업데이트 (선택적)
                    setAllApps(prev => {
                        if (!prev.includes(newMessage.app_name)) {
                            return [...prev, newMessage.app_name].sort();
                        }
                        return prev;
                    });

                    // 필터 조건 확인 (업종 카테고리 기반)
                    const matchesCategory = filters.category === 'all' || categoryApps.includes(newMessage.app_name);
                    const matchesApp = filters.apps.length === 0 || filters.apps.includes(newMessage.app_name);
                    const isNotHidden = !newMessage.is_hidden;

                    if (matchesCategory && matchesApp && isNotHidden) {
                        setMessages(prev => [newMessage, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [filters.category, filters.apps.join(','), categoryApps.join(',')]);

    return {
        messages,
        loading,
        error,
        hasMore,
        loadMore,
        allApps,
        dateCounts, // 캘린더용 날짜별 메시지 수
        latestMessageTime, // 최신 메시지 시간
    };
};
