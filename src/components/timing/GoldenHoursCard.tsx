import React from 'react';
import type { GoldenHour } from '../../hooks/useTimingData';

interface GoldenHoursCardProps {
    goldenHours: GoldenHour[];
    avoidTime: GoldenHour | null;
    isLoading?: boolean;
}

export const GoldenHoursCard: React.FC<GoldenHoursCardProps> = ({
    goldenHours,
    avoidTime,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="flex gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-1 h-32 bg-gray-100 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 순위별 색상
    const getRankStyle = (index: number) => {
        switch (index) {
            case 0:
                return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500';
            case 1:
                return 'bg-gradient-to-br from-sky-400 to-blue-500 text-white border-sky-400';
            case 2:
                return 'bg-gradient-to-br from-violet-400 to-purple-500 text-white border-violet-400';
            default:
                return 'bg-white text-black border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {/* 헤더 */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">
                    <span className="text-2xl">✨</span> 추천 발송 시간
                </h2>
                <p className="text-sm text-gray-500">경쟁 밀도 낮은 시간대</p>
            </div>

            {/* TOP 3 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {goldenHours.length > 0 ? (
                    goldenHours.map((slot, index) => (
                        <div
                            key={`${slot.dayOfWeek}-${slot.hour}`}
                            className={`
                                relative overflow-hidden rounded-xl p-6 border shadow-sm
                                ${getRankStyle(index)}
                            `}
                        >
                            {/* 순위 뱃지 */}
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white/20 text-white">
                                {index + 1}
                            </div>

                            {/* 요일 + 시간 */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-white/80">
                                    {slot.dayName}요일
                                </p>
                                <p className="text-2xl font-bold tracking-tight">
                                    {slot.hourRange}
                                </p>
                            </div>

                            {/* 경쟁 밀도 */}
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                                <span>↓</span>
                                <span>{Math.abs(slot.percentageBelowAvg)}% 한산</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-8 text-gray-400">
                        분석할 데이터가 부족합니다
                    </div>
                )}
            </div>

            {/* 피해야 할 시간 경고 */}
            {avoidTime && avoidTime.count > 0 && (
                <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700">
                            피해야 할 시간: {avoidTime.dayName}요일 {avoidTime.hourRange}
                        </p>
                        <p className="text-xs text-red-500">
                            경쟁 밀도가 평균 대비 {Math.abs(avoidTime.percentageBelowAvg)}% 높습니다
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                        {avoidTime.count}건
                    </span>
                </div>
            )}
        </div>
    );
};
