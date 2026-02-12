import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';

export interface HeatmapCell {
    dayOfWeek: number;  // 0=일, 1=월, ..., 6=토
    hour: number;       // 0-23 (2시간 단위로 묶으면 0, 2, 4, ...)
    count: number;
    density: 'low' | 'medium' | 'high' | 'peak';
}

export interface GoldenHour {
    dayOfWeek: number;
    dayName: string;
    hour: number;
    hourRange: string;
    count: number;
    percentageBelowAvg: number;
}

export interface TimingData {
    heatmapData: HeatmapCell[];
    dayOfWeekData: { dayOfWeek: number; dayName: string; count: number }[];
    goldenHours: GoldenHour[];
    avoidTime: GoldenHour | null;
    totalCount: number;
    avgPerSlot: number;
    isLoading: boolean;
    error: string | null;
}

// 월요일 시작 순서
const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
// DB 요일(0=일) → 화면 요일(0=월) 매핑
const DAY_INDEX_MAP: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

// 1시간 단위 (6시~23시, 야간 제외)
const START_HOUR = 6;
const END_HOUR = 24; // exclusive
const HOUR_RANGES = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => ({
    start: START_HOUR + i,
    end: START_HOUR + i + 1,
    label: `${START_HOUR + i}시`,
}));

export interface TimingDataOptions {
    days?: number;
    appNames?: string[];  // 필터링할 앱 이름들
    // 커스텀 날짜 범위 (기간 비교용)
    startDate?: Date;
    endDate?: Date;
}

export const useTimingData = (options: TimingDataOptions = {}) => {
    const { days = 30, appNames = [], startDate, endDate } = options;
    const [rawData, setRawData] = useState<{ day_of_week: number; hour: number; count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 날짜 범위 계산
                let fromDate: Date;
                let toDate: Date;

                if (startDate && endDate) {
                    // 커스텀 날짜 범위 사용
                    fromDate = startDate;
                    toDate = endDate;
                } else {
                    // 기본: 오늘부터 N일 전
                    toDate = new Date();
                    fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                }

                // 직접 쿼리 사용 (앱 필터 지원)
                let query = supabase
                    .from('push_messages')
                    .select('posted_at, app_name')
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .gte('posted_at', fromDate.toISOString())
                    .lte('posted_at', toDate.toISOString());

                // 앱 필터 적용
                if (appNames.length > 0) {
                    query = query.in('app_name', appNames);
                }

                const { data: directData, error: directError } = await query;

                if (directError) throw directError;

                // 클라이언트에서 집계
                const aggregated = aggregateByDayAndHour(directData || []);
                setRawData(aggregated);
            } catch (err) {
                console.error('Error fetching timing data:', err);
                setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [days, appNames.join(','), startDate?.toISOString(), endDate?.toISOString()]);

    // 클라이언트 사이드 집계 함수
    const aggregateByDayAndHour = (messages: { posted_at: string | null; app_name?: string | null }[]) => {
        const counts: Record<string, number> = {};

        messages.forEach(msg => {
            if (!msg.posted_at) return;

            const date = new Date(msg.posted_at);
            // 한국 시간으로 변환
            const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
            const dayOfWeek = kstDate.getUTCDay();
            const hour = kstDate.getUTCHours();

            const key = `${dayOfWeek}-${hour}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts).map(([key, count]) => {
            const [day, hour] = key.split('-').map(Number);
            return { day_of_week: day, hour, count };
        });
    };

    // 1시간 단위 히트맵 데이터 (월요일 시작 순서)
    const heatmapData = useMemo(() => {
        const grouped: Record<string, number> = {};

        // 모든 슬롯 초기화 (7일 x 24슬롯) - 화면 인덱스 기준 (0=월)
        for (let day = 0; day < 7; day++) {
            for (const range of HOUR_RANGES) {
                grouped[`${day}-${range.start}`] = 0;
            }
        }

        // 데이터 집계 (DB 요일 → 화면 요일로 매핑)
        rawData.forEach(item => {
            const displayDay = DAY_INDEX_MAP[item.day_of_week];
            const key = `${displayDay}-${item.hour}`;
            grouped[key] = (grouped[key] || 0) + item.count;
        });

        // 밀도 계산을 위한 통계 (퍼센타일 기반)
        const counts = Object.values(grouped);
        const nonZeroCounts = counts.filter(c => c > 0).sort((a, b) => a - b);

        // 퍼센타일 계산 (0이 아닌 값들 기준)
        const getPercentile = (arr: number[], p: number) => {
            if (arr.length === 0) return 0;
            const index = Math.ceil((p / 100) * arr.length) - 1;
            return arr[Math.max(0, index)];
        };

        const p30 = getPercentile(nonZeroCounts, 30);  // 하위 30%
        const p60 = getPercentile(nonZeroCounts, 60);  // 중간 60%
        const p90 = getPercentile(nonZeroCounts, 90);  // 상위 10%

        return Object.entries(grouped).map(([key, count]) => {
            const [day, hour] = key.split('-').map(Number);

            // 퍼센타일 기반 밀도 분류
            // - peak(밀집): 상위 10% (90th 이상)
            // - high(활발): 60th ~ 90th
            // - medium(보통): 30th ~ 60th
            // - low(한산): 하위 30%
            let density: 'low' | 'medium' | 'high' | 'peak' = 'low';
            if (count >= p90 && count > 0) density = 'peak';
            else if (count >= p60 && count > 0) density = 'high';
            else if (count >= p30 && count > 0) density = 'medium';

            return {
                dayOfWeek: day,  // 화면 인덱스 (0=월, 6=일)
                hour,
                count,
                density,
            };
        });
    }, [rawData]);

    // 요일별 데이터 (월요일 시작 순서)
    const dayOfWeekData = useMemo(() => {
        // 화면 인덱스 기준 (0=월, 6=일)
        const grouped: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        rawData.forEach(item => {
            const displayDay = DAY_INDEX_MAP[item.day_of_week];
            grouped[displayDay] = (grouped[displayDay] || 0) + item.count;
        });

        return Object.entries(grouped).map(([day, count]) => ({
            dayOfWeek: Number(day),  // 화면 인덱스 (0=월, 6=일)
            dayName: DAY_NAMES[Number(day)],
            count,
        }));
    }, [rawData]);

    // 골든아워 계산 (경쟁 밀도가 가장 낮은 시간대 TOP 3)
    const { goldenHours, avoidTime } = useMemo(() => {
        if (heatmapData.length === 0) {
            return { goldenHours: [], avoidTime: null };
        }

        const avgCount = heatmapData.reduce((sum, cell) => sum + cell.count, 0) / heatmapData.length;

        const sortedByCount = [...heatmapData]
            .filter(cell => cell.count > 0 || avgCount === 0) // 데이터가 있거나 전체가 0인 경우
            .map(cell => ({
                dayOfWeek: cell.dayOfWeek,
                dayName: DAY_NAMES[cell.dayOfWeek],
                hour: cell.hour,
                hourRange: HOUR_RANGES.find(r => r.start === cell.hour)?.label || `${cell.hour}시`,
                count: cell.count,
                percentageBelowAvg: avgCount > 0 ? Math.round((1 - cell.count / avgCount) * 100) : 0,
            }))
            .sort((a, b) => a.count - b.count);

        // 가장 한산한 3개 = 골든아워
        const golden = sortedByCount.slice(0, 3);

        // 가장 바쁜 1개 = 피해야 할 시간
        const avoid = sortedByCount.length > 0 ? sortedByCount[sortedByCount.length - 1] : null;

        return { goldenHours: golden, avoidTime: avoid };
    }, [heatmapData]);

    // 통계
    const totalCount = rawData.reduce((sum, item) => sum + item.count, 0);
    const avgPerSlot = heatmapData.length > 0 ? totalCount / heatmapData.length : 0;

    return {
        heatmapData,
        dayOfWeekData,
        goldenHours,
        avoidTime,
        totalCount,
        avgPerSlot,
        isLoading,
        error,
    };
};
