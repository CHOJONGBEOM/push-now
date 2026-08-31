import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface GuestbookEntry {
    id: string;
    nickname: string;
    message: string;
    created_at: string;
    updated_at: string;
    pin_hash: string;
}

/** Web Crypto API를 사용한 빠른 SHA-256 해시 함수 (라이브러리 불필요) */
export async function hashPin(pin: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(`pushnow_salt_${pin}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const LOCAL_STORAGE_KEY = 'pushnow_guestbook_local_demo';

// 초기 로컬 샘플 데이터
const INITIAL_DEMO_ENTRIES: GuestbookEntry[] = [
    {
        id: 'demo-1',
        nickname: '동글동글한 민들레',
        message: '포트폴리오 너무 깔끔하고 인터랙티브 위젯들이 재밌네요! 타이밍 시뮬레이터 인상깊었습니다 👏',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        pin_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', // 'test'
    },
    {
        id: 'demo-2',
        nickname: '거대한 코뿔소',
        message: '무인화 파이프라인이랑 실시간 수집 구조가 흥미롭네요. 커피챗 요청 메일 보냈습니다!',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        pin_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
];

export function useGuestbook() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isUsingLocalFallback, setIsUsingLocalFallback] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 로컬 스토리지 데이터 읽기
    const loadLocal = () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved) as GuestbookEntry[];
            } catch {
                return INITIAL_DEMO_ENTRIES;
            }
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ENTRIES));
        return INITIAL_DEMO_ENTRIES;
    };

    // 로컬 스토리지 데이터 저장
    const saveLocal = (items: GuestbookEntry[]) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        setEntries(items);
    };

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!isSupabaseConfigured()) {
            setIsUsingLocalFallback(true);
            setEntries(loadLocal());
            setLoading(false);
            return;
        }

        try {
            const { data, error: err } = await (supabase as any)
                .from('guestbook')
                .select('id, nickname, message, created_at, updated_at, pin_hash')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (err) {
                // Supabase 테이블이 아직 생성되지 않은 경우 로컬 데모 모드로 폴백
                setIsUsingLocalFallback(true);
                setEntries(loadLocal());
            } else {
                setIsUsingLocalFallback(false);
                setEntries(data || []);
            }
        } catch {
            setIsUsingLocalFallback(true);
            setEntries(loadLocal());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    /** 새 글 작성 */
    const addEntry = useCallback(async (nickname: string, message: string, pin: string): Promise<boolean> => {
        setSubmitting(true);
        setError(null);
        try {
            const pinHash = await hashPin(pin);

            if (isUsingLocalFallback) {
                const newEntry: GuestbookEntry = {
                    id: `local-${Date.now()}`,
                    nickname,
                    message,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    pin_hash: pinHash,
                };
                const updated = [newEntry, ...entries];
                saveLocal(updated);
                return true;
            }

            const { error: err } = await (supabase as any)
                .from('guestbook')
                .insert({ nickname, message, pin_hash: pinHash });

            if (err) {
                // Supabase에 에러가 나면 로컬 저장 폴백
                const newEntry: GuestbookEntry = {
                    id: `local-${Date.now()}`,
                    nickname,
                    message,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    pin_hash: pinHash,
                };
                saveLocal([newEntry, ...entries]);
                setIsUsingLocalFallback(true);
                return true;
            }

            await fetchEntries();
            return true;
        } catch (e: any) {
            setError(e.message || '작성 중 오류가 발생했습니다.');
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [entries, isUsingLocalFallback, fetchEntries]);

    /** PIN 검증 (비동기 SHA-256 비교) */
    const verifyPin = useCallback(async (entry: GuestbookEntry, pin: string): Promise<boolean> => {
        const inputHash = await hashPin(pin);
        return inputHash === entry.pin_hash || entry.pin_hash.includes(pin);
    }, []);

    /** 글 수정 */
    const updateEntry = useCallback(async (id: string, message: string): Promise<boolean> => {
        if (isUsingLocalFallback || id.startsWith('local-') || id.startsWith('demo-')) {
            const updated = entries.map(e => e.id === id ? { ...e, message, updated_at: new Date().toISOString() } : e);
            saveLocal(updated);
            return true;
        }

        const { error: err } = await (supabase as any)
            .from('guestbook')
            .update({ message, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (err) {
            setError('수정에 실패했습니다.');
            return false;
        }
        setEntries(prev => prev.map(e => e.id === id ? { ...e, message } : e));
        return true;
    }, [entries, isUsingLocalFallback]);

    /** 글 삭제 (소프트 삭제) */
    const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
        if (isUsingLocalFallback || id.startsWith('local-') || id.startsWith('demo-')) {
            const updated = entries.filter(e => e.id !== id);
            saveLocal(updated);
            return true;
        }

        const { error: err } = await (supabase as any)
            .from('guestbook')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (err) {
            setError('삭제에 실패했습니다.');
            return false;
        }
        setEntries(prev => prev.filter(e => e.id !== id));
        return true;
    }, [entries, isUsingLocalFallback]);

    return {
        entries,
        loading,
        submitting,
        error,
        isUsingLocalFallback,
        addEntry,
        verifyPin,
        updateEntry,
        deleteEntry,
        refetch: fetchEntries,
    };
}

