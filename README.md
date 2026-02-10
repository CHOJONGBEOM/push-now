# 📱 PushNow

> **경쟁사 푸시 알림을 실시간 수집·분석하여, 마케터에게 '언제 보낼지'와 '뭐라고 쓸지'를 데이터로 알려주는 인텔리전스 대시보드**

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 🎯 서비스 개요

**PushNow**는 경쟁 앱의 푸시 알림을 자동으로 수집하고 분석하여 마케터가 데이터 기반으로 의사결정을 할 수 있도록 돕는 마케팅 인텔리전스 플랫폼입니다.

### 😰 마케터의 현실 문제

| 질문 | 현재 해결 방식 | 문제점 |
|------|---------------|--------|
| "내일 푸시 언제 보내지?" | 감으로 결정, 과거 데이터 참고 | 경쟁사 발송 시간 모름 → 같은 시간대에 몰리면 묻힘 |
| "경쟁사 뭐 하고 있지?" | 폰에 경쟁 앱 깔아두고 수동 체크 | 놓치는 게 많음, 기록이 안 남음, 시간 낭비 |
| "할인 카피 어떻게 쓰지?" | 벤치마킹 레퍼런스 수집 | 체계적 분석 불가, 트렌드 파악 어려움 |
| "우리 푸시 성과가 왜 낮지?" | CTR만 보고 원인 추측 | 시장 대비 비교 기준 없음 |

### ✅ PushNow의 해결책

```
마케터는 "데이터"가 아니라 "답"을 원합니다.
- ❌ "경쟁사가 하루 평균 3.2건 발송합니다"
- ✅ "화요일 오전 10시는 경쟁사 발송이 40% 적습니다. 이 시간에 보내세요."
```

---

## ✨ 주요 기능

### 🏠 1. 랜딩 페이지 (Landing)
- 서비스 소개 및 히어로 섹션
- 실시간 푸시 알림 피드 애니메이션

### 🤖 2. AI 메시지 생성 (Generate)
- **OpenAI 활용**: OpenAI 모델 기반 메시지 생성
- **4단계 위저드**: 목표 → 타겟 → 스타일 → 생성
- **맞춤형 카피**: 타겟 고객층별 최적화된 메시지
- **실시간 학습**: 수집된 메시지 데이터 기반 AI 학습

### 📱 3. 피드 (Feed)
- **실시간 타임라인**: 수집된 모든 푸시 알림을 시간순 정렬
- **스마트 필터링**: 앱별, 카테고리별, 광고/일반 분류
- **무한 스크롤**: 다수의 메시지를 빠르게 탐색
- **숨김 관리**: 불필요한 메시지 숨김/표시

### ⏰ 4. 타이밍 분석 (Timing)
- **골든 아워 추천**: 경쟁사 발송이 적은 최적 시간대 TOP 3
- **히트맵 시각화**: 요일×시간대별 발송 패턴 매트릭스
- **요일별 차트**: 어느 요일에 푸시가 집중되는지 확인
- **앱별 비교**: 경쟁사별 발송 시간대 패턴 분석

### 📈 5. 트렌드 분석 (Trends)
- **마케팅 훅 분석**: AI가 추출한 심리 트리거와 설득 기법
- **앱별 발송 빈도**: 경쟁사 푸시 전략 비교
- **카테고리 분포**: Sale / New / Restock / Event 메시지 유형 분석

### 📝 6. 리뷰 (Review)
- **메시지 미리보기**: 기기별, 앱별 푸시 메시지 비쥬얼라이징
- **A/B 메시지 비교**: A/B 테스트 메시지 비교
- **유사메시지 벤치마크**: 유사 메시지 체크

---

## 🛠️ 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **Frontend** | React 19.2.4, TypeScript 5.8.2 |
| **Build Tool** | Vite 6.2.0 |
| **Routing** | React Router DOM 6.22.0 |
| **Data Visualization** | Recharts 3.7.0 |
| **Icons** | Lucide React 0.563.0 |
| **Backend** | Supabase (PostgreSQL) |
| **AI** | Google Gemini API |
| **Deployment** | Vercel |

---

## 📦 데이터 소스

PushNow는 **PushRadar** Android 앱에서 수집한 푸시 알림 데이터를 사용합니다.

### 수집 대상 카테고리

| 카테고리 | 대표 앱 (추가 예정) |
|----------|---------------------|
| **🍔 F&B** | 배달의민족, 요기요, 쿠팡이츠 등 |
| **🛒 이커머스** | 쿠팡, 마켓컬리, 11번가, 네이버 등 |
| **👔 패션** | 무신사, 29CM, 지그재그, 에이블리 등 |
| **✈️ 여행** | 야놀자, 여기어때, 마이리얼트립, KLOOK 등 |
| **💰 금융** | 토스, 카카오뱅크, 페이코 등 |
| **🎬 엔터테인먼트** | CGV, 롯데시네마, 메가박스 등 |

> 💡 **지속적 확장 중**: PushRadar 앱에 새로운 앱을 추가하여 수집 범위를 계속 넓혀가고 있습니다.

---

## 🌐 바로 사용하기

### 웹 앱 접속

PushNow는 Vercel을 통해 배포되어 있어 별도 설치 없이 바로 사용할 수 있습니다:

**🔗 [https://push-now.vercel.app](https://push-now.vercel.app/?_vercel_share=5PPYhY1YkBUIDLZ5sKuCeoNTj6wtlu7W)**

### 주요 페이지

- **홈**: https://push-now.vercel.app/
- **피드**: https://push-now.vercel.app/feed
- **타이밍 분석**: https://push-now.vercel.app/timing
- **AI 생성**: https://push-now.vercel.app/generate
- **트렌드**: https://push-now.vercel.app/trends

---

## 📂 프로젝트 구조

```
push_now/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Navbar, StatCard 등)
│   │   ├── feed/            # 피드 관련 컴포넌트
│   │   ├── timing/          # 타이밍 분석 컴포넌트
│   │   └── trends/          # 트렌드 분석 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Dashboard.tsx
│   │   ├── Timing.tsx
│   │   ├── Trends.tsx
│   │   └── Generate.tsx
│   ├── types/               # TypeScript 타입 정의
│   ├── utils/               # 유틸리티 함수
│   ├── lib/                 # 외부 라이브러리 설정 (Supabase)
│   ├── App.tsx              # 메인 앱 컴포넌트
│   └── main.tsx             # 진입점
├── public/                  # 정적 파일
├── .env.example             # 환경 변수 예시
├── vercel.json              # Vercel 설정
├── package.json
└── README.md
```

---

## 🎨 페이지 구조

| 페이지 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| **랜딩** | `/` | 히어로 + 실시간 피드 애니메이션 | ✅ 완료 |
| **피드** | `/feed` | 실시간 푸시 타임라인 (필터, 무한스크롤) | ✅ 완료 |
| **타이밍** | `/timing` | 시간대별 히트맵, 추천 시간대, 앱 비교 | ✅ 완료 |
| **생성** | `/generate` | AI 메시지 추천 (4단계 Step wizard) | ✅ 완료 |
| **트렌드** | `/trends` | 마케팅 훅 + 심리 트리거 AI 분석 | ✅ 완료 |
| **리뷰** | `/review` | 작성 메시지 리뷰 | ✅ 완료 |

---

## 🗄️ 데이터베이스 스키마

### `push_messages` 테이블

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | BIGINT | Primary Key |
| `package_name` | TEXT | 앱 패키지명 (com.musinsa.store) |
| `app_name` | TEXT | 앱 이름 (무신사, 29CM 등) |
| `title` | TEXT | 푸시 제목 |
| `body` | TEXT | 푸시 본문 |
| `posted_at` | TIMESTAMPTZ | 알림 발송 시간 |
| `collected_at` | TIMESTAMPTZ | 수집 시간 |
| `is_ad` | BOOLEAN | 광고 여부 |
| `category` | TEXT | sale, new, restock, reminder, event, other |
| `has_emoji` | BOOLEAN | 이모지 포함 여부 |
| `message_length` | INTEGER | 메시지 길이 |
| `is_hidden` | BOOLEAN | 숨김 처리 여부 |
| `raw_data` | TEXT | 원본 JSON 데이터 |

> 📖 자세한 데이터베이스 설정은 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)를 참고하세요.

---

## 🎯 타겟 사용자

### Primary: CRM/그로스 마케터

**페르소나: 김똑똑 (30세, 이커머스 CRM 담당 2년차)**

- **담당 업무**: 앱 푸시, 카카오 알림톡, 이메일 캠페인
- **주간 푸시 발송**: 15~20건
- **KPI**: 푸시 CTR, 전환율, 재구매율
- **고민**: "경쟁사보다 잘하고 있는 건지 모르겠다"
- **현재 도구**: Braze, 자체 CRM, 엑셀

**Jobs to be Done (JTBD)**
1. 푸시 발송 전 → "경쟁사가 언제 보내는지 확인하고 빈 시간대 찾기"
2. 카피 작성 시 → "잘 되는 레퍼런스 빠르게 찾고 빠르게 빠르게 완성하기"
3. 전략 분석 → "경쟁사 동향 요약해서 팀에 공유하기"

### Secondary: PM, 마케팅 리드

- 시장 트렌드 파악
- 경쟁사 전략 분석
- 캠페인 기획 시 벤치마크

---

## 📊 주요 인사이트 예시

### ⏰ 골든 아워 추천
```
🎯 경쟁사 발송이 적은 시간대 TOP 3

1. 화요일 오전 10시 (경쟁사 발송 40% ↓)
2. 목요일 오후 3시 (경쟁사 발송 35% ↓)
3. 일요일 오후 8시 (경쟁사 발송 30% ↓)
```

### 📈 트렌드 분석
```
🔥 최근 7일간 가장 많이 사용된 키워드

1. "최대 50%" - 무신사, 29CM, 지그재그
2. "마지막 기회" - 쿠팡, SSG
3. "신규 회원" - 배달의민족, 요기요
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

## 📞 문의

- **개발자**: 조종범
- **이메일**: jongbeomcho@gmail.com
- **프로젝트 링크**: https://push-now.vercel.app/?_vercel_share=5PPYhY1YkBUIDLZ5sKuCeoNTj6wtlu7W

<div align="center">
  <p>Made with ❤️ by PushNow Team</p>
  <p>
    <a href="#-pushnow">맨 위로 ⬆️</a>
  </p>
</div>
