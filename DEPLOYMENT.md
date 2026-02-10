# Vercel 배포 가이드

이 문서는 PushNow 대시보드를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

### 1. Git 저장소 준비
프로젝트가 Git 저장소에 푸시되어 있어야 합니다.

```bash
# Git 초기화 (아직 안 했다면)
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit for deployment"

# GitHub에 푸시 (저장소를 먼저 생성해야 합니다)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. 환경 변수 확인
로컬의 `.env.local` 파일에 다음 값들이 설정되어 있는지 확인하세요:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Vercel 배포 방법

### 방법 1: Vercel 웹 대시보드 사용 (추천)

#### 1단계: Vercel 계정 생성
1. [vercel.com](https://vercel.com)에 접속
2. GitHub 계정으로 로그인/가입

#### 2단계: 프로젝트 임포트
1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 목록에서 `push_now` 저장소 선택
3. **"Import"** 클릭

#### 3단계: 프로젝트 설정
1. **Framework Preset**: Vite 자동 감지됨
2. **Root Directory**: 기본값 유지 (`.`)
3. **Build Command**: `npm run build` (자동 설정됨)
4. **Output Directory**: `dist` (자동 설정됨)

#### 4단계: 환경 변수 설정
**Environment Variables** 섹션에서 다음을 추가:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 로컬 `.env.local`의 값 복사 |
| `VITE_SUPABASE_ANON_KEY` | 로컬 `.env.local`의 값 복사 |
| `GEMINI_API_KEY` | 로컬 `.env.local`의 값 복사 |

**중요**: 모든 환경 변수는 **Production**, **Preview**, **Development** 모두 체크하세요.

#### 5단계: 배포
1. **"Deploy"** 버튼 클릭
2. 배포가 완료될 때까지 대기 (보통 1-2분)
3. 배포 완료 후 제공되는 URL로 접속하여 확인

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (전역)
npm install -g vercel

# 프로젝트 디렉토리에서 배포
cd c:\workspace\push_now
vercel

# 프롬프트에 따라 진행:
# - Set up and deploy? Y
# - Which scope? (계정 선택)
# - Link to existing project? N
# - Project name? (기본값 또는 원하는 이름)
# - In which directory is your code located? ./
# - Want to override settings? N

# 환경 변수 추가
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY

# 프로덕션 배포
vercel --prod
```

## 배포 후 확인 사항

### 1. 기본 동작 확인
- [ ] 배포된 URL에 접속 가능
- [ ] 모든 페이지 로딩 (Dashboard, Generate, Trends, Timing)
- [ ] 브라우저 콘솔에 오류 없음

### 2. Supabase 연결 확인
- [ ] Dashboard 페이지에서 데이터 로딩 확인
- [ ] 필터링 기능 정상 작동
- [ ] 차트 데이터 표시 확인

### 3. 반응형 디자인 확인
- [ ] 모바일 브라우저에서 정상 표시
- [ ] 태블릿 화면에서 정상 표시
- [ ] 데스크톱 화면에서 정상 표시

## 재배포 및 업데이트

### 자동 배포
GitHub에 푸시하면 Vercel이 자동으로 배포합니다:

```bash
git add .
git commit -m "Update feature"
git push
```

### 수동 재배포
Vercel 대시보드에서:
1. 프로젝트 선택
2. **"Deployments"** 탭
3. 최신 배포의 **"..."** 메뉴 → **"Redeploy"**

### 환경 변수 수정
1. Vercel 대시보드 → 프로젝트 선택
2. **"Settings"** → **"Environment Variables"**
3. 변수 수정 후 **"Save"**
4. **재배포 필요** (변경사항 적용을 위해)

## 문제 해결

### 빌드 실패
- Vercel 대시보드의 **"Deployments"** → 실패한 배포 클릭 → 로그 확인
- 로컬에서 `npm run build` 테스트

### 환경 변수 오류
- 브라우저 개발자 도구 콘솔 확인
- Vercel 대시보드에서 환경 변수 재확인
- 변수명 앞에 `VITE_` 접두사 확인 (Vite 프로젝트 필수)

### 404 오류 (페이지 새로고침 시)
- `vercel.json` 파일의 rewrites 설정 확인
- 파일이 저장소에 커밋되었는지 확인

## 유용한 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Vercel 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html#vercel)
