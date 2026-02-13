import type { Database } from './database';

export type PushMessage = Database['public']['Tables']['push_messages']['Row'];

export interface FeedFilters {
  category: string;
  apps: string[];
  selectedDates?: string[]; // YYYY-MM-DD format
}

// 산업 기반 앱 카테고리
export const CATEGORIES = [
  { id: 'all', name: '전체', nameEn: 'All', emoji: '🧭' },
  { id: 'fashion', name: '패션', nameEn: 'Fashion', emoji: '👗' },
  { id: 'ecommerce', name: '이커머스', nameEn: 'E-commerce', emoji: '🛒' },
  { id: 'food', name: 'F&B', nameEn: 'F&B', emoji: '🍔' },
  { id: 'travel', name: '여행', nameEn: 'Travel', emoji: '✈️' },
  { id: 'mobility', name: '모빌리티', nameEn: 'Mobility', emoji: '🚕' },
  { id: 'finance', name: '금융', nameEn: 'Finance', emoji: '💳' },
  { id: 'others', name: '기타', nameEn: 'Others', emoji: '📦' },
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🧭',
  fashion: '👗',
  ecommerce: '🛒',
  food: '🍔',
  travel: '✈️',
  mobility: '🚕',
  finance: '💳',
  others: '📦',
};

// 메시지 목적 카테고리
export const MESSAGE_CATEGORIES = [
  { id: 'promo', name: '프로모션', emoji: '💸', color: 'bg-red-100 text-red-700', description: '할인, 쿠폰, 이벤트 등 혜택 중심' },
  { id: 'product', name: '상품', emoji: '📦', color: 'bg-blue-100 text-blue-700', description: '신상품, 입고, 추천 상품 안내' },
  { id: 'retention', name: '리텐션', emoji: '🔁', color: 'bg-purple-100 text-purple-700', description: '장바구니, 리마인드, 복귀 유도' },
  { id: 'system', name: '시스템', emoji: '⚙️', color: 'bg-cyan-100 text-cyan-700', description: '주문/배송/상태 알림' },
  { id: 'transaction', name: '거래', emoji: '💳', color: 'bg-gray-100 text-gray-600', description: '결제/정산 등 거래 관련' },
  { id: 'empty', name: '빈메시지', emoji: '🫥', color: 'bg-gray-100 text-gray-400', description: '본문 누락 등 비정상 메시지' },
  { id: 'other', name: '기타', emoji: '🧩', color: 'bg-amber-100 text-amber-700', description: '분류 외 메시지' },
] as const;

export const getCategoryBadgeColor = (category: string): string => {
  const cat = MESSAGE_CATEGORIES.find((c) => c.id === category);
  return cat?.color || 'bg-gray-100 text-gray-600';
};

export const getCategoryLabel = (category: string): string => {
  const cat = MESSAGE_CATEGORIES.find((c) => c.id === category);
  return cat?.name || '기타';
};

export const getCategoryEmoji = (category: string): string => {
  const cat = MESSAGE_CATEGORIES.find((c) => c.id === category);
  return cat?.emoji || '🧩';
};

const PLACEHOLDER_TEXTS = [
  '요약정보',
  '요약 정보',
  '알림',
  '앱 알림',
  '푸시 알림',
  '새로운 알림',
];

export const isValidMessage = (msg: PushMessage): boolean => {
  const title = msg.title?.trim() || '';
  const body = msg.body?.trim() || '';

  if (!title && !body) return false;

  const combinedText = `${title} ${body}`.trim().toLowerCase();
  for (const placeholder of PLACEHOLDER_TEXTS) {
    if (combinedText === placeholder.toLowerCase()) return false;
  }

  if (!title && PLACEHOLDER_TEXTS.some((p) => body.toLowerCase() === p.toLowerCase())) {
    return false;
  }

  if (title.length + body.length < 3) return false;

  return true;
};

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
    day: 'numeric',
  });
};
