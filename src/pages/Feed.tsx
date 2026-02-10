import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { FeedHeader } from '../components/feed/FeedHeader';
import { FilterBar } from '../components/feed/FilterBar';
import { CalendarPicker } from '../components/feed/CalendarPicker';
import { FeedCard } from '../components/feed/FeedCard';
import { MessageDetailModal } from '../components/feed/MessageDetailModal';
import { usePushMessages } from '../hooks/usePushMessages';
import type { PushMessage, FeedFilters } from '../types/push-message';

export const Feed: React.FC = () => {
    const [filters, setFilters] = useState<FeedFilters>({
        category: 'all',
        apps: [],
    });
    const [selectedMessage, setSelectedMessage] = useState<PushMessage | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { messages, loading, error, hasMore, loadMore, allApps, dateCounts, latestMessageTime } = usePushMessages(filters);

    const handleDatesChange = (dates: string[] | undefined) => {
        setFilters(prev => ({ ...prev, selectedDates: dates }));
    };

    // 무한 스크롤 설정
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading, loadMore]);

    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({ ...prev, category }));
    };

    const handleAppsChange = (apps: string[]) => {
        setFilters(prev => ({ ...prev, apps }));
    };

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-24 pb-24"
            >
                <FeedHeader latestMessageTime={latestMessageTime} selectedDates={filters.selectedDates} />

                <FilterBar
                    selectedCategory={filters.category}
                    onCategoryChange={handleCategoryChange}
                    selectedApps={filters.apps}
                    onAppsChange={handleAppsChange}
                    availableApps={allApps}
                />

                {/* 캘린더 날짜 선택 */}
                <div className="mb-6">
                    <CalendarPicker
                        selectedDates={filters.selectedDates}
                        onDatesSelect={handleDatesChange}
                        dateCounts={dateCounts}
                    />
                </div>

                {/* 에러 상태 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                        <p className="text-red-600 font-medium">⚠️ {error}</p>
                    </div>
                )}

                {/* 메시지 리스트 */}
                <div className="space-y-6">
                    {messages.map((message) => (
                        <FeedCard
                            key={message.id}
                            message={message}
                            onClick={() => setSelectedMessage(message)}
                        />
                    ))}
                </div>

                {/* 로딩 상태 */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="size-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    </div>
                )}

                {/* 빈 상태 */}
                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {filters.selectedDates?.length ? '선택한 날짜에 메시지가 없습니다' : '메시지가 없습니다'}
                        </h3>
                        <p className="text-gray-500">
                            {filters.selectedDates?.length
                                ? '다른 날짜를 선택하거나 필터를 조정해보세요.'
                                : '필터를 조정하거나 나중에 다시 확인해주세요.'
                            }
                        </p>
                    </div>
                )}

                {/* 무한 스크롤 트리거 */}
                <div ref={loadMoreRef} className="h-4" />

                {/* 더 이상 없음 */}
                {!loading && !hasMore && messages.length > 0 && (
                    <div className="flex flex-col items-center justify-center pt-12">
                        <p className="text-sm text-gray-400 font-medium">
                            모든 메시지를 확인했습니다
                        </p>
                    </div>
                )}
            </main>

            {/* 상세 모달 */}
            {selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                />
            )}
        </div>
    );
};
