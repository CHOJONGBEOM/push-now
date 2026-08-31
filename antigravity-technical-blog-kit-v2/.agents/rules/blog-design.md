# Blog Design Rules

## Purpose
기술 스토리 및 포트폴리오 아티클은 화려한 SaaS 랜딩이 아니라 **"장시간 집중해서 읽을 수 있는 최고 수준의 가독성과 기술 전달력"**을 갖추어야 한다.

핵심 원칙:
> **콘텐츠와 엔지니어링 설득력이 디자인보다 항상 우선한다.**  
> 불필요한 시각적 장식은 덜어내고, 원리를 체감할 수 있는 **인터랙티브 요소**는 적극 활용한다.

## Design Priority
1. **가독성 (Readability)**: 완벽한 타이포그래피, 줄간격, 폰트 렌더링
2. **정보 위계 (Hierarchy)**: 한눈에 들어오는 소제목과 도식
3. **인터랙티브 체감 (Interactive Widgets)**: 슬라이더, 시뮬레이터, 라이브 토글
4. **콘텐츠 탐색성 (Navigation)**: Sticky TOC, Section Spy
5. **반응형 완성도 (Responsive)**: 모바일/데스크톱 최적화
6. **시각 장식 (Decoration)**: 최소화

## Article Header & Metadata (SEO / Social)
- **Header 구성**:
  - Category / Topic Tag (예: `Full-Stack Architecture & Growth`)
  - Title (명확하고 직관적인 메인 타이틀)
  - Summary (프로젝트와 글의 핵심을 관통하는 1~2문장)
  - Data Context Banner (수집 환경, 운영 데이터 규모 등 맥락 제공)
  - Author Card (1인 메이커 프로필 및 링크)
- **SEO & Social Sharing**:
  - `og:title`, `og:description`, `og:image` (스크린샷 기반 깔끔한 카드), `canonical URL` 지원

## Content Width & Spacing
- **Desktop 본문 너비**: 약 `680px ~ 760px`를 기준으로 제한하여 시선 분산을 막는다.
- **예외적 와이드 요소**: Code block, Table, Interactive Simulation, Before/After 박스는 가독성을 해치지 않는 선에서 본문보다 넓게 확장 가능하다.
- **여백(Spacing)**: 섹션 간 충분한 마진(`mt-16 mb-8`, `my-14`)을 두어 피로도를 줄인다.

## Interactive Widgets (권장 요소) ✨
단순 텍스트 설명보다, 독자가 **원리를 직접 조작하고 체감할 수 있는 인터랙티브 위젯**을 적극적으로 도입한다.
- **예시**:
  - 3중 가중치(경쟁도, 신뢰도, 시장보너스) 슬라이더를 조작해 보는 **Golden Hour 가중치 시뮬레이터**
  - 원본 알림 텍스트를 입력하면 필터링 여부와 카테고리를 판별해 주는 **미니 정규식/트리거 테스터**
  - Jaccard 유사도 임계값 조절 위젯
- *주의*: 화려한 효과를 위한 위젯이 아니라, **"독자가 알고리즘의 동작 원리를 5초 만에 이해하게 만드는 도구"**여야 한다.

## Code Blocks & Inline Code
- **Code Blocks**:
  - 파일 경로 명시 (`// path/to/file.ts`)
  - 가로 스크롤(`overflow-x-auto`) 방어
  - 모노스페이스 폰트(`JetBrains Mono`, `Fira Code` 등)
  - 과도한 네온 글로우나 불필요한 카드 프레임 배제
- **Inline Code**:
  - 함수명, API, 컬럼명, 변수명(`<Code>package_name</Code>`)에만 깔끔하게 적용

## Diagrams, Pipeline & Before/After
- **Pipeline / Flow Box**: 데이터 파이프라인(단계별 흐름)을 모노스페이스 또는 단계형 카드 박스로 시각화
- **Before / After Box**: '처음 생각했던 방식(Before)'과 '실제 마주친 문제와 답(After)'을 대비시켜 전달
- **Screenshots / Lightbox**:
  - 실제 운영 화면, DB 쿼리 결과, 아키텍처 스크린샷 활용
  - 클릭 시 크게 볼 수 있는 Lightbox 및 캡션 제공

## Avoid AI-Generated Website Aesthetics (주의사항)
- ❌ 남발되는 보라색/보케 그라디언트 배경
- ❌ 과도한 글래스모피즘(Glassmorphism)과 몽환적인 Blur
- ❌ 모든 섹션을 둥글둥글한 카드(Rounded Card)로 도배
- ❌ 의미 없는 3D 그래픽/일러스트레이션
- ❌ 지나치게 느리거나 현란한 스크롤 패럴랙스(Parallax)

## Responsive Fallback (Mobile Rules)
- **Table / Code**: 모바일에서 텍스트가 찌그러지지 않고 가로 스크롤로 보호
- **Before/After Box**: Desktop 2열 그리드 → Mobile 1열 스택 전환
- **TOC**: Desktop은 좌측/우측 Sticky Sidebar, Mobile은 상단 접이식(Accordion) 또는 생략
