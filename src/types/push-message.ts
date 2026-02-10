import type { Database } from './database';

export type PushMessage = Database['public']['Tables']['push_messages']['Row'];

export interface FeedFilters {
    category: string;
    apps: string[];
    selectedDates?: string[]; // YYYY-MM-DD format (다중 선택 지원)
}

// 업종 기반 카테고리 (apps 테이블과 매핑)
export const CATEGORIES = [
    { id: 'all', name: '전체', nameEn: 'All', emoji: '📡' },
    { id: 'fashion', name: '패션', nameEn: 'Fashion', emoji: '👗' },
    { id: 'ecommerce', name: '이커머스', nameEn: 'E-commerce', emoji: '🛒' },
    { id: 'food', name: 'F&B', nameEn: 'F&B', emoji: '🍔' },
    { id: 'travel', name: '여행', nameEn: 'Travel', emoji: '✈️' },
    { id: 'finance', name: '금융', nameEn: 'Finance', emoji: '💳' },
    { id: 'others', name: '기타', nameEn: 'Others', emoji: '📦' },
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
    all: '📡',
    fashion: '👗',
    ecommerce: '🛒',
    food: '🍔',
    travel: '✈️',
    finance: '💳',
    others: '📦',
};

// 목적 기반 메시지 카테고리 정의
export const MESSAGE_CATEGORIES = [
    { id: 'promo', name: '프로모션', emoji: '🏷️', color: 'bg-red-100 text-red-700', description: '할인, 쿠폰, 이벤트, 포인트 혜택' },
    { id: 'product', name: '상품', emoji: '✨', color: 'bg-blue-100 text-blue-700', description: '신상품, 재입고, 추천상품' },
    { id: 'retention', name: '리텐션', emoji: '💝', color: 'bg-purple-100 text-purple-700', description: '장바구니, 리마인더, 재방문 유도' },
    { id: 'system', name: '시스템', emoji: '📦', color: 'bg-cyan-100 text-cyan-700', description: '배송, 주문상태 알림' },
    { id: 'transaction', name: '거래', emoji: '💳', color: 'bg-gray-100 text-gray-500', description: '결제, 계좌 알림 (숨김)' },
    { id: 'empty', name: '빈메시지', emoji: '📭', color: 'bg-gray-100 text-gray-400', description: '내용 없음 (숨김)' },
    { id: 'other', name: '미분류', emoji: '📌', color: 'bg-amber-100 text-amber-700', description: 'AI 분류 대기' },
] as const;

// 카테고리 뱃지 색상
export const getCategoryBadgeColor = (category: string): string => {
    const cat = MESSAGE_CATEGORIES.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-600';
};

// 카테고리 라벨
export const getCategoryLabel = (category: string): string => {
    const cat = MESSAGE_CATEGORIES.find(c => c.id === category);
    return cat?.name || '기타';
};

// 카테고리 이모지
export const getCategoryEmoji = (category: string): string => {
    const cat = MESSAGE_CATEGORIES.find(c => c.id === category);
    return cat?.emoji || '📌';
};

// 의미없는 메시지 필터링 (빈 메시지, 플레이스홀더 텍스트 등)
const PLACEHOLDER_TEXTS = [
    '요약정보',
    '요약 정보',
    '알림',
    '새 알림',
    '푸시 알림',
    '새로운 알림',
];

export const isValidMessage = (msg: PushMessage): boolean => {
    const title = msg.title?.trim() || '';
    const body = msg.body?.trim() || '';

    // 제목과 본문 둘 다 비어있으면 제외
    if (!title && !body) return false;

    // 플레이스홀더 텍스트만 있는 경우 제외
    const combinedText = `${title} ${body}`.trim().toLowerCase();
    for (const placeholder of PLACEHOLDER_TEXTS) {
        if (combinedText === placeholder.toLowerCase()) return false;
    }

    // 본문이 플레이스홀더만 있고 제목이 없는 경우 제외
    if (!title && PLACEHOLDER_TEXTS.some(p => body.toLowerCase() === p.toLowerCase())) {
        return false;
    }

    // 너무 짧은 메시지 (의미 없을 가능성 높음)
    if (title.length + body.length < 3) return false;

    return true;
};

// 상대 시간 표시 헬퍼
export const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return posted.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
};
