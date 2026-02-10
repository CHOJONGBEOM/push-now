/**
 * 키워드 추출 및 분석 유틸리티
 * 푸시 메시지에서 마케팅 키워드를 추출하고 분류합니다
 */

// 불용어 (분석에서 제외할 단어)
const STOPWORDS = new Set([
    // 조사/접속사
    '의', '가', '이', '은', '는', '을', '를', '에', '에서', '으로', '로', '와', '과', '도', '만', '까지',
    '부터', '에게', '한테', '께', '더', '덜', '안', '못', '잘', '좀', '꼭', '약', '총', '각',
    // 대명사
    '나', '너', '저', '우리', '저희', '그', '이', '저', '것', '거', '뭐', '누구', '어디', '언제',
    // 일반 동사/형용사
    '하다', '되다', '있다', '없다', '같다', '보다', '받다', '가다', '오다', '주다', '알다',
    // 숫자/단위
    '원', '개', '건', '명', '일', '시', '분', '초', '년', '월', '주',
    // 앱/서비스 관련 일반어
    '앱', '어플', '서비스', '고객', '회원', '님', '안내', '알림', '메시지', '푸시',
    // 기타 일반어
    '수', '등', '중', '내', '외', '전', '후', '상', '하', '좌', '우',

    // ===== 법적 의무 문구 (광고 표시/수신거부 관련) =====
    '광고', '수신거부', '수신동의', '설정', '알림설정', '해제', '차단',
    '무료거부', '무료수신거부', 'off', 'on', '080',

    // ===== 앱/브랜드 이름 =====
    // 이커머스
    '쿠팡', 'coupang', '네이버', 'naver', '11번가', '지마켓', 'gmarket',
    '옥션', 'auction', '티몬', 'tmon', '위메프', 'wemakeprice',
    '마켓컬리', '컬리', 'kurly', '오늘의집', '알리', '알리익스프레스',
    // 패션
    '29cm', '29', 'cm', '무신사', 'musinsa', '지그재그', 'zigzag',
    '에이블리', 'ably', '브랜디', 'brandi', 'w컨셉', 'wconcept',
    '룩핀', 'lookpin', '4910', 'eql',
    // F&B
    '배달의민족', '배민', 'baemin', '요기요', 'yogiyo', '쿠팡이츠',
    '땡겨요', '푸드플라이',
    // 여행
    '야놀자', 'yanolja', 'nol', '여기어때', 'goodchoice',
    '에어비앤비', 'airbnb', '스카이스캐너', '마이리얼트립', 'klook',
    // 금융
    '토스', 'toss', '카카오뱅크', '뱅크샐러드', '페이코', 'payco',
    // 기타 앱
    '카카오', 'kakao', '라인', 'line', '당근', '당근마켓',

    // ===== 일반적인 시스템/UI 문구 =====
    'live', '라이브', 'now', 'app', 'play', 'store', 'click', 'link',
    'http', 'https', 'www', 'com', 'kr', 'co',
]);

// 키워드 유형 분류
export const KEYWORD_TYPES = {
    urgency: {
        name: '긴급성',
        emoji: '⏰',
        color: 'bg-red-100 text-red-700',
        keywords: ['마감', '한정', '오늘만', '라스트', '마지막', '종료', '임박', 'D-', '시간', '품절', '매진', '선착순', '단독'],
        description: '시간 제한이나 희소성을 강조하여 즉각적인 행동을 유도하는 FOMO(Fear of Missing Out) 전략'
    },
    benefit: {
        name: '혜택',
        emoji: '🎁',
        color: 'bg-green-100 text-green-700',
        keywords: ['할인', '세일', '쿠폰', '적립', '무료', '증정', '사은품', '캐시백', '포인트', '특가', '파격', '최저가', '%'],
        description: '금전적 이득을 강조하여 구매 동기를 자극하는 가격 프로모션 전략'
    },
    cta: {
        name: '행동유도',
        emoji: '👆',
        color: 'bg-blue-100 text-blue-700',
        keywords: ['지금', '바로', '확인', '클릭', '참여', '신청', '구매', '주문', '예약', '방문', '만나보세요', '놓치지'],
        description: '명확한 행동 지시어로 클릭률(CTR)을 높이는 CTA(Call-to-Action) 전략'
    },
    newness: {
        name: '신규/트렌드',
        emoji: '✨',
        color: 'bg-purple-100 text-purple-700',
        keywords: ['신상', '새로운', '출시', '런칭', '오픈', 'NEW', '첫', '최초', '트렌드', '인기', '핫한', '베스트'],
        description: '새로움과 트렌드를 강조하여 호기심과 FOMO를 자극하는 전략'
    },
    personalized: {
        name: '개인화',
        emoji: '💝',
        color: 'bg-pink-100 text-pink-700',
        keywords: ['맞춤', '추천', '좋아할', '취향', '관심', '찜', '장바구니', '최근', '자주', '즐겨'],
        description: '개인 데이터 기반 맞춤 메시지로 관련성과 전환율을 높이는 개인화 전략'
    },
} as const;

export type KeywordType = keyof typeof KEYWORD_TYPES;

// 이모지 추출 정규식
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

/**
 * 텍스트에서 이모지 추출
 */
export const extractEmojis = (text: string): string[] => {
    const matches = text.match(EMOJI_REGEX);
    return matches || [];
};

/**
 * 텍스트에서 키워드 추출 (한국어 + 영어)
 */
export const extractKeywords = (text: string): string[] => {
    if (!text) return [];

    // 이모지 제거
    let cleaned = text.replace(EMOJI_REGEX, ' ');

    // 특수문자 제거 (%, 숫자는 유지)
    cleaned = cleaned.replace(/[^\w\s가-힣%]/g, ' ');

    // 단어 분리
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2);

    // 불용어 제거 및 정규화
    const keywords = words
        .map(w => w.toLowerCase())
        .filter(w => !STOPWORDS.has(w))
        .filter(w => w.length >= 2 && w.length <= 20);

    return keywords;
};

/**
 * 키워드 유형 분류
 */
export const classifyKeywordType = (keyword: string): KeywordType | null => {
    const lowerKeyword = keyword.toLowerCase();

    for (const [type, config] of Object.entries(KEYWORD_TYPES)) {
        if (config.keywords.some(k => lowerKeyword.includes(k.toLowerCase()))) {
            return type as KeywordType;
        }
    }

    return null;
};

/**
 * 텍스트에서 키워드 유형별 개수 분석
 */
export const analyzeKeywordTypes = (text: string): Record<KeywordType, number> => {
    const result: Record<KeywordType, number> = {
        urgency: 0,
        benefit: 0,
        cta: 0,
        newness: 0,
        personalized: 0,
    };

    const lowerText = text.toLowerCase();

    for (const [type, config] of Object.entries(KEYWORD_TYPES)) {
        for (const keyword of config.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                result[type as KeywordType]++;
            }
        }
    }

    return result;
};

/**
 * 키워드 빈도 계산
 */
export const calculateKeywordFrequency = (
    messages: { title: string | null; body: string | null }[]
): Map<string, number> => {
    const frequency = new Map<string, number>();

    for (const msg of messages) {
        const text = `${msg.title || ''} ${msg.body || ''}`;
        const keywords = extractKeywords(text);

        for (const keyword of keywords) {
            frequency.set(keyword, (frequency.get(keyword) || 0) + 1);
        }
    }

    return frequency;
};

/**
 * 이모지 빈도 계산
 */
export const calculateEmojiFrequency = (
    messages: { title: string | null; body: string | null }[]
): Map<string, number> => {
    const frequency = new Map<string, number>();

    for (const msg of messages) {
        const text = `${msg.title || ''} ${msg.body || ''}`;
        const emojis = extractEmojis(text);

        for (const emoji of emojis) {
            frequency.set(emoji, (frequency.get(emoji) || 0) + 1);
        }
    }

    return frequency;
};

/**
 * 급상승 키워드 계산 (Burst Detection)
 * 최근 기간 vs 이전 기간 비교
 */
export const calculateBurstingKeywords = (
    recentFreq: Map<string, number>,
    previousFreq: Map<string, number>,
    minCount: number = 2
): Array<{ keyword: string; count: number; change: number; changePercent: number }> => {
    const results: Array<{ keyword: string; count: number; change: number; changePercent: number }> = [];

    for (const [keyword, recentCount] of recentFreq) {
        if (recentCount < minCount) continue;

        const prevCount = previousFreq.get(keyword) || 0;
        const change = recentCount - prevCount;
        const changePercent = prevCount === 0
            ? 100 // 새로 등장한 키워드
            : Math.round((change / prevCount) * 100);

        if (change > 0) {
            results.push({ keyword, count: recentCount, change, changePercent });
        }
    }

    // 증가율 기준 정렬
    return results.sort((a, b) => b.changePercent - a.changePercent);
};

/**
 * 연관 키워드 쌍 추출 (Co-occurrence)
 */
export const extractKeywordPairs = (
    messages: { title: string | null; body: string | null }[]
): Map<string, number> => {
    const pairs = new Map<string, number>();

    for (const msg of messages) {
        const text = `${msg.title || ''} ${msg.body || ''}`;
        const keywords = [...new Set(extractKeywords(text))]; // 중복 제거

        // 모든 쌍 조합
        for (let i = 0; i < keywords.length; i++) {
            for (let j = i + 1; j < keywords.length; j++) {
                // 알파벳/가나다 순 정렬하여 일관된 키 생성
                const pair = [keywords[i], keywords[j]].sort().join('::');
                pairs.set(pair, (pairs.get(pair) || 0) + 1);
            }
        }
    }

    return pairs;
};

/**
 * TF-IDF 기반 앱별 특징 키워드 추출
 */
export const calculateTfIdf = (
    keywordsByApp: Map<string, Map<string, number>>,
    targetApp: string
): Array<{ keyword: string; score: number; count: number }> => {
    const targetFreq = keywordsByApp.get(targetApp);
    if (!targetFreq) return [];

    const totalApps = keywordsByApp.size;
    const results: Array<{ keyword: string; score: number; count: number }> = [];

    // 각 키워드가 등장하는 앱 수 계산
    const documentFreq = new Map<string, number>();
    for (const [, freq] of keywordsByApp) {
        for (const keyword of freq.keys()) {
            documentFreq.set(keyword, (documentFreq.get(keyword) || 0) + 1);
        }
    }

    // TF-IDF 계산
    for (const [keyword, count] of targetFreq) {
        const tf = count;
        const df = documentFreq.get(keyword) || 1;
        const idf = Math.log(totalApps / df);
        const score = tf * idf;

        if (score > 0) {
            results.push({ keyword, score, count });
        }
    }

    return results.sort((a, b) => b.score - a.score);
};
