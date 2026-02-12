import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferenceMessage {
  title: string;
  body: string;
  hook: string;
}

interface GenerateRequest {
  appCategory: string;
  purpose: string;
  strategy: string;
  tone: string;
  productName?: string;
  keyBenefit?: string;
  referenceMessages: ReferenceMessage[];
}

// 앱 카테고리별 설명
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  fashion: '패션 앱 (의류, 신발, 스트릿웨어)',
  beauty: '뷰티 앱 (화장품, 스킨케어, 시술)',
  ecommerce: '종합 이커머스 앱 (식품, 생활용품, 가구)',
  resale: '중고/리셀 앱 (중고거래, 경매)',
  travel: '여행/숙박 앱 (항공, 호텔, 액티비티)',
  food: 'F&B/배달 앱 (음식 배달, 프랜차이즈)',
  content: '콘텐츠 앱 (웹툰, 웹소설, OTT)',
  sns: 'SNS/소셜 앱 (소셜미디어, 커뮤니티)',
  game: '게임 앱 (모바일 게임, AR 게임)',
  education: '교육/자기계발 앱 (어학, 온라인 강의)',
  finance: '금융/핀테크 앱 (은행, 결제, 투자)',
  mobility: '모빌리티 앱 (택시, 대리, 공유)',
  health: '헬스/의료 앱 (병원 예약, 피트니스)',
};

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  price: '구체적인 할인율이나 가격을 숫자로 강조',
  urgency: '시간/수량 제한으로 FOMO 유발',
  personal: '개인 행동 데이터 기반 맞춤 메시지',
  curiosity: '정보를 숨겨 클릭 유도',
  newness: '신상품/트렌드 강조',
  social_proof: '판매량/인기 순위 강조',
  benefit: '무료배송, 사은품 등 부가 혜택',
  content: '팁, 가이드, 정보성 콘텐츠',
  event: '챌린지, 출석체크, 미션 등 참여 이벤트',
  community: '좋아요, 댓글, 팔로우 등 SNS 알림',
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly: '친근하고 부드러운 말투 (~해요, ~해볼래요?)',
  urgent: '긴박하고 강조하는 말투 (지금 바로!, 마감 임박!)',
  playful: '재미있고 경쾌한 말투 (두근두근~, 열어보세요!)',
  premium: '고급스럽고 품격 있는 말투 (특별히 선보이는)',
};

// 카테고리별 목적 설명 (확장)
const PURPOSE_BY_CATEGORY: Record<string, Record<string, string>> = {
  fashion: {
    promo: '세일, 쿠폰, 특가 할인 알림',
    newproduct: '신상품, 시즌 컬렉션 출시',
    restock: '품절 상품 재입고 알림',
    retention: '장바구니, 찜한 상품 리마인드',
  },
  beauty: {
    promo: '세일, 쿠폰, 특가 알림',
    newproduct: '신제품, 한정판 출시',
    review: '인기 상품, 리뷰 랭킹',
    retention: '루틴 리마인드, 재구매',
  },
  ecommerce: {
    promo: '세일, 쿠폰, 적립금 알림',
    newproduct: '신규 입점, 새 상품 알림',
    retention: '장바구니, 찜, 재구매 유도',
    delivery: '배송 시작, 도착 예정 알림',
  },
  resale: {
    pricedrop: '관심 상품 가격 변동',
    newlisting: '관심 키워드 새 상품',
    chat: '채팅, 거래 요청 알림',
    event: '수수료 할인, 이벤트',
  },
  travel: {
    promo: '얼리버드, 땡처리 특가 항공/숙소',
    pricedrop: '관심 여행지 가격 하락 알림',
    retention: '미완료 예약, 출발 임박 리마인드',
    destination: '인기/추천 여행지 소개',
  },
  food: {
    promo: '배달비 무료, 할인 쿠폰',
    newmenu: '신메뉴, 시즌 메뉴 출시',
    retention: '자주 시킨 메뉴 재주문 유도',
    event: '콜라보, 한정 이벤트',
  },
  content: {
    newcontent: '신규 에피소드, 업데이트 알림',
    recommendation: '맞춤 추천, 인기 콘텐츠',
    retention: '중단한 콘텐츠 이어보기',
    event: '무료 이용권, 이벤트',
  },
  sns: {
    engagement: '좋아요, 댓글, 팔로우',
    trending: '인기 콘텐츠, 추천 영상',
    retention: '오랜만에 방문, 새 소식',
    live: '라이브 시작, 실시간 알림',
  },
  game: {
    event: '출석 보상, 이벤트 시작',
    energy: '스태미나 충전, 자원 회복',
    update: '새 콘텐츠, 시즌 시작',
    social: '친구 활동, 길드 알림',
  },
  education: {
    promo: '강의 할인, 프로모션',
    newcourse: '새 강의, 커리큘럼 알림',
    retention: '미완료 강의, 복습 리마인드',
    achievement: '연속 학습, 배지 획득',
  },
  finance: {
    transaction: '입출금, 결제 알림',
    benefit: '캐시백, 포인트 적립',
    product: '적금, 대출, 투자 상품',
    reminder: '납부일, 만기일 알림',
  },
  mobility: {
    promo: '탑승 할인, 첫 이용 쿠폰',
    status: '배차 완료, 도착 예정',
    suggestion: '퇴근길 추천, 자주 가는 곳',
    event: '특별 이벤트, 프로모션',
  },
  health: {
    appointment: '진료 예약, 건강검진 알림',
    activity: '걸음 수, 운동 목표 알림',
    retention: '복약 리마인드, 건강 팁',
    achievement: '목표 달성, 동기부여',
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const body: GenerateRequest = await req.json();
    const { appCategory, purpose, strategy, tone, productName, keyBenefit, referenceMessages } = body;

    // 카테고리 설명
    const categoryDesc = CATEGORY_DESCRIPTIONS[appCategory] || '일반 앱';

    // 목적 설명
    const purposeDesc = PURPOSE_BY_CATEGORY[appCategory]?.[purpose] || purpose;

    // 참고 메시지 포맷팅
    const referenceExamples = referenceMessages
      .map((m, i) => `${i + 1}. 제목: ${m.title}\n   본문: ${m.body}\n   핵심 훅: ${m.hook}`)
      .join('\n\n');

    const systemPrompt = `당신은 한국 ${categoryDesc}의 푸시 알림 메시지 전문 카피라이터입니다.
푸시 메시지 5개를 생성하되, 각 메시지는 반드시 서로 다른 길이와 스타일을 가져야 합니다.

## 5가지 메시지 스타일 (반드시 이 순서대로 생성)

### 메시지 1: 초간결형 (title 10자 이내, body 15자 이내)
- 핵심만 담은 한 줄 메시지
- 예: "오늘만 50%" / "지금 확인하세요"
- style: "ultra_short"

### 메시지 2: 직접 전달형 (title 15자, body 25자)
- 정보를 명확하게 전달
- 숫자, 혜택을 구체적으로
- style: "direct"

### 메시지 3: 공감/감성형 (title 20자, body 35자)
- 사용자 상황에 공감하는 메시지
- 일상적인 대화체
- style: "emotional"

### 메시지 4: 스토리텔링형 (title 25자, body 45자)
- 상황 묘사나 이야기가 있는 메시지
- 구체적인 시나리오 제시
- style: "story"

### 메시지 5: 호기심 유발형 (title 20자, body 30자)
- 정보를 살짝 숨겨 궁금증 유발
- 클릭하고 싶게 만드는 티저
- style: "curious"

## 앱 특성
- 카테고리: ${categoryDesc}

## 출력 규칙
1. title: 각 스타일별 글자 수 준수 (위 가이드 참고)
2. body: 각 스타일별 글자 수 준수 (위 가이드 참고)
3. hook: 핵심 마케팅 메시지 (15자 이내)
4. hookType: 요청된 전략과 동일하게
5. style: 위 5가지 중 해당 스타일

## 자연스러운 메시지 작성 원칙
- "~드립니다", "~해드려요" 같은 딱딱한 존댓말 지양
- "알려드립니다", "안내드립니다" 같은 공지 스타일 금지
- 실제 친구나 인플루언서가 말하는 것처럼
- 이모지는 꼭 필요할 때만 (과하면 스팸 느낌)
- 문장 끝 "!", "~" 남발 금지

반드시 아래 JSON 형식으로만 응답하세요:
{"messages": [{"title": "...", "body": "...", "hook": "...", "hookType": "...", "style": "ultra_short"}, {"title": "...", "body": "...", "hook": "...", "hookType": "...", "style": "direct"}, {"title": "...", "body": "...", "hook": "...", "hookType": "...", "style": "emotional"}, {"title": "...", "body": "...", "hook": "...", "hookType": "...", "style": "story"}, {"title": "...", "body": "...", "hook": "...", "hookType": "...", "style": "curious"}]}`;

    const userPrompt = `## 생성 요청
- 앱 카테고리: ${categoryDesc}
- 메시지 목적: ${purposeDesc}
- 마케팅 전략: ${STRATEGY_DESCRIPTIONS[strategy] || strategy}
- 기본 톤: ${TONE_DESCRIPTIONS[tone] || tone} (각 스타일에 맞게 변형 가능)
${productName ? `- 상품/서비스: ${productName}` : ''}
${keyBenefit ? `- 핵심 혜택: ${keyBenefit}` : ''}

## 참고할 실제 메시지 예시
${referenceExamples || '(참고 예시 없음)'}

위 정보를 바탕으로 5가지 서로 다른 길이와 스타일의 푸시 메시지를 생성해주세요.
중요: 각 메시지의 길이가 확실히 다르게! 초간결형은 정말 짧게, 스토리텔링형은 충분히 길게.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const result = JSON.parse(content);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
