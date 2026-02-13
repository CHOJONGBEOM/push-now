/**
 * App Categories Utility
 * Classifies apps into industry categories
 */

export type AppCategory =
  | 'fashion'
  | 'ecommerce'
  | 'food'
  | 'travel'
  | 'mobility'
  | 'finance'
  | 'social'
  | 'entertainment'
  | 'others';

export interface CategoryInfo {
  id: AppCategory;
  name: string;
  emoji: string;
}

export const APP_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'F&B', emoji: '🍔' },
  { id: 'ecommerce', name: '이커머스', emoji: '🛒' },
  { id: 'fashion', name: '패션', emoji: '👠' },
  { id: 'travel', name: '여행', emoji: '✈️' },
  { id: 'mobility', name: '모빌리티', emoji: '🚕' },
  { id: 'finance', name: '금융', emoji: '💰' },
  { id: 'social', name: '소셜', emoji: '💬' },
  { id: 'entertainment', name: '엔터', emoji: '🎬' },
  { id: 'others', name: '기타', emoji: '📦' },
];

const APP_CATEGORY_MAP: Record<string, AppCategory> = {
  // Food
  '배달의민족': 'food',
  '요기요': 'food',
  '쿠팡이츠': 'food',
  '배민': 'food',
  '맥도날드': 'food',
  '버거킹': 'food',
  '롯데잇츠': 'food',

  // Ecommerce
  '쿠팡': 'ecommerce',
  '네이버': 'ecommerce',
  '네이버쇼핑': 'ecommerce',
  '컬리': 'ecommerce',
  '11번가': 'ecommerce',
  '지마켓': 'ecommerce',
  '옥션': 'ecommerce',
  '오늘의집': 'ecommerce',
  '번개장터': 'ecommerce',
  'N+스토어': 'ecommerce',

  // Fashion
  '29CM': 'fashion',
  '무신사': 'fashion',
  'W컨셉': 'fashion',
  '지그재그': 'fashion',
  '에이블리': 'fashion',
  '브랜디': 'fashion',
  'EQL': 'fashion',
  'LookPin': 'fashion',
  '4910': 'fashion',

  // Travel
  '야놀자': 'travel',
  'NOL(야놀자)': 'travel',
  '여기어때': 'travel',
  '에어비앤비': 'travel',
  '스카이스캐너': 'travel',
  '마이리얼트립': 'travel',
  'KLOOK': 'travel',
  'Trip.com': 'travel',

  // Mobility
  'Uber': 'mobility',

  // Finance
  '토스': 'finance',
  '카카오뱅크': 'finance',
  '뱅크샐러드': 'finance',
  '케이뱅크': 'finance',
  '토스뱅크': 'finance',
  '페이코': 'finance',
  '페이북/ISP': 'finance',
  '네이버페이': 'finance',

  // Social
  '당근마켓': 'social',
  '인스타그램': 'social',
  '페이스북': 'social',
  '카카오톡': 'social',
  '라인': 'social',
  '텔레그램': 'social',
  '밴드': 'social',

  // Entertainment
  '넷플릭스': 'entertainment',
  '유튜브': 'entertainment',
  '왓챠': 'entertainment',
  '웨이브': 'entertainment',
  '트위치': 'entertainment',
  '멜론': 'entertainment',
  '지니': 'entertainment',
  '스포티파이': 'entertainment',
};

export const getAppCategory = (appName: string): AppCategory => {
  if (APP_CATEGORY_MAP[appName]) {
    return APP_CATEGORY_MAP[appName];
  }

  const lowerName = appName.toLowerCase();

  if (lowerName.includes('배달') || lowerName.includes('요기') || lowerName.includes('이츠')) {
    return 'food';
  }
  if (lowerName.includes('쿠팡') || lowerName.includes('마켓') || lowerName.includes('스토어')) {
    return 'ecommerce';
  }
  if (lowerName.includes('뱅크') || lowerName.includes('페이') || lowerName.includes('토스')) {
    return 'finance';
  }
  if (lowerName.includes('여행') || lowerName.includes('호텔') || lowerName.includes('trip')) {
    return 'travel';
  }
  if (lowerName.includes('uber') || lowerName.includes('taxi') || lowerName.includes('모빌리티')) {
    return 'mobility';
  }

  return 'others';
};

export const getCategoryInfo = (categoryId: AppCategory): CategoryInfo | undefined => {
  return APP_CATEGORIES.find((cat) => cat.id === categoryId);
};
