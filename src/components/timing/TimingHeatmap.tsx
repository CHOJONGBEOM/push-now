import React, { useState } from 'react';
import type { HeatmapCell } from '../../hooks/useTimingData';
import { TimingDrilldownModal } from './TimingDrilldownModal';
import { getEcommerceEvent, useKoreanHolidays } from '../../hooks/useKoreanHolidays';

interface TimingHeatmapProps {
    data: HeatmapCell[];
    isLoading?: boolean;
    days?: number;
    appNames?: string[];
    onCellClick?: (cell: HeatmapCell) => void;
    startDate?: Date;
    endDate?: Date;
}

// 월요일 시작 순서 (0=월, 6=일)
const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
// 주말 인덱스 (토=5, 일=6)
const WEEKEND_INDICES = [5, 6];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => String(i));

const getDensityStyle = (density: string, count: number) => {
    if (count === 0) {
        return 'bg-gray-50 text-gray-300';
    }

    switch (density) {
        case 'peak':
            return 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm';
        case 'high':
            return 'bg-gradient-to-br from-amber-400 to-orange-400 text-white';
        case 'medium':
            return 'bg-gradient-to-br from-sky-200 to-blue-300 text-blue-800';
        case 'low':
        default:
            return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500';
    }
};

const HOUR_RANGES = Array.from({ length: 24 }, (_, i) => `${i}시`);

const formatLocalYmd = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const TimingHeatmap: React.FC<TimingHeatmapProps> = ({
    data,
    isLoading = false,
    days = 30,
    appNames = [],
    startDate,
    endDate,
}) => {
    const dateRange = React.useMemo(() => {
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return {
            startDate: start,
            endDate: end,
            start: start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            end: end.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        };
    }, [days, startDate, endDate]);

    const startYear = dateRange.startDate.getFullYear();
    const endYear = dateRange.endDate.getFullYear();
    const { holidays: startYearHolidays } = useKoreanHolidays(startYear);
    const { holidays: endYearHolidays } = useKoreanHolidays(endYear);

    const holidays = React.useMemo(
        () => (startYear === endYear ? startYearHolidays : { ...startYearHolidays, ...endYearHolidays }),
        [startYear, endYear, startYearHolidays, endYearHolidays],
    );

    const timelineEvents = React.useMemo(() => {
        const events: { date: string; label: string; emoji: string; isHoliday: boolean }[] = [];
        const cursor = new Date(dateRange.startDate);
        const end = dateRange.endDate;

        while (cursor <= end) {
            const dateStr = formatLocalYmd(cursor);
            const holiday = holidays[dateStr];
            if (holiday?.isHoliday) {
                events.push({
                    date: dateStr,
                    label: holiday.name,
                    emoji: '🎌',
                    isHoliday: true,
                });
            }

            const commerceEvent = getEcommerceEvent(dateStr);
            if (commerceEvent) {
                events.push({
                    date: dateStr,
                    label: commerceEvent.name,
                    emoji: commerceEvent.emoji,
                    isHoliday: false,
                });
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        const uniq = new Map<string, { date: string; label: string; emoji: string; isHoliday: boolean }>();
        for (const event of events) {
            uniq.set(`${event.date}-${event.label}`, event);
        }

        return [...uniq.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [dateRange.startDate, dateRange.endDate, holidays]);

    const shouldShowEventChips = days <= 14 || Boolean(startDate && endDate);
    const [selectedCell, setSelectedCell] = useState<{
        dayOfWeek: number;
        dayName: string;
        hour: number;
        hourRange: string;
    } | null>(null);

    // 7x24 매트릭스로 변환
    const matrix: (HeatmapCell | null)[][] = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => null)
    );

    data.forEach(cell => {
        if (cell.hour >= 0 && cell.hour < 24 && cell.dayOfWeek >= 0 && cell.dayOfWeek < 7) {
            matrix[cell.dayOfWeek][cell.hour] = cell;
        }
    });

    const handleCellClick = (dayOfWeek: number, hour: number) => {
        setSelectedCell({
            dayOfWeek,
            dayName: DAY_NAMES[dayOfWeek],
            hour,
            hourRange: HOUR_RANGES[hour],
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="flex gap-0.5">
                                <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                {Array.from({ length: 24 }).map((_, j) => (
                                    <div key={j} className="flex-1 h-8 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-black flex items-center gap-2">
                        <span className="text-2xl">🗓️</span> 시간대별 발송 패턴
                        <span className="text-sm font-normal text-gray-400 ml-2">
                            {dateRange.start} ~ {dateRange.end}
                        </span>
                    </h2>
                </div>

                {/* 범례 */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-100 to-slate-200"></div>
                        <span className="text-xs text-gray-500">한산</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-sky-200 to-blue-300"></div>
                        <span className="text-xs text-gray-500">보통</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-orange-400"></div>
                        <span className="text-xs text-gray-500">활발</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-500 to-orange-500"></div>
                        <span className="text-xs text-gray-500">밀집</span>
                    </div>
                </div>
            </div>

            {shouldShowEventChips && timelineEvents.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {timelineEvents.slice(0, 10).map((event) => (
                        <div
                            key={`${event.date}-${event.label}`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                                event.isHoliday
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                        >
                            <span>{event.emoji}</span>
                            <span className="font-medium">{event.label}</span>
                            <span className="opacity-70">
                                {new Date(event.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* 히트맵 */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* 시간 라벨 */}
                    <div className="flex mb-2">
                        <div className="w-10 flex-shrink-0"></div>
                        {HOUR_LABELS.map((hour, i) => (
                            <div
                                key={hour}
                                className="flex-1 text-center text-[10px] font-medium text-gray-400"
                            >
                                {i % 2 === 0 ? hour : ''}
                            </div>
                        ))}
                    </div>

                    {/* 히트맵 그리드 */}
                    <div className="space-y-0.5">
                        {matrix.map((row, dayIndex) => {
                            const isWeekend = WEEKEND_INDICES.includes(dayIndex);
                            return (
                            <div
                                key={dayIndex}
                                className={`flex items-center gap-0.5 rounded-lg py-0.5 px-1 -mx-1 ${
                                    isWeekend ? 'bg-rose-50/50' : ''
                                }`}
                            >
                                {/* 요일 라벨 */}
                                <div className={`w-10 flex-shrink-0 text-sm font-semibold text-right pr-2 ${
                                    isWeekend ? 'text-rose-500' : 'text-gray-600'
                                }`}>
                                    {DAY_NAMES[dayIndex]}
                                </div>

                                {/* 셀들 */}
                                {row.map((cell, hour) => {
                                    const count = cell?.count || 0;
                                    const density = cell?.density || 'low';

                                    return (
                                        <button
                                            key={hour}
                                            onClick={() => handleCellClick(dayIndex, hour)}
                                            className={`
                                                flex-1 h-9 rounded flex items-center justify-center
                                                text-[10px] font-semibold cursor-pointer
                                                transition-all duration-150 hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 hover:z-10
                                                ${getDensityStyle(density, count)}
                                            `}
                                            title={`${DAY_NAMES[dayIndex]}요일 ${hour}시: ${count}건 - 클릭하여 상세보기`}
                                        >
                                            {count > 0 ? count : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                        })}
                    </div>
                </div>
            </div>

            {/* 설명 */}
            <p className="mt-6 text-sm text-gray-400 text-center">
                셀을 클릭하면 해당 시간대에 발송된 푸시를 확인할 수 있습니다
            </p>

            {/* 드릴다운 모달 */}
            <TimingDrilldownModal
                isOpen={selectedCell !== null}
                onClose={() => setSelectedCell(null)}
                dayOfWeek={selectedCell?.dayOfWeek ?? 0}
                dayName={selectedCell?.dayName ?? ''}
                hour={selectedCell?.hour ?? 0}
                hourRange={selectedCell?.hourRange ?? ''}
                days={days}
                appNames={appNames}
            />
        </div>
    );
};
