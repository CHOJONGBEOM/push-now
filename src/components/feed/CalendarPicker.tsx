import React, { useState, useMemo } from 'react';
import { useKoreanHolidays, getEcommerceEvent } from '../../hooks/useKoreanHolidays';

interface CalendarPickerProps {
    selectedDates: string[] | undefined;
    onDatesSelect: (dates: string[] | undefined) => void;
    dateCounts: Record<string, number>;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
    selectedDates = [],
    onDatesSelect,
    dateCounts,
}) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // 공휴일 데이터 가져오기
    const { holidays } = useKoreanHolidays(currentMonth.year);

    // 월 이동
    const goToPrevMonth = () => {
        setCurrentMonth(prev => {
            if (prev.month === 0) {
                return { year: prev.year - 1, month: 11 };
            }
            return { ...prev, month: prev.month - 1 };
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => {
            if (prev.month === 11) {
                return { year: prev.year + 1, month: 0 };
            }
            return { ...prev, month: prev.month + 1 };
        });
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
    };

    // 최대 카운트 계산 (히트맵 스케일용)
    const maxCount = useMemo(() => {
        const counts = Object.values(dateCounts);
        return counts.length > 0 ? Math.max(...counts) : 1;
    }, [dateCounts]);

    // 히트맵 색상 계산
    const getHeatmapColor = (count: number): string => {
        if (count === 0) return 'bg-gray-50';
        const intensity = count / maxCount;
        if (intensity < 0.33) return 'bg-blue-100';
        if (intensity < 0.66) return 'bg-blue-200';
        return 'bg-blue-300';
    };

    // 날짜 문자열 포맷 (YYYY-MM-DD)
    const formatDateStr = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // 캘린더 날짜 생성
    const calendarDays = useMemo(() => {
        const { year, month } = currentMonth;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay(); // 0 = Sunday

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // 이전 달 패딩
        for (let i = startPadding - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }

        // 현재 달
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // 다음 달 패딩 (6주 채우기)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    }, [currentMonth]);

    // 현재 월의 모든 날짜 (월 전체 선택용)
    const currentMonthDates = useMemo(() => {
        const { year, month } = currentMonth;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const dates: string[] = [];
        for (let i = 1; i <= lastDay; i++) {
            const d = new Date(year, month, i);
            dates.push(formatDateStr(d));
        }
        return dates;
    }, [currentMonth]);

    // 날짜 클릭 핸들러 (다중 선택)
    const handleDateClick = (dateStr: string) => {
        if (selectedDates.includes(dateStr)) {
            // 이미 선택된 날짜 제거
            const newDates = selectedDates.filter(d => d !== dateStr);
            onDatesSelect(newDates.length > 0 ? newDates : undefined);
        } else {
            // 새 날짜 추가
            onDatesSelect([...selectedDates, dateStr].sort());
        }
    };

    // 월 전체 선택/해제
    const handleMonthToggle = () => {
        const allSelected = currentMonthDates.every(d => selectedDates.includes(d));
        if (allSelected) {
            // 현재 월 해제
            const newDates = selectedDates.filter(d => !currentMonthDates.includes(d));
            onDatesSelect(newDates.length > 0 ? newDates : undefined);
        } else {
            // 현재 월 전체 선택
            const newDates = [...new Set([...selectedDates, ...currentMonthDates])].sort();
            onDatesSelect(newDates);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // 선택된 날짜의 총 메시지 수
    const totalSelectedMessages = useMemo(() => {
        return selectedDates.reduce((sum, date) => sum + (dateCounts[date] || 0), 0);
    }, [selectedDates, dateCounts]);

    // 헤더 표시 텍스트
    const getHeaderText = () => {
        if (selectedDates.length === 0) return '전체 기간';
        if (selectedDates.length === 1) {
            const date = new Date(selectedDates[0]);
            return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
        }
        return `${selectedDates.length}일 선택됨`;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* 헤더 */}
            <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">📅</span>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{getHeaderText()}</p>
                        <p className="text-xs text-gray-500">
                            {selectedDates.length > 0
                                ? `${totalSelectedMessages}건의 메시지`
                                : '날짜를 클릭해서 선택하세요 (다중 선택 가능)'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedDates.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDatesSelect(undefined);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100"
                        >
                            초기화
                        </button>
                    )}
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* 캘린더 본체 */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                    {/* 월 네비게이션 */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                {currentMonth.year}년 {monthNames[currentMonth.month]}
                            </span>
                            <button
                                onClick={goToToday}
                                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50"
                            >
                                오늘
                            </button>
                            <button
                                onClick={handleMonthToggle}
                                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 border border-gray-200"
                            >
                                {currentMonthDates.every(d => selectedDates.includes(d)) ? '월 해제' : '월 전체'}
                            </button>
                        </div>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day, i) => (
                            <div
                                key={day}
                                className={`text-center text-xs font-medium py-2 ${
                                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                                }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map(({ date, isCurrentMonth }, index) => {
                            const dateStr = formatDateStr(date);
                            const count = dateCounts[dateStr] || 0;
                            const isSelected = selectedDates.includes(dateStr);
                            const isToday = dateStr === today;
                            const holiday = holidays[dateStr];
                            const ecommerceEvent = getEcommerceEvent(dateStr);
                            const dayOfWeek = date.getDay();
                            const isHoliday = holiday?.isHoliday || dayOfWeek === 0;

                            return (
                                <button
                                    key={index}
                                    onClick={() => isCurrentMonth && handleDateClick(dateStr)}
                                    disabled={!isCurrentMonth}
                                    className={`
                                        relative aspect-square rounded-lg text-sm font-medium
                                        flex flex-col items-center justify-center gap-0.5
                                        transition-all
                                        ${!isCurrentMonth ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
                                        ${isCurrentMonth && !isSelected ? getHeatmapColor(count) : ''}
                                        ${isSelected ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white ring-2 ring-purple-400 ring-offset-1 shadow-md' : ''}
                                        ${isToday && !isSelected ? 'ring-2 ring-violet-400' : ''}
                                        ${isCurrentMonth && !isSelected && isHoliday ? 'text-red-600' : ''}
                                        ${isCurrentMonth && !isSelected && dayOfWeek === 6 && !isHoliday ? 'text-blue-600' : ''}
                                        ${isCurrentMonth && count > 0 && !isSelected ? 'hover:ring-2 hover:ring-purple-300' : ''}
                                    `}
                                    title={holiday?.name || ecommerceEvent?.name || undefined}
                                >
                                    <span>{date.getDate()}</span>
                                    {/* 공휴일/이벤트 표시 */}
                                    {isCurrentMonth && (holiday || ecommerceEvent) && (
                                        <span className="text-[9px] leading-none">
                                            {holiday ? '🔴' : ecommerceEvent?.emoji}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 범례 */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
                            선택됨
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-blue-200" />
                            메시지 있음
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded ring-2 ring-violet-400" />
                            오늘
                        </span>
                        <span className="flex items-center gap-1">
                            🔴 공휴일
                        </span>
                        <span className="flex items-center gap-1">
                            🔥 이벤트
                        </span>
                    </div>

                    {/* 선택된 날짜 태그 */}
                    {selectedDates.length > 0 && selectedDates.length <= 10 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-1.5">
                                {selectedDates.map(dateStr => {
                                    const date = new Date(dateStr);
                                    return (
                                        <span
                                            key={dateStr}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                                        >
                                            {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                            <button
                                                onClick={() => handleDateClick(dateStr)}
                                                className="hover:bg-gray-200 rounded-full p-0.5"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
