/**
 * App category single source of truth
 * - Generate page categories
 * - Timing/Trends app filter categories
 * - Feed/Review lightweight categories
 */

export type AppCategory =
  | 'fashion'
  | 'ecommerce'
  | 'food'
  | 'travel'
  | 'mobility'
  | 'finance'
  | 'content'
  | 'game'
  | 'education'
  | 'health'
  | 'social'
  | 'entertainment'
  | 'others';

export interface CategoryInfo {
  id: AppCategory;
  name: string;
  emoji: string;
}

export interface GenerateCategoryInfo extends CategoryInfo {
  description: string;
  apps: string[];
}

export type FeedCategoryId =
  | 'all'
  | 'fashion'
  | 'ecommerce'
  | 'food'
  | 'travel'
  | 'mobility'
  | 'finance'
  | 'others';

interface FeedCategoryInfo {
  id: FeedCategoryId;
  name: string;
  nameEn: string;
  emoji: string;
}

export const GENERATE_APP_CATEGORIES: GenerateCategoryInfo[] = [
  {
    id: 'fashion',
    name: '패션/뷰티',
    emoji: '👗',
    description: '의류, 신발, 화장품, 액세서리',
    apps: ['무신사', '29CM', '지그재그', '에이블리', 'LookPin', 'EQL', '4910', '화해', '강남언니'],
  },
  {
    id: 'ecommerce',
    name: '종합 이커머스',
    emoji: '🛒',
    description: '식품, 생활용품, 가구, 인테리어',
    apps: ['쿠팡', '컬리', 'N+스토어', '오늘의집', '번개장터'],
  },
  {
    id: 'travel',
    name: '여행/숙박',
    emoji: '✈️',
    description: '항공, 호텔, 액티비티, 렌터카',
    apps: ['마이리얼트립', 'NOL(야놀자)', '여기어때', 'KLOOK', 'Trip.com', '트리플'],
  },
  {
    id: 'mobility',
    name: '모빌리티/교통',
    emoji: '🚕',
    description: '택시, 대리, 렌터카, 이동 서비스',
    apps: ['Uber'],
  },
  {
    id: 'food',
    name: 'F&B/배달',
    emoji: '🍔',
    description: '음식 배달, 프랜차이즈, 카페',
    apps: ['배달의민족', '쿠팡이츠', '롯데잇츠'],
  },
  {
    id: 'content',
    name: '콘텐츠/엔터',
    emoji: '🎬',
    description: '웹툰, OTT, 음악, 숏폼',
    apps: ['카카오페이지', '시리즈', 'TikTok'],
  },
  {
    id: 'game',
    name: '게임',
    emoji: '🎮',
    description: '모바일 게임, 캐주얼 게임, RPG',
    apps: ['Pokémon GO'],
  },
  {
    id: 'education',
    name: '교육/자기계발',
    emoji: '📚',
    description: '어학, 자격증, 온라인 강의',
    apps: ['듀오링고', 'Cake'],
  },
  {
    id: 'finance',
    name: '금융/핀테크',
    emoji: '💳',
    description: '은행, 증권, 간편결제',
    apps: ['토스', '페이북/ISP'],
  },
  {
    id: 'health',
    name: '헬스/의료',
    emoji: '🏥',
    description: '병원 예약, 피트니스, 건강관리',
    apps: ['굿닥'],
  },
];

type GenerateCategoryId = (typeof GENERATE_APP_CATEGORIES)[number]['id'];

const GENERATE_CATEGORY_SET = new Set<GenerateCategoryId>(
  GENERATE_APP_CATEGORIES.map((category) => category.id),
);

const CATEGORY_INFO_MAP: Record<AppCategory, CategoryInfo> = {
  fashion: { id: 'fashion', name: '패션/뷰티', emoji: '👗' },
  ecommerce: { id: 'ecommerce', name: '종합 이커머스', emoji: '🛒' },
  travel: { id: 'travel', name: '여행/숙박', emoji: '✈️' },
  mobility: { id: 'mobility', name: '모빌리티/교통', emoji: '🚕' },
  food: { id: 'food', name: 'F&B/배달', emoji: '🍔' },
  content: { id: 'content', name: '콘텐츠/엔터', emoji: '🎬' },
  game: { id: 'game', name: '게임', emoji: '🎮' },
  education: { id: 'education', name: '교육/자기계발', emoji: '📚' },
  finance: { id: 'finance', name: '금융/핀테크', emoji: '💳' },
  health: { id: 'health', name: '헬스/의료', emoji: '🏥' },
  social: { id: 'social', name: '소셜', emoji: '💬' },
  entertainment: { id: 'entertainment', name: '엔터테인먼트', emoji: '🎞️' },
  others: { id: 'others', name: '기타', emoji: '📦' },
};

// Trends/Timing tabs follow Generate categories.
export const APP_CATEGORIES: CategoryInfo[] = GENERATE_APP_CATEGORIES.map(({ id, name, emoji }) => ({
  id,
  name,
  emoji,
}));

export const FEED_CATEGORIES: FeedCategoryInfo[] = [
  { id: 'all', name: '전체', nameEn: 'All', emoji: '🧭' },
  { id: 'fashion', name: '패션', nameEn: 'Fashion', emoji: '👗' },
  { id: 'ecommerce', name: '이커머스', nameEn: 'E-commerce', emoji: '🛒' },
  { id: 'food', name: 'F&B', nameEn: 'F&B', emoji: '🍔' },
  { id: 'travel', name: '여행', nameEn: 'Travel', emoji: '✈️' },
  { id: 'mobility', name: '모빌리티', nameEn: 'Mobility', emoji: '🚕' },
  { id: 'finance', name: '금융', nameEn: 'Finance', emoji: '💳' },
  { id: 'others', name: '기타', nameEn: 'Others', emoji: '📦' },
];

export const FEED_CATEGORY_EMOJIS: Record<FeedCategoryId, string> = {
  all: '🧭',
  fashion: '👗',
  ecommerce: '🛒',
  food: '🍔',
  travel: '✈️',
  mobility: '🚕',
  finance: '💳',
  others: '📦',
};

const APP_CATEGORY_MAP: Record<string, AppCategory> = {
  // Food
  배달의민족: 'food',
  배민: 'food',
  요기요: 'food',
  쿠팡이츠: 'food',
  롯데잇츠: 'food',
  맥도날드: 'food',
  버거킹: 'food',

  // Ecommerce
  쿠팡: 'ecommerce',
  네이버: 'ecommerce',
  네이버쇼핑: 'ecommerce',
  컬리: 'ecommerce',
  '11번가': 'ecommerce',
  지마켓: 'ecommerce',
  옥션: 'ecommerce',
  오늘의집: 'ecommerce',
  번개장터: 'ecommerce',
  'N+스토어': 'ecommerce',
  N스토어: 'ecommerce',
  'N Store': 'ecommerce',

  // Fashion
  무신사: 'fashion',
  '29CM': 'fashion',
  W컨셉: 'fashion',
  지그재그: 'fashion',
  에이블리: 'fashion',
  브랜디: 'fashion',
  EQL: 'fashion',
  LookPin: 'fashion',
  '4910': 'fashion',
  화해: 'fashion',
  강남언니: 'fashion',

  // Travel
  야놀자: 'travel',
  'NOL(야놀자)': 'travel',
  여기어때: 'travel',
  에어비앤비: 'travel',
  스카이스캐너: 'travel',
  마이리얼트립: 'travel',
  KLOOK: 'travel',
  'Trip.com': 'travel',
  트리플: 'travel',

  // Mobility
  Uber: 'mobility',

  // Finance
  토스: 'finance',
  카카오뱅크: 'finance',
  뱅크샐러드: 'finance',
  케이뱅크: 'finance',
  토스뱅크: 'finance',
  페이코: 'finance',
  '페이북/ISP': 'finance',
  페이북ISP: 'finance',
  네이버페이: 'finance',

  // Content / Entertainment
  카카오페이지: 'content',
  시리즈: 'content',
  TikTok: 'content',
  틱톡: 'content',
  넷플릭스: 'entertainment',
  유튜브: 'entertainment',
  왓챠: 'entertainment',
  웨이브: 'entertainment',
  트위치: 'entertainment',
  멜론: 'entertainment',
  지니: 'entertainment',
  스포티파이: 'entertainment',

  // Game
  'Pokémon GO': 'game',
  포켓몬GO: 'game',

  // Education
  듀오링고: 'education',
  Cake: 'education',

  // Health
  굿닥: 'health',

  // Social
  당근마켓: 'social',
  인스타그램: 'social',
  페이스북: 'social',
  카카오톡: 'social',
  라인: 'social',
  텔레그램: 'social',
  밴드: 'social',
};

const CATEGORY_ALIAS_MAP: Record<string, AppCategory> = {
  entertainment: 'content',
  social: 'content',
  etc: 'others',
  other: 'others',
};

const normalizeCategoryKey = (value: string | null | undefined): string => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

export const getGenerateCategoryById = (categoryId: string | null | undefined) => {
  if (!categoryId) return undefined;
  return GENERATE_APP_CATEGORIES.find((category) => category.id === categoryId);
};

export const getAppCategory = (appName: string): AppCategory => {
  if (APP_CATEGORY_MAP[appName]) return APP_CATEGORY_MAP[appName];

  const lowerName = appName.toLowerCase();

  if (/(배달|요기요|이츠|버거|맥도날드)/.test(lowerName)) return 'food';
  if (/(쿠팡|네이버|스토어|컬리|11번가|지마켓|옥션|오늘의집|번개장터)/.test(lowerName)) return 'ecommerce';
  if (/(무신사|29cm|지그재그|에이블리|w컨셉|lookpin|eql|화해|강남언니)/.test(lowerName)) return 'fashion';
  if (/(야놀자|여기어때|airbnb|trip|klook|트리플|스카이스캐너)/.test(lowerName)) return 'travel';
  if (/(uber|택시|모빌리티)/.test(lowerName)) return 'mobility';
  if (/(토스|뱅크|페이|카드|증권|isp)/.test(lowerName)) return 'finance';
  if (/(페이지|시리즈|tiktok|틱톡|웹툰)/.test(lowerName)) return 'content';
  if (/(pok|포켓몬|game|게임)/.test(lowerName)) return 'game';
  if (/(듀오링고|cake|어학|강의)/.test(lowerName)) return 'education';
  if (/(굿닥|병원|헬스|피트니스|건강)/.test(lowerName)) return 'health';

  return 'others';
};

export const normalizeAppCategory = (rawCategory: string | null | undefined, appName: string): AppCategory => {
  const key = normalizeCategoryKey(rawCategory);

  if (GENERATE_CATEGORY_SET.has(key as GenerateCategoryId)) {
    return key as GenerateCategoryId;
  }
  if (CATEGORY_ALIAS_MAP[key]) {
    return CATEGORY_ALIAS_MAP[key];
  }
  return getAppCategory(appName);
};

export const getCategoryInfo = (categoryId: AppCategory): CategoryInfo | undefined => {
  return CATEGORY_INFO_MAP[categoryId];
};

