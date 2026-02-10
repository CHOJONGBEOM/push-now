# 변경 사항 및 작업 이력 (2026-02-09)

## 📌 작업 요약
실시간 피드 페이지(`/feed`)의 UX/UI를 대폭 개선하고, Supabase 연동 및 필터링 로직을 고도화했습니다.

## ✅ 완료된 작업

### 1. UI/UX 개선 (Trendy Design)
- **FeedCard**: 
  - 모던한 카드 디자인 적용 (그림자, 둥근 모서리)
  - 호버 효과 추가 (스케일 업, 그라디언트 오버레이)
  - 앱 아이콘 표시 (실제 아이콘 매핑 + 그라디언트 폴백)
- **FilterBar**:
  - 기존 드롭다운 방식을 **칩(Chip) 기반 멀티 셀렉트**로 변경
  - 선택된 앱을 직관적으로 확인하고 개별 제거 가능
- **FeedHeader**:
  - 세련된 그라디언트 배경 적용

### 2. 로직 및 기능 개선
- **앱 필터링 버그 수정**:
  - 기존: 필터 적용 시 드롭다운 목록도 같이 줄어드는 문제
  - 수정: `usePushMessages` 훅에서 전체 앱 목록(`allApps`)을 독립적으로 페칭하도록 분리
- **실시간 업데이트**:
  - Supabase Realtime을 통해 새 메시지 수신 시 피드 자동 갱신
- **데이터 스키마 동기화**:
  - `push_collector_app`과 일치하도록 스키마 필드명 변경 (`content` -> `body`)
  - `is_hidden`, `is_ad` 등 필터링 로직 추가

### 3. 유틸리티 추가
- `src/utils/appIcons.ts`: 주요 앱 아이콘 URL 매핑 및 색상 생성기
- `src/utils/appCategories.ts`: 앱 카테고리 관리

## ⚠️ 보류 중인 작업 / 이슈

### 1. Supabase MCP 서버 인증 문제
- **현상**: AI가 Supabase DB를 직접 조회할 때 "Unauthorized" 에러 발생
- **원인**: MCP 서버가 `.env.local` 값을 못 읽거나, 시스템 환경 변수로 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`가 필요함
- **해결 방안 (다음에 할 일)**:
  PowerShell에서 아래 명령어로 사용자 환경 변수 설정 필요:
  ```powershell
  [System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://mprfnwhfzuyivuxgelol.supabase.co', 'User')
  [System.Environment]::SetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY', 'YOUR_SERVICE_ROLE_KEY', 'User')
  ```
  (현재 `.env.local`에 있는 `VITE_SUPABASE_ANON_KEY`가 service_role 키임)

### 2. 데이터 검증
- Supabase `push_messages` 테이블의 `category` 컬럼 값이 UI 필터 ID와 일치하는지 확인 필요

## 🚀 다음 단계 (Next Steps)
1. **AI 메시지 생성 페이지 (`/generate`) 구현**: 선택한 메시지를 바탕으로 변형 메시지 생성
2. **발송 타이밍 분석 페이지 (`/timing`) 구현**: 메시지 발송 시간대 시각화
