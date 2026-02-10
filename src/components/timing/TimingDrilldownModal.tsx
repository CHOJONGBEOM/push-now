import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { getAppIcon } from '../../utils/appIcons';
import { getCategoryBadgeColor, getCategoryLabel } from '../../types/push-message';

interface PushMessage {
    id: number;
    app_name: string | null;
    title: string | null;
    body: string | null;
    posted_at: string | null;
    category: string | null;
    has_emoji: boolean | null;
}

interface TimingDrilldownModalProps {
    isOpen: boolean;
    onClose: () => void;
    dayOfWeek: number;
    dayName: string;
    hour: number;
    hourRange: string;
    days: number;
    appNames?: string[];
}

// 월요일 시작 순서 (0=월, 6=일)
const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
// 화면 요일(0=월) → DB 요일(0=일) 매핑
const DISPLAY_TO_DB_DAY: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 0 };

export const TimingDrilldownModal: React.FC<TimingDrilldownModalProps> = ({
    isOpen,
    onClose,
    dayOfWeek,
    dayName,
    hour,
    hourRange,
    days,
    appNames = [],
}) => {
    const [messages, setMessages] = useState<PushMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                // 해당 기간 내 데이터 조회
                let query = supabase
                    .from('push_messages')
                    .select('id, app_name, title, body, posted_at, category, has_emoji')
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .gte('posted_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
                    .order('posted_at', { ascending: false });

                if (appNames.length > 0) {
                    query = query.in('app_name', appNames);
                }

                const { data, error } = await query;

                if (error) throw error;

                // 클라이언트에서 요일/시간 필터링 (KST 기준)
                const typedData = data as PushMessage[] | null;
                // dayOfWeek는 화면 인덱스(0=월), DB는 0=일이므로 변환 필요
                const dbDayOfWeek = DISPLAY_TO_DB_DAY[dayOfWeek];
                const filtered = (typedData || []).filter(msg => {
                    if (!msg.posted_at) return false;
                    const date = new Date(msg.posted_at);
                    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
                    const msgDayOfWeek = kstDate.getUTCDay();
                    const msgHour = kstDate.getUTCHours();

                    // 1시간 단위로 매칭
                    return msgDayOfWeek === dbDayOfWeek && msgHour === hour;
                });

                setMessages(filtered);
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [isOpen, dayOfWeek, hour, days, appNames.join(',')]);

    if (!isOpen) return null;

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 모달 */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* 헤더 */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                {dayName}요일 {hourRange}
                            </h2>
                            <p className="text-gray-300 text-sm">
                                최근 {days}일간 발송된 푸시 메시지 {messages.length}건
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-gray-500">해당 시간대에 발송된 메시지가 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* 앱 아이콘 */}
                                        <img
                                            src={getAppIcon(msg.app_name || '')}
                                            alt={msg.app_name || ''}
                                            className="w-10 h-10 rounded-xl flex-shrink-0"
                                        />

                                        {/* 메시지 내용 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {msg.app_name}
                                                </span>
                                                {msg.category && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(msg.category)}`}>
                                                        {getCategoryLabel(msg.category)}
                                                    </span>
                                                )}
                                                {msg.has_emoji && (
                                                    <span className="text-xs">✨</span>
                                                )}
                                            </div>

                                            {msg.title && (
                                                <p className="font-medium text-gray-900 text-sm mb-0.5 truncate">
                                                    {msg.title}
                                                </p>
                                            )}

                                            {msg.body && (
                                                <p className="text-gray-600 text-sm line-clamp-2">
                                                    {msg.body}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(msg.posted_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                {messages.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-500">
                                <span>앱 {new Set(messages.map(m => m.app_name)).size}개</span>
                                <span>광고 {messages.filter(m => m.category === 'sale').length}건</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
