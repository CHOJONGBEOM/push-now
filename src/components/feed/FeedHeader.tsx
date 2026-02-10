import React from 'react';
import { getRelativeTime } from '../../types/push-message';

interface FeedHeaderProps {
    latestMessageTime: string | null;
    selectedDates?: string[];
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({ latestMessageTime, selectedDates }) => {
    const getDateLabel = () => {
        if (!selectedDates || selectedDates.length === 0) return '전체 기간';
        if (selectedDates.length === 1) {
            const date = new Date(selectedDates[0]);
            return date.toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
            });
        }
        return `${selectedDates.length}일 선택`;
    };

    const formatActualTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-black">
                        메시지 아카이브
                    </h1>
                    <p className="text-gray-600 text-base">
                        경쟁사 푸시 메시지를 날짜별로 탐색하세요
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">
                        {getDateLabel()}
                    </div>
                    {latestMessageTime && (
                        <div className="px-4 py-2 bg-black text-white font-medium rounded-lg flex items-center gap-2">
                            <span className="text-green-400">●</span>
                            <span>
                                최근 업데이트: {getRelativeTime(latestMessageTime)}
                                <span className="text-gray-400 ml-1">
                                    ({formatActualTime(latestMessageTime)})
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
