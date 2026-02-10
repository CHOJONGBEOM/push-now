import React, { useState } from 'react';
import type { PushMessage } from '../../types/push-message';
import { CATEGORY_EMOJIS, getRelativeTime } from '../../types/push-message';
import { getAppIconUrl, getAppColorGradient, getAppInitial } from '../../utils/appIcons';

interface FeedCardProps {
    message: PushMessage;
    onClick: () => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ message, onClick }) => {
    const emoji = CATEGORY_EMOJIS[message.category] || '📱';
    const [iconError, setIconError] = useState(false);

    const iconUrl = getAppIconUrl(message.app_name);
    const gradient = getAppColorGradient(message.app_name);
    const initial = getAppInitial(message.app_name);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
        >

            <div className="relative flex gap-5">
                {/* 앱 아이콘 */}
                <div className="flex-shrink-0">
                    {iconUrl && !iconError ? (
                        <img
                            src={iconUrl}
                            alt={message.app_name}
                            className="size-14 rounded-xl object-cover border border-gray-100"
                            onError={() => setIconError(true)}
                        />
                    ) : (
                        <div className={`size-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-xl border border-gray-100`}>
                            {initial}
                        </div>
                    )}
                </div>

                {/* 메시지 내용 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-black text-base">{message.app_name}</h3>
                                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded border border-gray-100">
                                    {emoji} {message.category}
                                </span>
                            </div>
                            {/* 제목 표시 */}
                            {message.title && (
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                    {message.title}
                                </p>
                            )}
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {message.body}
                            </p>
                        </div>
                        <button className="flex-shrink-0 text-gray-400 hover:text-black transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* 시간 정보 - 상대 시간 + 실제 시간 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{getRelativeTime(message.posted_at)}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400">
                                {new Date(message.posted_at).toLocaleString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
