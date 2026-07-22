---
description: Supabase Edge Function을 배포하는 방법
---

## 프로젝트 정보

- **Supabase Project Ref**: `mprfnwhfzuyivuxgelol`
- **Supabase URL**: `https://mprfnwhfzuyivuxgelol.supabase.co`
- **Edge Function 위치**: `supabase/functions/<function-name>/index.ts`

## 배포할 함수 목록

| 함수명 | 경로 | 설명 |
|--------|------|------|
| `generate-push-message` | `supabase/functions/generate-push-message/index.ts` | 푸시 메시지 AI 생성 (gpt-4o-mini) |

---

## 배포 명령어

### 특정 함수 배포
```bash
npx supabase functions deploy <function-name> --project-ref mprfnwhfzuyivuxgelol
```

예시:
// turbo
```bash
npx supabase functions deploy generate-push-message --project-ref mprfnwhfzuyivuxgelol
```

### 모든 함수 배포
```bash
npx supabase functions deploy --project-ref mprfnwhfzuyivuxgelol
```

---

## 주의사항

- Docker가 없어도 배포 가능 (WARNING 무시해도 됨)
- `Exit code: 0` 이면 배포 성공
- 배포 후 Supabase 대시보드 > Edge Functions 에서 확인 가능
- OpenAI 모델: `gpt-4o-mini` (generate-push-message, backfill_hooks 모두 동일)
