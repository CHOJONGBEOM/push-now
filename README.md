# 📱 PushNow

> **무신사·올리브영·배민은 지금 어떤 푸시를 보낼까?**  
> 카테고리별 주요 대표 앱들의 마케팅 알림을 실시간 수집·분석하여, 경쟁을 피하는 골든아워 타이밍과 AI 카피를 도출하는 **푸시 인텔리전스(Push Intelligence) 플랫폼**입니다.

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Android](https://img.shields.io/badge/Android-Kotlin-3DDC84?logo=android)](https://developer.android.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://push-now.vercel.app)

🔗 **[PushNow 라이브 웹 대시보드 바로가기](https://push-now.vercel.app)** · **[프로젝트 개발 스토리 (/about)](https://push-now.vercel.app/about)**

---

## 🎯 프로젝트 배경 & 기획 의도

CRM 마케터들은 늘 **"내일 푸시 언제 보내지?", "카피를 어떻게 쓰지?"**라는 질문을 마주합니다.  
경쟁사가 보내는 실제 푸시 알림은 가장 훌륭한 실전 레퍼런스이지만, **알림 바에서 스와이프해 지우는 순간 영원히 휘발**되어 버립니다.

**PushNow**는 갤러리에 스크린샷 수백 장을 모아두던 마케터의 일상적 비효율을 해결하기 위해, **Android 실시간 알림 수집기부터 클라우드 DB 트리거 정제, 웹 대시보드 시각화까지 1인 풀스택으로 설계·구축한 실전 포트폴리오 프로젝트**입니다.

> 💡 **수집 데이터 환경 (Data Context)**  
> CRM 푸시 메시지는 성별, 연령, 유저 행동에 따라 개인화되어 발송됩니다.  
> 현재 PushNow는 **30대 남성 사용자 기기 환경**을 기반으로 패션, 이커머스, 뷰티, 배달, 금융 등 주요 대표 앱들의 실제 마케팅 알림을 24시간 실시간 수집하고 있습니다.

---

## 🏗️ 전체 시스템 아키텍처 (End-to-End Pipeline)

```
┌─────────────────────────────────────────────────────────────┐
│                 PushRadar (Android Kotlin)                  │
│       - NotificationListenerService (OS 레벨 실시간 감지)      │
│       - 패키지명 필터링 & 노티 메타데이터 추출 (Title/Body/Time)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Supabase REST API (직접 INSERT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL & Deno)                │
│                                                             │
│   [DB Trigger 1] auto_process_message (BEFORE INSERT)        │
│   → 결제/시스템 알림 필터링 & 마케팅 푸시(is_ad) 판별          │
│                                                             │
│   [DB Trigger 2] auto_register_app (AFTER INSERT)           │
│   → 신규 패키지 감지 시 apps 마스터 테이블 자동 등록           │
│                                                             │
│   [DB Trigger 3] trigger_analyze_marketing (AFTER INSERT)   │
│   → Edge Function (Deno) 비동기 호출                         │
│   → OpenAI gpt-4o-mini 연동 (심리 트리거 & 훅 자동 태깅)      │
│                                                             │
│   [Security] Row Level Security (RLS)                       │
│   → Public: 읽기 전용 (SELECT) / Collector Session: INSERT  │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgREST API (실시간 쿼리)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PushNow Web Dashboard                       │
│              (React 19 + TypeScript + Vite)                 │
│                                                             │
│   1. 피드 (/feed)    : 캘린더/카테고리/앱별 실시간 알림 탐색    │
│   2. 타이밍 (/timing) : 3중 가중치 골든아워 히트맵 알고리즘    │
│   3. 트렌드 (/trends) : 심리 트리거 및 전략 분포 통계 분석     │
│   4. AI 카피 (/generate): Jaccard 유사도 가드레일 6앵글 생성 │
│   5. 검토 (/review)  : A/B 비교 및 발송 전 퀄리티 점검       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                          Vercel CDN
```

---

## ✨ 핵심 기능 (Core Features)

### 1. 실시간 메시지 피드 (`/feed`)
* 주요 카테고리(패션, 커머스, 배달, 금융 등)의 실시간 마케팅 알림 타임라인 제공
* 캘린더 날짜 선택, 앱 다중 필터, 마케팅 목적 태그별 필터링

### 2. 발송 타이밍 & 골든아워 분석 (`/timing`)
* **08:00 ~ 23:59 유효 윈도우 가드레일**: 정보통신망법(08:00 야간광고 해제) 및 실무 발송 패턴 반영
* **3중 다기준 가중 추천 알고리즘**:
  $$\text{최종 점수} = (\text{경쟁도 점수} \times 0.65) + (\text{데이터 신뢰도} \times 0.25) + (\text{시장 보너스} \times 0.15)$$
  * **경쟁도 (65%)**: 경쟁 앱의 발송량이 가장 적은 블루오션 슬롯 선별 (과반 결정력)
  * **데이터 신뢰도 (25%)**: 배달앱 리뷰 비유(500개 4.8점 vs 1개 5점). 발송량이 1건 미만인 유령 슬롯을 걸러내는 문지기
  * **시장 보너스 (15%)**: 스마트폰 전체 알림 생태계의 혼잡도를 반영하는 판정승 가산점
* **요일 분산 제약 (Diversity Guardrail)**: 1위~3위 추천 시 동일 요일 중복 및 인접 시간 배제

### 3. 마케팅 트렌드 & 심리 트리거 통계 (`/trends`)
* 11가지 마케팅 훅(할인율, 긴급성 등) 및 12가지 심리 트리거(FOMO, 호기심, 희소성 등) 자동 분류 비율
* 앱별 전략 비중 및 발송 빈도 패턴 시각화

### 4. AI 6앵글 카피라이팅 생성 (`/generate`)
* 목적(혜택/신상/리마인드/추천), 타겟, 톤앤매너 5단계 위저드
* **실전 레퍼런스 동적 주입 (Few-shot)**: DB에서 실제 반응이 검증된 카피를 프롬프트에 자동 결합
* **Jaccard 유사도 가드레일**: 생성된 문장 간 유사도가 70%를 넘거나 진부한 클리셰가 검출되면 온도를 높여 자동 재생성

---

## 🧠 핵심 엔지니어링 의사결정 (Technical Highlights)

| # | 해결한 문제 | 엔지니어링 접근법 |
| :-: | :--- | :--- |
| **1** | **UTC vs KST 시간대 왜곡** | DB의 UTC 타임스탬프를 밀리초 오프셋(+9h) 연산으로 KST 변환 후 요일·시간 추출, 히트맵 9시간 밀림 원천 차단 |
| **2** | **단순 정렬 시 '새벽 3시' 추천 오류** | 08:00~23:59 윈도우 제한 및 경쟁도(65%) + 신뢰도(25%) + 시장 혼잡도(15%) 결합 다기준 스코어링 모델 구축 |
| **3** | **LLM 카피의 클리셰 및 중복 생성** | Jaccard 토큰 유사도 알고리즘(Deno Edge Function)으로 70% 초과 유사 문장 자동 필터링 및 재생성 가드레일 적용 |
| **4** | **쏟아지는 시스템 알림/스팸 정제** | DB BEFORE INSERT 트리거(`auto_process_message`)로 카드 결제, 배터리 알림을 자동 차단하고 `is_ad` 플래그 자동 부여 |
| **5** | **API 키 노출 방지 및 보안 통제** | Deno Edge Function 프록시 레이어로 OpenAI Key를 서버 환경변수에서만 은닉 호출, Supabase RLS로 DB 쓰기 권한 통제 |

---

## 🚀 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 배포용 빌드 테스트
npm run build
```

---

## 👤 개발자 소개

* **조종범 (Cho Jongbeom)** · Growth Marketer & Full-Stack Creator
* **Email**: jjongbeom@gmail.com
* **GitHub**: [github.com/chojongbeom](https://github.com/chojongbeom)
* **LinkedIn**: [linkedin.com/in/jongbeomcho](https://www.linkedin.com/in/jongbeomcho)
* **Project Story**: [push-now.vercel.app/about](https://push-now.vercel.app/about)
