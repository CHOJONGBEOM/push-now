# 📱 PushNow 포트폴리오 (PORTFOLIO_NOTION.md)

> **"마케터가 직접 기기 수십 개에 테스트 앱을 깔고 알림을 캡처하는 현실을 어떻게 바꿀 수 있을까?"**
> 이커머스 및 CRM 마케터의 일상적 비효율을 해결하기 위해 수집(Android)부터 분석(Dashboard)까지 직접 설계·구축한 풀스택 프로젝트입니다.

---

## 🔗 링크 & 핵심 지표
* **배포 URL**: [https://push-now.vercel.app](https://push-now.vercel.app)
* **GitHub 저장소**: [github.com/chojongbeom/push-now](https://github.com/chojongbeom/push-now)
* **개발 기간**: 2026.02 (약 2주, 1인 개발)
* **데이터 규모**: 43개 대표 앱에서 474건+ 실제 푸시 메시지 수집

---

## 🛠️ 핵심 인프라 & 기술 스택
* **Frontend**: React 19, TypeScript, Vite, Recharts, GSAP
* **Deployment & Domain**: **Vercel** ([push-now.vercel.app](https://push-now.vercel.app)) - 무중단 배포 및 SPA 라우팅 적용
* **Database & Auth**: **Supabase (PostgreSQL)** - 실시간 데이터 동기화(Realtime Serverless) 및 RLS 정책 적용
* **AI & LLM**: **OpenAI API (gpt-4o-mini)** - Deno Edge Function을 경량 프록시로 채택하여 실시간 카테고리/훅/트리거 자동 태깅 및 6앵글 AI 메시지 생성 파이프라인 구동

---

## 🏗️ 전체 시스템 아키텍처

```
┌──────────────────────────────────────────────────┐
│              PushRadar (Android)                  │
│         NotificationListenerService              │
│          43개 앱 알림 수집 (6개 카테고리)           │
└──────────────────┬───────────────────────────────┘
                   │ REST API
                   ▼
┌──────────────────────────────────────────────────┐
│          Supabase (PostgreSQL + Auth)             │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ push_messages │  │  Edge Functions (Deno)    │  │
│  │ - app_name   │  │  generate-push-message   │  │
│  │ - title/body │  │  → OpenAI gpt-4o-mini    │  │
│  │ - category   │  │  → 737줄 프롬프트 파이프라인│  │
│  │ - posted_at  │  └──────────────────────────┘  │
│  │ - hook_type  │                                │
│  │ - hook_trigger│  Row Level Security (RLS) 적용 │
│  └──────────────┘                                │
└──────────────────┬───────────────────────────────┘
                   │ PostgREST API
                   ▼
┌──────────────────────────────────────────────────┐
│          PushNow Dashboard (React 19)            │
│                                                  │
│  Landing ➡️ Feed ➡️ Timing ➡️ Trends ➡️ Generate │
│                                                  │
│  TypeScript · Tailwind CSS · Recharts · GSAP     │
└──────────────────────────────────────────────────┘
                   │
                   ▼
               Vercel CDN
```

---

## 🧠 개발 과정의 10가지 엔지니어링 도전과 해결책

### 1. UTC vs KST 시간대 오류 해결 (히트맵 불일치)
* **문제**: Supabase DB는 타임스탬프를 UTC 표준시로 저장하지만, 타겟 고객인 한국 마케터는 KST(한국 표준시)를 기준으로 분석해야 합니다. 일반적인 `getHours()`를 적용할 경우 데이터가 9시간 밀려서 노출되어 "낮 12시 발송량"이 "새벽 3시 발송량"으로 집계되는 오류가 있었습니다.
* **해결**: 외부 라이브러리 추가 없이 Date 객체의 밀리초 연산을 활용해 KST 기준 시간대로 가상 보정한 후 요일과 시간을 추출하도록 훅을 설계했습니다.
  ```typescript
  const toKstDayHour = (isoDate: string) => {
    const utc = new Date(isoDate);
    const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    return { dayOfWeek: kst.getUTCDay(), hour: kst.getUTCHours() };
  };
  ```

### 2. AI 메시지 추천의 다양성 확보 (Jaccard 유사도 도입)
* **문제**: 동일한 타겟과 혜택을 입력할 때 LLM이 톤만 바꾼 채 구조가 유사한 카피를 반복 생성하는 문제가 발생했습니다.
* **해결**: 토큰 단위 분석을 수행하는 **Jaccard 유사도 알고리즘**을 Deno Edge Function에 적용해, 이전에 생성한 카피와 유사도가 72%를 초과하는 결과가 검출되면 API 온도를 높여(temperature 1.0) 자동으로 재생성하는 가드레일을 도입했습니다.

### 3. 입력 가드레일과 프롬프트 파이프라인 구축 (737줄의 Edge Function)
* **문제**: 단순한 LLM 프롬프트 발송만으로는 현업 마케터가 실전에 사용 가능한 카피 품질을 충족시키지 못했습니다.
* **해결**: 730라인에 달하는 파이프라인을 구축하여 **[입력 유효성 검사 ➡️ DB 내 레퍼런스 스타일 데이터 자동 추출 ➡️ 6가지 공식 앵글 기반 프롬프트 조립 ➡️ 정규식을 통한 클리셰 차단 필터링 ➡️ 종결어미 완성 검사]**로 이어지는 입출력 안전 가드레일을 단독 구축했습니다.

### 4. 형태소 분석기 없이 한국어 키워드 분석 (TF-IDF 경량 구현)
* **문제**: 프론트엔드 환경에서 자바스크립트로 형태소 분석을 수행하려면 대용량 사전 파일 로드와 성능 부하가 수반되었습니다.
* **해결**: 마케팅 도메인에 자주 출현하는 120개 핵심 단어를 정의한 특화 사전 및 불용어 리스트를 사전에 설계하고, 경량 TF-IDF 수식을 직접 작성하여 0ms에 가깝게 실시간 키워드 네트워크를 시각화했습니다.

### 5. 통계적으로 유의미한 골든아워 추천 알고리즘 설계
* **문제**: 단순히 "발송량이 적은 시간"만을 정렬할 경우, 아무런 마케팅도 일어나지 않는 '새벽 2~4시'가 추천 1위로 선정되는 무의미한 상태가 발생했습니다.
* **해결**: 활동 유효 시간대(오전 6시 ~ 오후 11시)로 윈도우를 한정하고, 전체 슬롯의 **백분위 밀도 분포(25%, 50%, 75%)**를 계산하여 평균 대비 이탈 비율을 고려하는 골든아워(상위 25% 하회) 및 회피 시간대 추천 수식을 구현했습니다.

### 6. CDN 파일명 한글 인코딩 오류 해결
* **문제**: 기기에서 추출한 한글 및 특수문자 파일명을 가진 아이콘 에셋(`N 스토어.png`, `29CM.png`)이 Vercel CDN 배포 시 404 Not Found를 일으키는 현상이 일어났습니다.
* **해결**: 동적 경로 바인딩 시 `encodeURIComponent(appName)` 처리를 일괄 적용하고, 로컬 에셋이 손상되거나 부재할 경우 `ui-avatars.com` API를 통해 동적 대체 아바타를 그리는 폴백 처리를 구축해 에러에 대처했습니다.

### 7. 경량 상태 관리 전략 수립 (Redux 배제)
* **문제**: 소규모 프로젝트에 불필요한 상태 보일러플레이트(Redux, Recoil 등)가 무분별하게 추가될 우려가 있었습니다.
* **해결**: 전역 공유 데이터가 극히 적은 SPA 특성을 파악하여, Supabase의 내장 데이터 캐시 및 독립적인 커스텀 데이터 훅(Custom Hooks) 7개를 정의하는 방식으로 아키텍처를 슬림하게 유지했습니다.

### 8. API 키 보안을 위한 Edge Function 프록시 레이어 설계
* **문제**: 프론트엔드 코드 내부에서 OpenAI API를 직접 호출할 경우 인증 Sk-Key가 클라이언트에 노출되어 취약점이 생깁니다.
* **해결**: Supabase Edge Function을 중간 프록시로 두고 프론트엔드는 공개용 anon-key로 통신하며, 민감 정보인 OpenAI API Key는 클라우드 서버 측 환경 변수(Secrets) 내부에서만 결합하여 안전하게 호출하도록 통제했습니다.

### 9. Vite esbuild와 TSC 컴파일 불일치 해결
* **문제**: 개발 환경(`npm run dev`)에서는 에러 없이 실행되던 코드가 esbuild와 tsc의 strict 컴파일 옵션 차이로 인해 프로덕션 빌드 단계에서 실패하는 현상이 발생했습니다.
* **해결**: `tsconfig.json` 파일의 타입 체크 규칙을 엄격하게 선언하여 개발 단계에서 런타임 잠재 에러를 미리 발견할 수 있도록 빌드 파이프라인을 개선했습니다.

### 10. 이종 프로젝트 간의 데이터 파이프라인 설계 및 RLS 통제
* **문제**: React Native 안드로이드 앱과 React 대시보드 웹앱이 동기화되면서 DB 테이블의 데이터 무결성과 권한 통제가 요구되었습니다.
* **해결**: Supabase의 Row Level Security(RLS) 정책을 정의하여 익명 브라우저(Public)는 읽기(`SELECT`)만 가능하도록 제한하고, 알림 수집용 기기 세션만 쓰기(`INSERT`)가 가능하도록 권한 가이드를 엄격히 적용했습니다.
