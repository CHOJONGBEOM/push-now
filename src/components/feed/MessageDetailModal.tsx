import React, { useState, useEffect } from 'react';
import type { PushMessage } from '../../types/push-message';
import { getRelativeTime, getCategoryEmoji, isValidMessage } from '../../types/push-message';
import { useNavigate } from 'react-router-dom';
import { getAppIconUrl, getAppColorGradient, getAppInitial } from '../../utils/appIcons';
import { supabase } from '../../config/supabase';

interface MessageDetailModalProps {
    message: PushMessage;
    onClose: () => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({ message, onClose }) => {
    const navigate = useNavigate();
    const [iconError, setIconError] = useState(false);
    const [appMessages, setAppMessages] = useState<PushMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<PushMessage>(message);

    const iconUrl = getAppIconUrl(message.app_name);
    const gradient = getAppColorGradient(message.app_name);
    const initial = getAppInitial(message.app_name);

    // 해당 앱의 다른 메시지들 가져오기
    useEffect(() => {
        const fetchAppMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('push_messages')
                .select('*')
                .eq('app_name', message.app_name)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .order('posted_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                // 빈 메시지, 플레이스홀더 메시지 필터링
                const validMessages = (data as PushMessage[]).filter(isValidMessage);
                setAppMessages(validMessages);
            }
            setLoading(false);
        };

        fetchAppMessages();
    }, [message.app_name]);

    const handleCreateSimilar = () => {
        navigate('/generate', {
            state: {
                referenceMessage: {
                    app_name: selectedMessage.app_name,
                    title: selectedMessage.title,
                    body: selectedMessage.body,
                    category: selectedMessage.category, // promo, product, retention 등
                }
            }
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {iconUrl && !iconError ? (
                            <img
                                src={iconUrl}
                                alt={message.app_name}
                                className="size-12 rounded-xl object-cover border border-gray-100"
                                onError={() => setIconError(true)}
                            />
                        ) : (
                            <div className={`size-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg border border-gray-100 shadow-sm`}>
                                {initial}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-black">{message.app_name}</h3>
                            <p className="text-sm text-gray-500">
                                {loading ? '로딩 중...' : `총 ${appMessages.length}개의 메시지`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2단 레이아웃 */}
                <div className="flex flex-1 overflow-hidden">
                    {/* 왼쪽: 메시지 리스트 */}
                    <div className="w-80 border-r border-gray-100 overflow-y-auto bg-gray-50">
                        <div className="p-3 space-y-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="size-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                appMessages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`w-full text-left p-3 rounded-xl transition-all ${
                                            selectedMessage.id === msg.id
                                                ? 'bg-white shadow-md ring-2 ring-violet-500'
                                                : 'bg-white hover:bg-gray-100 border border-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs">{getCategoryEmoji(msg.category)}</span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {getRelativeTime(msg.posted_at)}
                                            </span>
                                            {msg.id === message.id && (
                                                <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-medium">
                                                    선택됨
                                                </span>
                                            )}
                                        </div>
                                        {msg.title && (
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                                                {msg.title}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {msg.body || '본문 없음'}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 선택된 메시지 상세 */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* 발송 시간 */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{getRelativeTime(selectedMessage.posted_at)}</span>
                                <span className="text-gray-300">•</span>
                                <span>{new Date(selectedMessage.posted_at).toLocaleString('ko-KR')}</span>
                            </div>

                            {/* 카테고리 뱃지 */}
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-1.5">
                                    <span>{getCategoryEmoji(selectedMessage.category)}</span>
                                    <span>{selectedMessage.category}</span>
                                </span>
                            </div>

                            {/* 제목 */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    제목
                                </h4>
                                <h2 className="text-2xl font-bold text-black leading-tight">
                                    {selectedMessage.title || '제목 없음'}
                                </h2>
                            </div>

                            {/* 본문 */}
                            {selectedMessage.body && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        본문
                                    </h4>
                                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                                        {selectedMessage.body}
                                    </p>
                                </div>
                            )}

                            {/* 액션 버튼 */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={handleCreateSimilar}
                                    className="flex-1 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                                >
                                    이런 메시지 만들기 →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
