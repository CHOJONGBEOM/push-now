# 📱 PushNow

> **경쟁사 푸시 알림을 실시간 수집·분석하여, 마케터에게 '언제 보낼지'와 '뭐라고 쓸지'를 데이터로 알려주는 인텔리전스 대시보드**

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 🎯 서비스 개요

**PushNow**는 경쟁 앱의 푸시 알림을 자동으로 수집하고 분석하여 마케터가 데이터 기반으로 의사결정을 할 수 있도록 돕는 마케팅 인텔리전스 플랫폼입니다. 

마케터들은 "내일 몇 시에 보낼까?", "카피를 어떻게 작성할까?"라는 핵심 질문을 던집니다. PushNow는 경쟁 밀집 시간대를 파악해 주는 요일×시간 히트맵과 AI 기반 카피라이팅 추천으로 이에 대한 데이터 기반 답변을 즉시 제공합니다.

🔗 **[웹 앱 접속하기 (Vercel 배포)](https://push-now.vercel.app/?_vercel_share=5PPYhY1YkBUIDLZ5sKuCeoNTj6wtlu7W)**

---

## 📂 상세 설명 가이드 바로가기

기획 및 개발에 관련된 세부 명세서는 독립된 문서로 정리되어 있으니 아래 링크를 참고해 주세요:

* **[기획 및 비즈니스 제품서 (PRODUCT.md)](file:///c:/workspace/push_now/PRODUCT.md)**:
  * 마케터 타겟 페르소나 및 핵심 문제 정의
  * 실시간 피드, 타이밍 분석, AI 생성 등 핵심 기능의 기획 상세 스펙
  * Freemium 요금제 설계 및 런칭/획득 마케팅 전략
* **[기술 및 개발 가이드 (DEVELOPMENT.md)](file:///c:/workspace/push_now/DEVELOPMENT.md)**:
  * 전체 수집 데이터 파이프라인 (Android 단말 ➡️ Supabase REST/Trigger ➡️ Vercel Web) 아키텍처 다이어그램
  * Supabase `push_messages` 테이블 DDL 및 TypeScript 인터페이스 정의
  * 로컬 개발 실행 명령어 및 Vercel 배포 세부 설정
* **[포트폴리오 어필용 이력서 (PORTFOLIO_NOTION.md)](file:///c:/workspace/push_now/PORTFOLIO_NOTION.md)**:
  * UTC/KST 시간대 오류 해결, Jaccard 유사도 기반 AI 중복 제어 등 **10가지 핵심 기술 의사결정 Rationale** 상세 수록

---

## 🚀 빠른 시작

로컬 개발 환경에서 빠르게 대시보드를 구동하는 명령어입니다:

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 시작
npm run dev

# 3. 배포용 빌드 테스트
npm run build
```

---

## 🛠️ 전체 프로젝트 구조
```
push_now/
├── src/
│   ├── components/          # 재사용 UI 컴포넌트 (Navbar, Heatmap, FeedCard 등)
│   ├── pages/               # 대시보드 화면들 (Dashboard, Feed, Timing, Generate, Trends 등)
│   ├── hooks/               # 커스텀 데이터 쿼리 훅 (useAvailableApps, usePushMessages 등)
│   ├── types/               # TypeScript 타입 정의 파일
│   ├── utils/               # 앱 아이콘 및 카테고리 매핑 유틸리티
│   ├── App.tsx              # React 라우팅 구성
│   └── main.tsx             # 앱 진입점
├── DEVELOPMENT.md           # 개발 상세 가이드 (DB 스키마, 데이터 파이프라인 포함)
├── PRODUCT.md               # 비즈니스 기획 가이드 (페르소나, 상세 기능 스펙 포함)
├── PORTFOLIO_NOTION.md      # 기술 의사결정 위주의 포트폴리오용 문서
└── package.json             # 의존성 명세
```
