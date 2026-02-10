import React from 'react';
import type { PushMessage } from '../../types/push-message';
import { getCategoryEmoji, getCategoryLabel, getCategoryBadgeColor } from '../../types/push-message';

interface SimilarMessagesProps {
    messages: PushMessage[];
    loading: boolean;
    searchQuery: string;
}

export const SimilarMessages: React.FC<SimilarMessagesProps> = ({
    messages,
    loading,
    searchQuery
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">유사 메시지</h3>
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!searchQuery) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">유사 메시지</h3>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">메시지를 입력하면</p>
                    <p className="text-sm">유사한 메시지를 찾아드려요</p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">유사 메시지</h3>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <p className="text-sm">유사한 메시지를 찾지 못했어요</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">유사 메시지</h3>
                <span className="text-xs text-gray-500">{messages.length}건 발견</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-600">{message.app_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadgeColor(message.category)}`}>
                                {getCategoryEmoji(message.category)} {getCategoryLabel(message.category)}
                            </span>
                        </div>
                        {message.title && (
                            <p className="font-medium text-gray-900 text-sm mb-1">{message.title}</p>
                        )}
                        <p className="text-gray-600 text-sm line-clamp-2">{message.body}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(message.posted_at).toLocaleDateString('ko-KR')}
                        </p>
                    </div>
                ))}
            </div>

            {messages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        비슷한 표현이 <span className="font-semibold text-gray-700">{messages.length}번</span> 사용되었어요
                    </p>
                </div>
            )}
        </div>
    );
};
