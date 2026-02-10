import React from 'react';

interface DayData {
    dayOfWeek: number;
    dayName: string;
    count: number;
}

interface DayOfWeekChartProps {
    data: DayData[];
    isLoading?: boolean;
}

// 평일/주말 색상 (월화수목금토일 순서, 0=월, 6=일)
const getDayColor = (dayIndex: number) => {
    // 주말 (토=5, 일=6)
    if (dayIndex >= 5) {
        return 'from-rose-400 to-rose-500';
    }
    // 평일
    return 'from-blue-400 to-blue-500';
};

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ data, isLoading = false }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);

    // 피크 요일 찾기
    const peakDay = data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-8 h-4 bg-gray-100 rounded"></div>
                                <div className="flex-1 h-8 bg-gray-100 rounded-full"></div>
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
                        <span className="text-2xl">📊</span> 요일별 발송량
                    </h2>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    총 <span className="font-bold text-gray-900">{totalCount}</span>건
                </div>
            </div>

            {/* 차트 */}
            <div className="space-y-3">
                {data.map(item => {
                    const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const isPeak = item.dayOfWeek === peakDay?.dayOfWeek && item.count > 0;

                    const isWeekend = item.dayOfWeek >= 5; // 토=5, 일=6
                    return (
                        <div key={item.dayOfWeek} className="flex items-center gap-4">
                            {/* 요일 라벨 */}
                            <div className={`w-8 text-sm font-semibold ${isWeekend ? 'text-rose-500' : 'text-gray-600'}`}>
                                {item.dayName}
                            </div>

                            {/* 바 */}
                            <div className="flex-1 h-10 bg-gray-100 rounded-full overflow-hidden relative">
                                <div
                                    className={`
                                        h-full rounded-full transition-all duration-500 ease-out
                                        flex items-center justify-end pr-3
                                        bg-gradient-to-r ${getDayColor(item.dayOfWeek)}
                                        ${isPeak ? 'shadow-md' : ''}
                                    `}
                                    style={{ width: `${Math.max(widthPercent, item.count > 0 ? 15 : 0)}%` }}
                                >
                                    {item.count > 0 && (
                                        <span className="text-xs font-bold text-white drop-shadow-sm">
                                            {item.count}
                                        </span>
                                    )}
                                </div>

                                {/* 피크 표시 */}
                                {isPeak && item.count > 0 && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[-100%] ml-2">
                                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                                            🔥 피크
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 인사이트 */}
            {peakDay && peakDay.count > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-lg">💡</span>
                        <p className="text-sm text-amber-800">
                            <span className="font-semibold">{peakDay.dayName}요일</span>에
                            가장 많은 푸시가 발송됩니다.
                            경쟁을 피하려면 다른 요일을 고려해보세요.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
