import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANGLE_ORDER = ["direct", "situation", "question", "emotional", "cta", "creative"] as const;
type Angle = typeof ANGLE_ORDER[number];
const TITLE_MAX_CHARS = 32;
const BODY_MAX_CHARS = 72;

interface ReferenceMessage {
  title?: string;
  body?: string;
  hook?: string;
}

interface GeneratedMessage {
  title?: string;
  body?: string;
  hook?: string;
  hookType?: string;
  angle?: string;
}

interface GenerateRequest {
  appCategory: string;
  purpose: string;
  strategy: string;
  tone: string;
  productName?: string;
  keyBenefit?: string;
  targetAudience?: string;
  referenceMessages?: ReferenceMessage[];
  styleMessages?: ReferenceMessage[];
  previousMessages?: GeneratedMessage[];
  generationNonce?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  fashion: "패션/뷰티",
  ecommerce: "이커머스",
  travel: "여행/숙박",
  mobility: "모빌리티/교통",
  food: "F&B/배달",
  content: "콘텐츠/엔터",
  game: "게임",
  education: "교육",
  finance: "금융",
  health: "헬스/의료",
};

const PURPOSE_LABELS: Record<string, string> = {
  promo: "혜택/특가 알림",
  news: "신상/소식 알림",
  recovery: "복귀 유도",
  value: "정보/가치 제공",
};

const STRATEGY_LABELS: Record<string, string> = {
  price: "가격/할인 강조",
  urgency: "긴박감/시간제한",
  personal: "개인 맞춤",
  curiosity: "호기심 유발",
  newness: "신상품/트렌드",
  social_proof: "인기/후기",
  benefit: "부가 혜택",
  content: "정보성 콘텐츠",
  event: "이벤트/참여",
  community: "SNS/커뮤니티",
};

const TONE_LABELS: Record<string, string> = {
  friendly: "친근하고 공감하는",
  direct: "간결하고 명확한",
  witty: "재치있고 유머러스한",
  polite: "정중하고 신뢰감 있는",
};

const TONE_RULES: Record<string, string> = {
  friendly: `
- 말투: 친한 지인에게 말하듯 편안한 존댓말 (~해요, ~하셨죠?, ~인가요?)
- 특징: 공감형 어휘(오늘도 고생했어요, 딱 맞아요, 기분 좋게)를 자연스럽게 사용
- 금지: 딱딱한 공지문 톤, 과도한 사무적 종결`,
  direct: `
- 말투: 속보처럼 건조하고 짧은 존댓말
- 특징: 미사여구 제거, 핵심 정보와 조건 먼저
- 금지: 길게 설명하는 문장, 감성 수사 남발`,
  witty: `
- 말투: 가벼운 재치가 있는 존댓말
- 특징: 피식 웃는 반전/언어유희 포인트 1개 포함
- 금지: 저급한 밈, 뜬금없는 개그`,
  polite: `
- 말투: 백화점 컨시어지처럼 정중한 존댓말 (~드립니다, ~하시겠습니까?)
- 느낌: 압박보다 신뢰와 배려 중심
- 주의: 장황한 설명형 문장 금지, 짧고 단정하게 전달
- 금지: 저렴한 표현, 느낌표 남발`,
};
const STRATEGY_IDS = Object.keys(STRATEGY_LABELS);
const TONE_IDS = Object.keys(TONE_LABELS);

const COPYWRITING_ANGLES = `
각 angle은 아래 공식을 우선 적용하세요.
1) direct: [핵심 혜택/조건] + [제약/기한]
2) situation: [구체적 TPO 한 장면] + [혜택 연결]
3) question: [의외성/손실회피] + [질문]
4) emotional: [사용자 기분 묘사] + [따뜻한 제안]
5) cta: [행동 이유] + [짧은 행동 유도]
6) creative: 1~5의 틀을 깨는 변주(반전/낯선 관점/짧은 드립 허용)
`;

const REPETITIVE_SITUATION_PATTERNS = [
  /지금\s*쇼핑\s*중/i,
  /쇼핑\s*중이신가요/i,
  /지금\s*장바구니/i,
];

const CLICHE_PATTERNS = [
  /특별한 혜택/iu,
  /놓치지\s*마세요/iu,
  /지금\s*바로/iu,
  /서둘러/iu,
  /지금\s*확인/iu,
  /할인\s*혜택/iu,
  /마감\s*임박/iu,
  /회원님만을?\s*위한/iu,
  /원하는\s*상품/iu,
  /혜택을\s*확인/iu,
];

const FALLBACK_CONTEXTS = [
  "출근 전",
  "퇴근길",
  "점심시간",
  "주말 저녁",
  "연휴 전",
  "월말",
];


function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clipChars(value: string, maxChars: number): string {
  const chars = Array.from(value);
  return chars.length <= maxChars ? value : chars.slice(0, maxChars).join("");
}

function smartClip(value: string, maxChars: number): string {
  const chars = Array.from(value);
  if (chars.length <= maxChars) return value;
  const sliced = chars.slice(0, maxChars).join("");
  const pivot = Math.max(
    sliced.lastIndexOf(" "),
    sliced.lastIndexOf("."),
    sliced.lastIndexOf("!"),
    sliced.lastIndexOf("?"),
    sliced.lastIndexOf(","),
  );
  if (pivot >= 10) return sliced.slice(0, pivot).trim();
  return sliced.trim();
}

function hasNaturalEnding(text: string): boolean {
  return /(요|죠|니다|습니다|세요|랍니다|돼요|해요|합니다|됩니다)[.!?]?$/u.test(text.trim());
}

function cleanCoreMessage(value: string): string {
  let t = String(value ?? "").replace(/\r/g, "").trim();
  t = t.replace(/^\s*[\[(]?(?:\uAD11\uACE0|AD)[\])]?\s*[:：-]?\s*/iu, "");
  t = t.replace(/\n\s*(?:\uC218\uC2E0\s*\uAC70\uBD80|\uBB34\uB8CC\s*\uC218\uC2E0\s*\uAC70\uBD80|\uBB38\uC758\s*[:：]|거부\s*[:：]|OFF).*$/isu, "");
  t = t.replace(/\s*(?:\uC218\uC2E0\s*\uAC70\uBD80|\uBB34\uB8CC\s*\uC218\uC2E0\s*\uAC70\uBD80|\uBB38\uC758\s*[:：]|거부\s*[:：]|OFF).*$/isu, "");
  t = t.replace(/[\[*]+$/g, "").replace(/[>]+$/g, "").trim();
  return t.replace(/\s+/g, " ").trim();
}

function ensureCompleteSentence(value: string, tone: string): string {
  const t = value.trim();
  if (!t) return t;
  if (/[.!?]$/.test(t)) return t;
  if (hasNaturalEnding(t) || /(까요)$/u.test(t)) return `${t}.`;
  return `${t}.`;
}

function sanitizeReferenceMessages(input: ReferenceMessage[] | undefined): ReferenceMessage[] {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .slice(0, 20)
    .map((m) => ({
      title: clipChars(cleanCoreMessage(asString(m?.title)), 42),
      body: clipChars(cleanCoreMessage(asString(m?.body)), 100),
      hook: clipChars(asString(m?.hook), 24),
    }))
    .filter((m) => m.title || m.body || m.hook);
}

function sanitizePreviousMessages(input: GeneratedMessage[] | undefined): GeneratedMessage[] {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .slice(0, 12)
    .map((m) => ({
      title: clipChars(cleanCoreMessage(asString(m?.title)), 40),
      body: clipChars(cleanCoreMessage(asString(m?.body)), 90),
      angle: asString(m?.angle).toLowerCase(),
    }))
    .filter((m) => m.title || m.body);
}

function sanitizeStyleMessages(input: ReferenceMessage[] | undefined): ReferenceMessage[] {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .slice(0, 120)
    .map((m) => ({
      title: clipChars(cleanCoreMessage(asString(m?.title)), 36),
      body: clipChars(cleanCoreMessage(asString(m?.body)), 72),
      hook: clipChars(asString(m?.hook), 24),
    }))
    .filter((m) => m.title || m.body);
}

function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalizeForCompare(text).split(" ").filter((w) => w.length >= 2);
}

function jaccard(a: string, b: string): number {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function pickVariationHint(seed: string): string {
  const hints = [
    "이번 생성은 정보 전달형으로 간결하게 작성",
    "이번 생성은 공감 문장을 앞에 배치",
    "이번 생성은 질문형 비율을 줄이고 설명형 강화",
    "이번 생성은 동사 표현을 다양하게 바꾸기",
    "이번 생성은 같은 긴급 단어 반복 피하기",
    "이번 생성은 부드러운 존댓말 중심으로 작성",
  ];
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hints[hash % hints.length];
}

function pickBySeed(items: string[], seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return items[hash % items.length];
}

function pickDifferentBySeed(items: string[], seed: string, exclude: string): string {
  if (items.length === 0) return exclude;
  const picked = pickBySeed(items, seed);
  if (picked !== exclude || items.length === 1) return picked;
  const idx = items.indexOf(picked);
  return items[(idx + 1) % items.length];
}

function extractFirstGeneratedMessage(result: unknown): GeneratedMessage {
  const obj = result as { messages?: GeneratedMessage[]; message?: GeneratedMessage } | undefined;
  if (Array.isArray(obj?.messages) && obj.messages.length > 0) {
    const creative = obj.messages.find((m) => asString(m?.angle).toLowerCase() === "creative");
    return creative || obj.messages[0];
  }
  if (obj?.message && typeof obj.message === "object") return obj.message;
  return {};
}

function extractSituationContexts(referenceMessages: ReferenceMessage[]): string[] {
  const source = referenceMessages
    .map((m) => `${m.title || ""} ${m.body || ""}`)
    .join(" ");

  const patterns = [
    /([가-힣A-Za-z0-9]{2,10}(?:출근길|퇴근길|점심시간|아침|저녁|밤|주말|평일|월말|월초))/g,
    /((?:봄|여름|가을|겨울)(?:\s*시즌|\s*날씨)?)/g,
    /((?:벚꽃|꽃샘추위|미세먼지|황사|장마|한파|폭염|비 오는 날|눈 오는 날))/g,
    /((?:설날|추석|화이트데이|크리스마스|블랙프라이데이|연휴))/g,
  ];

  const out: string[] = [];
  for (const re of patterns) {
    for (const match of source.matchAll(re)) {
      const token = (match[1] || "").trim();
      if (!token) continue;
      if (!out.includes(token)) out.push(token);
    }
  }
  return out.slice(0, 20);
}

function buildSituationContextPool(referenceMessages: ReferenceMessage[]): string[] {
  const dynamic = extractSituationContexts(referenceMessages);
  const merged = [...dynamic, ...FALLBACK_CONTEXTS];
  return merged.filter((v, i) => merged.indexOf(v) === i);
}

function buildStyleBaseSection(styleMessages: ReferenceMessage[], fallbackMessages: ReferenceMessage[]): string {
  const source = styleMessages.length > 0 ? styleMessages : fallbackMessages;
  if (source.length === 0) return "## DB 스타일 베이스\n- 데이터 없음";

  const titles = source.map((m) => asString(m.title)).filter(Boolean);
  const bodies = source.map((m) => asString(m.body)).filter(Boolean);
  const avgTitle = Math.round(titles.reduce((acc, t) => acc + Array.from(t).length, 0) / Math.max(titles.length, 1));
  const avgBody = Math.round(bodies.reduce((acc, b) => acc + Array.from(b).length, 0) / Math.max(bodies.length, 1));

  const openerFreq = new Map<string, number>();
  for (const b of bodies) {
    const opener = b.split(/\s+/).slice(0, 2).join(" ").trim();
    if (!opener) continue;
    openerFreq.set(opener, (openerFreq.get(opener) || 0) + 1);
  }
  const topOpeners = [...openerFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);

  const endingFreq = new Map<string, number>();
  for (const b of bodies) {
    const m = b.match(/(요|죠|니다|습니다|세요|까요)\.?$/u);
    if (!m) continue;
    endingFreq.set(m[1], (endingFreq.get(m[1]) || 0) + 1);
  }
  const topEndings = [...endingFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  const emojiFreq = new Map<string, number>();
  for (const line of [...titles, ...bodies]) {
    const matches = line.match(/\p{Extended_Pictographic}/gu) || [];
    for (const e of matches) emojiFreq.set(e, (emojiFreq.get(e) || 0) + 1);
  }
  const topEmojis = [...emojiFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([e]) => e);

  const sampleLines = source
    .slice(0, 10)
    .map((m, i) => `${i + 1}. "${m.title || "-"}" / "${m.body || "-"}"`);

  return `## DB 스타일 베이스(자동 추출)
- 코퍼스 크기: ${source.length}
- 평균 길이: 제목 ${avgTitle}자 / 본문 ${avgBody}자
- 자주 쓰는 시작 리듬: ${topOpeners.join(" | ") || "-"}
- 자주 쓰는 어미: ${topEndings.join(", ") || "-"}
- 자주 쓰는 이모지: ${topEmojis.join(" ") || "(거의 없음)"}
- 샘플:
${sampleLines.join("\n")}`;
}

function normalizeMessage(
  raw: GeneratedMessage,
  angle: Angle,
  strategy: string,
  tone: string,
): Required<GeneratedMessage> {
  const titleRaw = cleanCoreMessage(asString(raw?.title));
  const bodyRaw = cleanCoreMessage(asString(raw?.body));

  const title = smartClip(titleRaw, TITLE_MAX_CHARS) || "지금 확인해보세요";
  const body = ensureCompleteSentence(smartClip(bodyRaw, BODY_MAX_CHARS) || "내 정보와 혜택을 확인해보세요.", tone);
  const hook = clipChars(asString(raw?.hook), 14) || "핵심 안내";

  return { title, body, hook, hookType: strategy, angle };
}

function normalizeResult(result: unknown, strategy: string, tone: string) {
  const input = (result as { messages?: GeneratedMessage[] })?.messages;
  const messages = Array.isArray(input) ? input : [];

  const usedIndexes = new Set<number>();
  const ordered = ANGLE_ORDER.map((angle) => {
    const byAngleIndex = messages.findIndex((m, idx) => !usedIndexes.has(idx) && asString(m?.angle).toLowerCase() === angle);
    if (byAngleIndex !== -1) {
      usedIndexes.add(byAngleIndex);
      return normalizeMessage(messages[byAngleIndex], angle, strategy, tone);
    }
    const fallbackIndex = messages.findIndex((_, idx) => !usedIndexes.has(idx));
    if (fallbackIndex !== -1) {
      usedIndexes.add(fallbackIndex);
      return normalizeMessage(messages[fallbackIndex], angle, strategy, tone);
    }
    return normalizeMessage({}, angle, strategy, tone);
  });

  const seen = new Set<string>();
  const deduped = ordered.map((m) => {
    const key = `${normalizeForCompare(m.title)}__${normalizeForCompare(m.body)}`;
    if (!seen.has(key)) {
      seen.add(key);
      return m;
    }
    const adjusted = { ...m, title: smartClip(`${m.title} 새안`, 26) };
    seen.add(`${normalizeForCompare(adjusted.title)}__${normalizeForCompare(adjusted.body)}`);
    return adjusted;
  });

  return { messages: deduped };
}

function applyHouseStyle(
  messages: Required<GeneratedMessage>[],
  tone: string,
  creativeTone?: string,
): Required<GeneratedMessage>[] {
  return messages.map((m, idx) => {
    const title = smartClip(m.title.replace(/\s{2,}/g, " ").trim(), TITLE_MAX_CHARS);
    const rawBody = smartClip(m.body.replace(/\s{2,}/g, " ").trim(), BODY_MAX_CHARS);
    const effectiveTone = m.angle === "creative" && creativeTone ? creativeTone : tone;
    const body = ensureCompleteSentence(rawBody, effectiveTone);
    return {
      ...m,
      title: title || "지금 확인해보세요",
      body: body || "내 정보와 혜택을 확인해보세요.",
    };
  });
}

function softenSituationRepetition(
  messages: Required<GeneratedMessage>[],
  generationNonce: string,
  tone: string,
  contextPool: string[],
): Required<GeneratedMessage>[] {
  return messages.map((m) => {
    if (m.angle !== "situation") return m;
    const combined = `${m.title} ${m.body}`;
    const isRepetitive = REPETITIVE_SITUATION_PATTERNS.some((re) => re.test(combined));
    if (!isRepetitive) return m;
    const fallback = pickBySeed(contextPool, generationNonce);
    const patchedTitle = smartClip(`${fallback}에 확인해보세요`, 26);
    const patchedBody = ensureCompleteSentence(
      smartClip(`${fallback}에 맞춰 혜택을 확인하시면 더 편하게 선택하실 수 있어요.`, 56),
      tone,
    );
    return { ...m, title: patchedTitle, body: patchedBody };
  });
}

function shouldRetryForDiversity(current: Required<GeneratedMessage>[], previous: GeneratedMessage[]): boolean {
  if (previous.length === 0) return false;
  const prevTexts = previous.map((m) => `${m.title || ""} ${m.body || ""}`.trim()).filter(Boolean);
  const curTexts = current.map((m) => `${m.title} ${m.body}`);

  let tooSimilarCount = 0;
  for (const c of curTexts) {
    let maxSim = 0;
    for (const p of prevTexts) maxSim = Math.max(maxSim, jaccard(c, p));
    if (maxSim >= 0.72) tooSimilarCount++;
  }
  return tooSimilarCount >= 2;
}

function shouldRetryForLengthVariance(messages: Required<GeneratedMessage>[]): boolean {
  const base = messages.slice(0, 5);
  if (base.length < 5) return false;
  const lengths = base.map((m) => Array.from(m.body.trim()).length);
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  const spread = maxLen - minLen;
  const buckets = new Set(lengths.map((len) => (len <= 26 ? "short" : len <= 44 ? "mid" : "long")));
  return spread < 12 || buckets.size < 3;
}

function shouldRetryForCliche(messages: Required<GeneratedMessage>[]): boolean {
  const base = messages.slice(0, 6);
  if (base.length === 0) return false;

  let clicheHits = 0;
  const openers = new Set<string>();

  for (const m of base) {
    const text = `${m.title} ${m.body}`.trim();
    for (const re of CLICHE_PATTERNS) {
      if (re.test(text)) clicheHits++;
    }
    const opener = m.body.trim().split(/\s+/).slice(0, 2).join(" ");
    if (opener) openers.add(opener);
  }

  const openerDiversityLow = openers.size <= 3;
  return clicheHits >= 6 || openerDiversityLow;
}

async function callModel(systemPrompt: string, userPrompt: string, temperature: number) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in OpenAI response");
  return JSON.parse(content);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

    const body: GenerateRequest = await req.json();
    const appCategory = asString(body?.appCategory);
    const purpose = asString(body?.purpose);
    const strategy = asString(body?.strategy);
    const tone = asString(body?.tone);
    const productName = asString(body?.productName);
    const keyBenefit = asString(body?.keyBenefit);
    const targetAudience = asString(body?.targetAudience);
    const referenceMessages = sanitizeReferenceMessages(body?.referenceMessages);
    const styleMessages = sanitizeStyleMessages(body?.styleMessages);
    const previousMessages = sanitizePreviousMessages(body?.previousMessages);
    const generationNonce = asString(body?.generationNonce) || crypto.randomUUID();

    if (!appCategory || !purpose || !strategy || !tone) {
      return new Response(
        JSON.stringify({ error: "appCategory, purpose, strategy, tone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const categoryLabel = CATEGORY_LABELS[appCategory] || appCategory;
    const purposeLabel = PURPOSE_LABELS[purpose] || purpose;
    const strategyLabel = STRATEGY_LABELS[strategy] || strategy;
    const toneLabel = TONE_LABELS[tone] || tone;
    const toneRules = TONE_RULES[tone] || "- 말투: 자연스럽고 완결된 존댓말";
    const variationHint = pickVariationHint(generationNonce);
    const contextPool = buildSituationContextPool(referenceMessages);
    const styleBaseSection = buildStyleBaseSection(styleMessages, referenceMessages);
    const randomCreativeStrategy = pickDifferentBySeed(STRATEGY_IDS, `${generationNonce}-creative-strategy`, strategy);
    const randomCreativeTone = pickDifferentBySeed(TONE_IDS, `${generationNonce}-creative-tone`, tone);

    const referenceSection = referenceMessages.length > 0
      ? `## 참고 메시지
${referenceMessages.map((m, i) => `${i + 1}. 제목: "${m.title || "-"}" / 본문: "${m.body || "-"}" / 핵심: "${m.hook || "-"}"`).join("\n")}`
      : "## 참고 메시지 없음";

    const previousSection = previousMessages.length > 0
      ? `## 직전 생성 결과 (이번에는 유사 문장 회피)
${previousMessages.map((m, i) => `${i + 1}. [${m.angle || "unknown"}] "${m.title || "-"}" / "${m.body || "-"}"`).join("\n")}`
      : "## 직전 생성 결과 없음";

    const contextHintSection = `## 상황 맥락 힌트(동적 추출)
${contextPool.slice(0, 12).map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

    const systemPrompt = `당신은 한국 모바일 앱 푸시 카피라이터다.
실전 서비스에 바로 쓸 수 있는 자연스러운 문장을 만든다.

## 요청 정보
- 앱 카테고리: ${categoryLabel}
- 메시지 목적: ${purposeLabel}
- 전략: ${strategyLabel}
- 톤: ${toneLabel}
${targetAudience ? `- 타겟: ${targetAudience}` : "- 타겟: 일반 사용자"}
${productName ? `- 상품/서비스: ${productName}` : "- 상품/서비스: 일반 상품/서비스"}
${keyBenefit ? `- 핵심 혜택: ${keyBenefit}` : "- 핵심 혜택: 일반 혜택"}

## 톤 가이드
${toneRules}

${referenceSection}
${previousSection}
${contextHintSection}
${styleBaseSection}

${COPYWRITING_ANGLES}

## 스타일 원칙
1. 6개 angle을 모두 생성하되, 문장 뼈대가 서로 달라 보이게 작성
2. 모든 톤에서 기본 존댓말 유지 (반말 금지)
3. 1~5는 톤 일관성 유지, 6(creative)은 새로운 관점 허용
4. 사실로 주어지지 않은 숫자/근거를 만들지 말 것
5. 핵심 메시지 기준 길이감: 제목 10~24자, 본문 24~52자
6. 길이 변주를 반드시 섞을 것: 6개 중 최소 2개는 짧게, 최소 2개는 길게 작성
7. 잘린 문장 금지: 문장 끝은 완결형으로 작성
8. 재생성 시 직전 결과와 의미/어휘 유사 문장 피하기
9. situation은 "지금 쇼핑 중이신가요" 같은 고정 오프너 반복 금지 (다른 맥락으로 변주)
10. 변주 힌트: ${variationHint}
11. polite 톤은 설명을 길게 붙이지 말고 한 문장 중심으로 간결하게 작성
12. 시스템 알림체/관공서 안내문 톤 금지 ("확인 바랍니다", "특별한 혜택" 같은 상투어 남발 금지)
13. 각 메시지에 미세한 카피 킥 1개 포함: 의외의 동사, 감각어, 짧은 대비 표현 중 하나
14. 참고 메시지의 말투/리듬/단어 선택을 적극 반영 (문장 복붙 금지)
15. 이모지는 과하지 않게 사용: 6개 중 2~3개 제목에만 자연스럽게 포함

## 강력 금지 사항 (Red Lines)
1. "확인해보세요/확인하세요"로만 끝나는 단조로운 문장 반복 금지
2. "특별한 혜택/좋은 상품" 같은 추상어 남발 금지 (구체적 이득/상황 제시)
3. 이유 없이 "서두르세요/놓치지 마세요"만 반복 금지 (왜 지금인지 근거 제시)
4. 번역투/공지문 톤 금지 (사람이 쓴 카피처럼 작성)

## 작성 팁 (Human Touch)
- 장면부터 시작하세요: "퇴근길", "주말 밤", "비 오는 아침"처럼
- 정보 전달만 하지 말고, 소비자가 얻는 기분/이득을 한 번 더 연결
- 시작 문장 리듬을 매번 바꿔서 같은 사람이 쓴 것처럼 보이지 않게 작성

## 출력 형식
JSON 객체만 출력:
{
  "messages": [
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"direct"},
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"situation"},
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"question"},
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"emotional"},
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"cta"},
    {"title":"...", "body":"...", "hook":"...", "hookType":"${strategy}", "angle":"creative"}
  ]
}`;

    const userPrompt = `위 조건으로 6개 메시지를 생성하세요.
- 기계적인 템플릿 문장 금지
- 각 angle이 서로 다르게 느껴지게 작성
- 1~5에서 같은 관용구를 반복하지 말 것
- 같은 세트 안에서 길이가 비슷해지지 않게, 짧은 문장과 긴 문장을 섞어 작성
- situation은 시간/계절/날씨/이벤트 맥락 중 하나를 넣어 작성
- "특별한 혜택/지금 바로/서둘러/놓치지 마세요" 같은 상투구 반복 금지
- 각 메시지마다 카피 포인트(표현의 킥)를 1개씩 넣어 작성
- 잘린 문장 없이 끝까지 완결형으로 작성
- JSON 외 텍스트는 출력하지 마세요.`;

    let parsed: unknown = await callModel(systemPrompt, userPrompt, 0.9);
    let result = normalizeResult(parsed, strategy, tone);
    result.messages = applyHouseStyle(result.messages, tone, randomCreativeTone);
    result.messages = softenSituationRepetition(result.messages, generationNonce, tone, contextPool);

    if (
      shouldRetryForDiversity(result.messages, previousMessages) ||
      shouldRetryForLengthVariance(result.messages) ||
      shouldRetryForCliche(result.messages)
    ) {
      const retryPrompt = `${userPrompt}

재생성 지시:
- 직전 생성과 유사도가 높습니다.
- 같은 어휘(지금 확인, 놓치지 마세요, 마지막 기회, 서두르세요) 반복을 줄이세요.
- 문장 시작/끝 패턴을 바꿔서 다시 작성하세요.
- 1~5 길이 분포를 섞되, 특정 순서(위는 짧고 아래는 길게)로 고정하지 마세요.
- 시스템 알림체를 피하고, 각 메시지에 표현의 킥(의외성)을 반드시 1개 넣으세요.`;
      parsed = await callModel(systemPrompt, retryPrompt, 1.0);
      result = normalizeResult(parsed, strategy, tone);
      result.messages = applyHouseStyle(result.messages, tone, randomCreativeTone);
      result.messages = softenSituationRepetition(result.messages, generationNonce, tone, contextPool);
    }

    const randomStrategyLabel = STRATEGY_LABELS[randomCreativeStrategy] || randomCreativeStrategy;
    const randomToneLabel = TONE_LABELS[randomCreativeTone] || randomCreativeTone;
    const randomToneRules = TONE_RULES[randomCreativeTone] || "- 말투: 자연스럽고 완결된 존댓말";
    const creativeSystemPrompt = `당신은 한국 모바일 앱 푸시 카피라이터다.
실전 서비스에 바로 쓸 수 있는 자연스러운 문장을 만든다.

## 요청 정보
- 앱 카테고리: ${categoryLabel}
- 메시지 목적: ${purposeLabel}
- 전략: ${randomStrategyLabel}
- 톤: ${randomToneLabel}
${targetAudience ? `- 타겟: ${targetAudience}` : "- 타겟: 일반 사용자"}
${productName ? `- 상품/서비스: ${productName}` : "- 상품/서비스: 일반 상품/서비스"}
${keyBenefit ? `- 핵심 혜택: ${keyBenefit}` : "- 핵심 혜택: 일반 혜택"}

## 톤 가이드
${randomToneRules}

## 작성 지시
- angle은 creative 한 개만 작성
- 기존 1~5와 문장 시작/전개를 다르게 작성
- 고정 템플릿 문장 금지
- 잘린 문장 금지

## 출력 형식
JSON 객체만 출력:
{
  "messages": [
    {"title":"...", "body":"...", "hook":"...", "hookType":"${randomCreativeStrategy}", "angle":"creative"}
  ]
}`;
    const creativeUserPrompt = `creative 메시지 1개를 생성하세요.
- 이번 메시지는 랜덤 전략/랜덤 톤으로 작성합니다.
- 시스템 공지문처럼 밋밋한 표현 금지, 짧은 의외성 1개를 넣어주세요.
- JSON 외 텍스트는 출력하지 마세요.`;
    const creativeParsed = await callModel(creativeSystemPrompt, creativeUserPrompt, 1.0);
    const creativeRaw = extractFirstGeneratedMessage(creativeParsed);
    const creativeMessage = normalizeMessage(creativeRaw, "creative", randomCreativeStrategy, randomCreativeTone);
    result.messages = result.messages.map((m) => (m.angle === "creative" ? creativeMessage : m));
    result.messages = applyHouseStyle(result.messages, tone, randomCreativeTone);
    result.messages = softenSituationRepetition(result.messages, generationNonce, tone, contextPool);

    if (previousMessages.length > 0) {
      const prevSet = new Set(previousMessages.map((m) => normalizeForCompare(`${m.title} ${m.body}`)));
      result.messages = result.messages.map((m) => {
        const key = normalizeForCompare(`${m.title} ${m.body}`);
        if (!prevSet.has(key)) return m;
        return { ...m, title: smartClip(`${m.title} 새안`, 26) };
      });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
