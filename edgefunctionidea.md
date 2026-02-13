import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 프론트엔드에서 보내주는 구조와 일치시킴
interface GenerateRequest {
  appName: string;
  appCategory: string;
  productName?: string;
  keyBenefit?: string;
  targetAudience: string;
  
  // 프론트엔드에서 조립된 정교한 가이드
  systemInstruction: {
    role: string;
    mission: string;
    guidelines: string;
    outputFormat: string;
    constraints: {
      maxLength: number;
      bodyMaxLength: number;
      noRepetition: string;
    };
  };

  referenceMessages: {
    title: string;
    body: string;
    hook: string;
  }[];
}

Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { 
      appName, 
      appCategory, 
      productName, 
      keyBenefit, 
      targetAudience, 
      systemInstruction, 
      referenceMessages 
    }: GenerateRequest = await req.json();

    // 1. 레퍼런스 메시지 포맷팅 (Few-shot Learning)
    const referenceText = referenceMessages && referenceMessages.length > 0
      ? referenceMessages.map((m, i) => 
          `[Case ${i + 1}]\n- 제목: ${m.title}\n- 본문: ${m.body}\n- 전략: ${m.hook}`
        ).join('\n\n')
      : '(참고할 만한 레퍼런스가 없습니다. 가이드라인에 맞춰 창의적으로 작성하세요.)';

    // 2. 시스템 프롬프트 조립 (프론트엔드 지시사항 반영)
    const systemPrompt = `
${systemInstruction.role}

[Context]
- 앱 이름: ${appName}
- 카테고리: ${appCategory}
- 타겟 유저: ${targetAudience}

[Mission]
${systemInstruction.mission}

[Guidelines]
${systemInstruction.guidelines}

[Constraints]
- 제목 길이: 공백 포함 ${systemInstruction.constraints.maxLength}자 이내
- 본문 길이: 공백 포함 ${systemInstruction.constraints.bodyMaxLength}자 이내
- ${systemInstruction.constraints.noRepetition}
- JSON 포맷으로 응답할 것.

[Output Format]
${systemInstruction.outputFormat}

응답은 반드시 아래 JSON 스키마를 따르세요:
{
  "messages": [
    {
      "style": "직관적/단도직입형",
      "title": "제목 내용",
      "body": "본문 내용",
      "hook": "사용된 핵심 전략/단어",
      "hookType": "전략타입(영문)" 
    },
    ... (나머지 2개 스타일)
  ]
}
`;

    // 3. 유저 프롬프트 (실제 입력값)
    const userPrompt = `
아래 내용을 바탕으로 푸시 메시지 3건을 작성해주세요.

- 상품/서비스명: ${productName}
- 핵심 혜택/메시지: ${keyBenefit}

[참고 레퍼런스 (톤앤매너 참고용)]
${referenceText}
`;

    // 4. OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 창의력이 필요하므로 gpt-4o 권장 (비용 문제시 gpt-3.5-turbo 혹은 gpt-4o-mini)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85, // 창의적인 변주를 위해 약간 높게 설정
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // JSON 파싱 및 응답
    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});