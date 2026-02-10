# Supabase 설정 가이드

## 🚀 빠른 시작

PushNow 앱이 Supabase와 연동되려면 환경 변수 설정이 필요합니다.

## 📝 설정 단계

### 1. Supabase 프로젝트 정보 확인

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **Settings** → **API** 클릭
4. 다음 정보를 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (긴 문자열)

### 2. 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **중요**: `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 3. 개발 서버 재시작

환경 변수를 변경한 후에는 **반드시** 개발 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료 (Ctrl+C)
# 서버 재시작
npm run dev
```

## 🗄️ 데이터베이스 테이블 생성

Supabase에서 다음 SQL을 실행하여 `push_messages` 테이블을 생성하세요:

```sql
-- push_messages 테이블 생성
CREATE TABLE push_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_name TEXT NOT NULL,
    title TEXT,
    content TEXT,
    category TEXT NOT NULL,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    package_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_push_messages_posted_at ON push_messages(posted_at DESC);
CREATE INDEX idx_push_messages_category ON push_messages(category);
CREATE INDEX idx_push_messages_app_name ON push_messages(app_name);

-- RLS (Row Level Security) 활성화
ALTER TABLE push_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정
CREATE POLICY "Enable read access for all users" ON push_messages
    FOR SELECT USING (true);
```

## 📊 샘플 데이터 추가 (선택사항)

테스트를 위해 샘플 데이터를 추가할 수 있습니다:

```sql
INSERT INTO push_messages (app_name, title, content, category, posted_at, package_name)
VALUES 
    ('배달의민족', '🎉 첫 주문 10,000원 할인!', '지금 바로 주문하고 할인 받으세요', 'promotion', NOW(), 'com.woowa.baemin'),
    ('토스', '💰 송금 완료', '홍길동님께 50,000원을 보냈어요', 'notification', NOW() - INTERVAL '1 hour', 'viva.republica.toss'),
    ('당근마켓', '🥕 근처에 새로운 게시글', '우리 동네에 새로운 물건이 올라왔어요', 'social', NOW() - INTERVAL '2 hours', 'com.towneers.www'),
    ('쿠팡', '⚡ 로켓배송 출발!', '주문하신 상품이 곧 도착합니다', 'notification', NOW() - INTERVAL '3 hours', 'com.coupang.mobile'),
    ('네이버', '📰 오늘의 뉴스', '지금 가장 많이 본 뉴스를 확인하세요', 'news', NOW() - INTERVAL '5 hours', 'com.nhn.android.search');
```

## ✅ 설정 확인

1. 브라우저에서 `http://localhost:5173/feed` 접속
2. 에러 메시지가 사라지고 메시지 카드가 표시되는지 확인
3. 카테고리 필터와 앱 필터가 정상 작동하는지 확인

## 🔧 문제 해결

### "Supabase 설정이 필요합니다" 에러
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- 개발 서버를 재시작했는지 확인

### "relation 'push_messages' does not exist" 에러
- Supabase에서 테이블을 생성했는지 확인
- 테이블 이름이 정확히 `push_messages`인지 확인

### 데이터가 표시되지 않음
- Supabase에 데이터가 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인 (F12)

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [프로젝트 데이터베이스 스키마](file:///c:/workspace/push_now/src/types/database.ts)
