import { useState, useEffect } from 'react';

export interface KoreanHoliday {
    date: string; // YYYY-MM-DD
    name: string;
    isHoliday: boolean;
}

const API_KEY = '06bd801f161a3cf1c1c43c558e52c4a7988621568174620cade52e9dc8815677';
const BASE_URL = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';

// XML 파싱 헬퍼
const parseXML = (xmlString: string): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
};

// 날짜 형식 변환 (20260101 -> 2026-01-01)
const formatDate = (locdate: string): string => {
    return `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
};

export const useKoreanHolidays = (year: number) => {
    const [holidays, setHolidays] = useState<Record<string, KoreanHoliday>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                setLoading(true);
                setError(null);

                // 공휴일 정보 조회
                const url = `${BASE_URL}/getRestDeInfo?serviceKey=${API_KEY}&solYear=${year}&numOfRows=50`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('API 호출 실패');
                }

                const xmlText = await response.text();
                const xmlDoc = parseXML(xmlText);

                const items = xmlDoc.getElementsByTagName('item');
                const holidayMap: Record<string, KoreanHoliday> = {};

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const locdate = item.getElementsByTagName('locdate')[0]?.textContent || '';
                    const dateName = item.getElementsByTagName('dateName')[0]?.textContent || '';
                    const isHoliday = item.getElementsByTagName('isHoliday')[0]?.textContent === 'Y';

                    if (locdate) {
                        const formattedDate = formatDate(locdate);
                        holidayMap[formattedDate] = {
                            date: formattedDate,
                            name: dateName,
                            isHoliday,
                        };
                    }
                }

                setHolidays(holidayMap);
            } catch (err) {
                console.error('공휴일 API 오류:', err);
                setError(err instanceof Error ? err.message : '공휴일 정보를 가져오는데 실패했습니다');

                // 폴백: 기본 공휴일 데이터
                setHolidays(getFallbackHolidays(year));
            } finally {
                setLoading(false);
            }
        };

        fetchHolidays();
    }, [year]);

    return { holidays, loading, error };
};

// API 실패 시 사용할 기본 공휴일 데이터
const getFallbackHolidays = (year: number): Record<string, KoreanHoliday> => {
    const holidays: Record<string, KoreanHoliday> = {};

    const fixedHolidays = [
        { month: '01', day: '01', name: '신정' },
        { month: '03', day: '01', name: '삼일절' },
        { month: '05', day: '05', name: '어린이날' },
        { month: '06', day: '06', name: '현충일' },
        { month: '08', day: '15', name: '광복절' },
        { month: '10', day: '03', name: '개천절' },
        { month: '10', day: '09', name: '한글날' },
        { month: '12', day: '25', name: '크리스마스' },
    ];

    fixedHolidays.forEach(h => {
        const date = `${year}-${h.month}-${h.day}`;
        holidays[date] = { date, name: h.name, isHoliday: true };
    });

    // 2026년 특수 공휴일 (음력 기반은 연도별로 다름)
    if (year === 2026) {
        const lunarHolidays = [
            { date: '2026-01-28', name: '설날 연휴' },
            { date: '2026-01-29', name: '설날' },
            { date: '2026-01-30', name: '설날 연휴' },
            { date: '2026-05-24', name: '부처님오신날' },
            { date: '2026-10-04', name: '추석 연휴' },
            { date: '2026-10-05', name: '추석' },
            { date: '2026-10-06', name: '추석 연휴' },
        ];
        lunarHolidays.forEach(h => {
            holidays[h.date] = { date: h.date, name: h.name, isHoliday: true };
        });
    }

    return holidays;
};

// 이커머스 이벤트 (공휴일과 별도로 관리)
export const ECOMMERCE_EVENTS: Record<string, { name: string; emoji: string }> = {
    // 고정 이벤트
    '02-14': { name: '발렌타인', emoji: '💝' },
    '03-14': { name: '화이트데이', emoji: '🤍' },
    '11-11': { name: '광군제', emoji: '🛒' },

    // 2026년 변동 이벤트
    '2026-11-27': { name: '블랙프라이데이', emoji: '🔥' },
    '2026-11-30': { name: '사이버먼데이', emoji: '💻' },
};

export const getEcommerceEvent = (dateStr: string): { name: string; emoji: string } | null => {
    // 전체 날짜로 먼저 확인 (변동 이벤트)
    if (ECOMMERCE_EVENTS[dateStr]) {
        return ECOMMERCE_EVENTS[dateStr];
    }
    // MM-DD로 확인 (고정 이벤트)
    const mmdd = dateStr.slice(5);
    if (ECOMMERCE_EVENTS[mmdd]) {
        return ECOMMERCE_EVENTS[mmdd];
    }
    return null;
};
