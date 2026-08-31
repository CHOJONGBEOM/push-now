/* ──────────────────────────────────────────────
   자동 닉네임 생성기
   수식어 (80개) × 명사 (180개) = 총 14,400가지 조합
   파스텔 컬러 팔레트 (24가지)
────────────────────────────────────────────── */

export const ADJECTIVES = [
    // 성격 & 태도
    '용감한', '수줍은', '느긋한', '엉뚱한', '당당한', '호기심많은', '친절한', '자신만만한', '다정한', '장난꾸러기',
    '꼼꼼한', '부지런한', '우직한', '열정적인', '낙천적인', '온화한', '씩씩한', '사랑스러운', '상냥한', '듬직한',
    // 외모 & 모양 & 촉감
    '거대한', '동글동글한', '통통한', '포근한', '포슬포슬한', '보들보들한', '몽글몽글한', '말랑말랑한', '뽀송뽀송한', '쪼꼬미',
    '날렵한', '길쭉길쭉한', '오동통한', '보송보송한', '푹신푹신한', '촉촉한', '매끈매끈한', '동그란', '작고소중한', '앙증맞은',
    // 분위기 & 상태 & 빛
    '반짝이는', '조용한', '눈부신', '신나는', '깜찍한', '알록달록한', '달콤한', '은은한', '화사한', '싱그러운',
    '햇살가득한', '새벽녘의', '노을빛의', '청량한', '빛나는', '상큼한', '고소한', '바람따라', '포근포근한', '생기발랄한',
    // 움직임 & 리듬
    '살랑살랑', '뭉실뭉실한', '쌩쌩한', '콩닥콩닥', '둥실둥실', '찰랑찰랑', '총총걸음의', '촐랑촐랑', '성큼성큼', '살금살금',
    '포롱포롱', '흔들흔들', '뱅글뱅글', '폴짝폴짝', '살랑이는', '두둥실', '반짝반짝', '룰루랄라', '소곤소곤', '가뿐한',
];

export const NOUNS = [
    // 🐻 동물 (포유류 & 조류 & 해양생물 & 곤충) - 60개
    '코뿔소', '고래', '문어', '미어캣', '알파카', '카피바라', '해달', '판다', '수달', '오리너구리',
    '다람쥐', '토끼', '고슴도치', '쿼카', '너구리', '펭귄', '북극곰', '아기사자', '호랑이', '사슴',
    '아기여우', '비버', '바다표범', '물범', '돌고래', '흰수염고래', '바다거북', '부엉이', '올빼미', '참새',
    '오색딱따구리', '플라밍고', '펠리컨', '아기오리', '뱁새', '파랑새', '벌새', '코알라', '나무늘보', '레서판다',
    '친칠라', '사막여우', '하프물범', '벨루가', '매너티', '바다사자', '해마', '해파리', '가오리', '클라운피쉬',
    '꿀벌', '나비', '무당벌레', '반딧불이', '달팽이', '소라게', '카멜레온', '도마뱀붙이', '하늘다람쥐', '날다람쥐',

    // 🌿 식물 & 꽃 & 자연 - 45개
    '민들레', '선인장', '해바라기', '클로버', '고사리', '라벤더', '튤립', '물망초', '동백꽃', '억새',
    '코스모스', '수국', '안개꽃', '개나리', '벚꽃', '목련', '연꽃', '프리지아', '유칼립투스', '몬스테라',
    '바질', '로즈마리', '애플민트', '올리브나무', '자작나무', '은행잎', '단풍잎', '솔방울', '도토리', '버섯',
    '뭉게구름', '무지개', '새벽이슬', '초승달', '별똥별', '은하수', '바람개비', '바다안개', '햇살한조각', '여름소나기',
    '봄바람', '단비', '눈송이', '이슬방울', '산들바람',

    // 🥐 빵 & 디저트 & 베이커리 - 45개
    '크루아상', '머핀', '마카롱', '도넛', '바게트', '와플', '몽블랑', '타르트', '에클레어', '카눌레',
    '소금빵', '베이글', '스콘', '마들렌', '휘낭시에', '식빵', '모카빵', '단팥빵', '메론빵', '프레첼',
    '팬케이크', '수플레', '치즈케이크', '티라미수', '푸딩', '파르페', '젤라또', '아이스크림', '롤케이크', '도라야키',
    '찹쌀떡', '약과', '마시멜로', '초콜릿', '츄러스', '버블티', '라떼', '달고나', '솜사탕', '붕어빵',
    '호떡', '슈크림', '까눌레', '다쿠아즈', '파운드케이크',

    // 🍎 과일 & 채소 & 귀여운 음식 - 30개
    '딸기', '복숭아', '청포도', '블루베리', '망고', '아보카도', '체리', '귤', '한라봉', '자두',
    '무화과', '살구', '유자', '레몬', '라임', '토마토', '방울토마토', '당근', '옥수수', '고구마',
    '밤', '호두', '피스타치오', '도토리묵', '주먹밥', '유부초밥', '오므라이스', '만두', '타코야키', '달걀말이',
];

/** 총 조합 수 계산 */
export const TOTAL_COMBINATIONS = ADJECTIVES.length * NOUNS.length; // 80 * 180 = 14,400

/** 랜덤 닉네임 반환 */
export function generateNickname(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
}

/** 48가지 세련된 파스텔 & 소프트 뱃지 컬러 팔레트 (2배 확장) */
export const PASTEL_COLORS = [
    // 🌸 로즈 & 체리 계열 (5종)
    'bg-rose-100/90 text-rose-700 border border-rose-200/70',
    'bg-rose-50 text-rose-800 border border-rose-200/80',
    'bg-red-100/80 text-red-700 border border-red-200/70',
    'bg-red-50 text-red-800 border border-red-200/80',
    'bg-rose-200/70 text-rose-900 border border-rose-300/80',

    // 💖 핑크 & 마젠타 계열 (5종)
    'bg-pink-100/90 text-pink-700 border border-pink-200/70',
    'bg-pink-50 text-pink-800 border border-pink-200/80',
    'bg-fuchsia-100/90 text-fuchsia-700 border border-fuchsia-200/70',
    'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200/80',
    'bg-pink-200/70 text-pink-900 border border-pink-300/80',

    // 💜 퍼플 & 바이올렛 계열 (5종)
    'bg-purple-100/90 text-purple-700 border border-purple-200/70',
    'bg-purple-50 text-purple-800 border border-purple-200/80',
    'bg-violet-100/90 text-violet-700 border border-violet-200/70',
    'bg-violet-50 text-violet-800 border border-violet-200/80',
    'bg-purple-200/70 text-purple-900 border border-purple-300/80',

    // 💙 인디고 & 블루 계열 (5종)
    'bg-indigo-100/90 text-indigo-700 border border-indigo-200/70',
    'bg-indigo-50 text-indigo-800 border border-indigo-200/80',
    'bg-blue-100/90 text-blue-700 border border-blue-200/70',
    'bg-blue-50 text-blue-800 border border-blue-200/80',
    'bg-blue-200/70 text-blue-900 border border-blue-300/80',

    // 🩵 스카이 & 시안 계열 (5종)
    'bg-sky-100/90 text-sky-700 border border-sky-200/70',
    'bg-sky-50 text-sky-800 border border-sky-200/80',
    'bg-cyan-100/90 text-cyan-700 border border-cyan-200/70',
    'bg-cyan-50 text-cyan-800 border border-cyan-200/80',
    'bg-sky-200/70 text-sky-900 border border-sky-300/80',

    // 🌿 틸 & 에메랄드 계열 (5종)
    'bg-teal-100/90 text-teal-700 border border-teal-200/70',
    'bg-teal-50 text-teal-800 border border-teal-200/80',
    'bg-emerald-100/90 text-emerald-700 border border-emerald-200/70',
    'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    'bg-emerald-200/70 text-emerald-900 border border-emerald-300/80',

    // 🍃 그린 & 민트 & 라임 계열 (5종)
    'bg-green-100/90 text-green-700 border border-green-200/70',
    'bg-green-50 text-green-800 border border-green-200/80',
    'bg-lime-100/90 text-lime-700 border border-lime-200/70',
    'bg-lime-50 text-lime-800 border border-lime-200/80',
    'bg-green-200/70 text-green-900 border border-green-300/80',

    // 🍯 옐로우 & 앰버 & 오렌지 계열 (6종)
    'bg-yellow-100/90 text-yellow-800 border border-yellow-200/70',
    'bg-yellow-50 text-yellow-900 border border-yellow-200/80',
    'bg-amber-100/90 text-amber-700 border border-amber-200/70',
    'bg-amber-50 text-amber-900 border border-amber-200/80',
    'bg-orange-100/90 text-orange-700 border border-orange-200/70',
    'bg-orange-50 text-orange-800 border border-orange-200/80',

    // 🪨 모던 뉴트럴 & 어스 톤 (4종)
    'bg-slate-100 text-slate-700 border border-slate-200/70',
    'bg-zinc-100 text-zinc-700 border border-zinc-200/70',
    'bg-stone-100 text-stone-700 border border-stone-200/70',
    'bg-gray-100 text-gray-800 border border-gray-200/80',

    // ✨ 스페셜 믹스 듀오톤 (3종)
    'bg-violet-50 text-indigo-900 border border-violet-200/80',
    'bg-rose-50 text-pink-900 border border-rose-200/80',
    'bg-emerald-50 text-teal-900 border border-emerald-200/80',
];

/** 닉네임 문자열의 해시값으로 일관된 고유 컬러 반환 */
export function getNicknameColor(nickname: string): string {
    let hash = 0;
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

