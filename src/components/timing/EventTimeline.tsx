import React, { useMemo } from 'react';
import { ECOMMERCE_EVENTS, useKoreanHolidays } from '../../hooks/useKoreanHolidays';

interface EventTimelineProps {
    days: number;
    startDate?: Date;
}

interface TimelineEvent {
    date: string;
    name: string;
    emoji: string;
    isHoliday: boolean;
    daysFromNow: number;
    isPast: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ days, startDate }) => {
    const today = startDate || new Date();
    const year = today.getFullYear();
    const { holidays } = useKoreanHolidays(year);

    // 기간 내 이벤트 찾기
    const events = useMemo(() => {
        const result: TimelineEvent[] = [];
        const endDate = new Date(today);
        const periodStart = new Date(today);
        periodStart.setDate(periodStart.getDate() - days);

        // 이커머스 이벤트 확인
        Object.entries(ECOMMERCE_EVENTS).forEach(([dateKey, event]) => {
            let eventDate: Date | null = null;

            if (dateKey.includes('-') && dateKey.length === 10) {
                // YYYY-MM-DD 형식
                eventDate = new Date(dateKey);
            } else if (dateKey.length === 5) {
                // MM-DD 형식 - 현재 연도로
                eventDate = new Date(`${year}-${dateKey}`);
            }

            if (eventDate && eventDate >= periodStart && eventDate <= endDate) {
                const daysFromNow = Math.ceil((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
                result.push({
                    date: eventDate.toISOString().split('T')[0],
                    name: event.name,
                    emoji: event.emoji,
                    isHoliday: false,
                    daysFromNow,
                    isPast: daysFromNow > 0,
                });
            }
        });

        // 공휴일 확인 (해당 기간 내)
        Object.entries(holidays).forEach(([dateStr, holiday]) => {
            if (holiday.isHoliday) {
                const eventDate = new Date(dateStr);
                if (eventDate >= periodStart && eventDate <= endDate) {
                    const daysFromNow = Math.ceil((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
                    // 이미 이커머스 이벤트로 추가된 경우 중복 방지
                    if (!result.some(e => e.date === dateStr)) {
                        result.push({
                            date: dateStr,
                            name: holiday.name,
                            emoji: '🔴',
                            isHoliday: true,
                            daysFromNow,
                            isPast: daysFromNow > 0,
                        });
                    }
                }
            }
        });

        // 날짜순 정렬
        return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [days, year, holidays, today]);

    if (events.length === 0) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📅</span> 기간 내 주요 이벤트
            </h3>
            <div className="flex flex-wrap gap-2">
                {events.map((event, index) => (
                    <div
                        key={index}
                        className={`
                            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                            ${event.isPast
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            }
                        `}
                    >
                        <span>{event.emoji}</span>
                        <span className="font-medium">{event.name}</span>
                        <span className="text-xs opacity-70">{formatDate(event.date)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
