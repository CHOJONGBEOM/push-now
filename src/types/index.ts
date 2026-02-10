export interface PushMessage {
    id: string;
    app_name: string;
    package_name: string | null;
    title: string | null;
    content: string | null;
    category: 'sale' | 'new' | 'restock' | 'reminder' | 'event' | 'other';
    posted_at: string;
    created_at: string;
}

export interface AppInfo {
    name: string;
    packageName: string;
    color: string;
    icon?: string;
}

export interface TimeSlot {
    day: number;
    hour: number;
    count: number;
}

export interface HeatmapCell {
    day: number;
    hour: number;
    count: number;
    color: string;
}

export const APP_COLORS: Record<string, string> = {
    '무신사': '#000000',
    '지그재그': '#FF6B9D',
    '29CM': '#00C4B4',
    '에이블리': '#FF5722',
    'W컨셉': '#000000',
    '쿠팡': '#C73C3C',
    '배달의민족': '#2AC1BC',
    '요기요': '#FA0050',
    '마켓컬리': '#5F0080',
    '올리브영': '#009B7D',
    '네이버': '#03C75A',
    '카카오': '#FEE500',
    '토스': '#0064FF',
    '당근마켓': '#FF6F0F',
    '번개장터': '#FDD000',
};

export const CATEGORY_CONFIG = {
    sale: { label: '할인', color: 'bg-red-100 text-red-700', icon: '🏷️' },
    new: { label: '신상', color: 'bg-blue-100 text-blue-700', icon: '🆕' },
    restock: { label: '재입고', color: 'bg-green-100 text-green-700', icon: '📦' },
    reminder: { label: '리마인더', color: 'bg-yellow-100 text-yellow-700', icon: '🔔' },
    event: { label: '이벤트', color: 'bg-purple-100 text-purple-700', icon: '🎁' },
    other: { label: '기타', color: 'bg-gray-100 text-gray-700', icon: '📌' },
} as const;
