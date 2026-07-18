# 배포 가이드 (Netlify)

목포임성초 독서교육 AI 웹앱을 Netlify에 배포할 때 필요한 환경변수 설정과 주의사항을 정리합니다.

> 운영 대상: **mokpo-imsung-v1**
>
> URL: https://mokpo-imsung-v1.netlify.app
>
> Site ID: `8217888f-3b1e-4e42-b62c-e21bccf4353e`

## 1. 환경변수 등록 (필수)

Netlify 대시보드에서 **Site settings → Environment variables** 로 이동하여 아래 3개를 직접 등록합니다.

| Key | 값 | 설명 |
| --- | --- | --- |
| `GEMINI_API_KEY` | (실제 Gemini API 키) | 서버사이드 전용. 브라우저에 노출되지 않음 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wglnrealznvbvybcoaja.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase anon public 키) | Supabase 익명 키 |

> 키 값은 코드/저장소에 절대 넣지 않고 **Netlify 대시보드에만** 입력합니다.

## 2. `.env.local`은 로컬 전용

- `.env.local` 파일은 `.gitignore`에 의해 **절대 커밋되지 않습니다.** 개발자 개인 PC에서만 사용됩니다.
- 배포 환경(Netlify)에는 `.env.local`이 올라가지 않으므로, **반드시 위 1번처럼 Netlify 대시보드의 Environment variables로 키를 주입**해야 AI 기능이 동작합니다.
- 저장소에 올라가는 것은 `.env.example`(키 없는 템플릿)뿐입니다.

## 3. 빌드 설정

- 플러그인: **`@netlify/plugin-nextjs`** 사용 권장 (Next.js App Router / Server Actions 지원).
  - `netlify.toml`에 추가하거나, Netlify UI의 Plugins에서 설치할 수 있습니다.
  ```toml
  [build]
    command = "npm run build"
    publish = ".next"

  [[plugins]]
    package = "@netlify/plugin-nextjs"
  ```
- 빌드 명령: `npm run build`
- Publish 디렉터리: `.next` (플러그인이 자동 처리하므로 보통 별도 지정 불필요)

## 4. API 키 보안

- `GEMINI_API_KEY`에는 **`NEXT_PUBLIC_` 접두사가 없습니다.** Next.js는 `NEXT_PUBLIC_`이 붙은 변수만 클라이언트 번들에 포함하므로, `GEMINI_API_KEY`는 **브라우저로 절대 전송되지 않습니다.**
- 이 키는 서버사이드(`src/lib/gemini.ts` 및 이를 호출하는 Server Action)에서만 읽혀 Gemini API를 호출합니다. 따라서 클라이언트 측 노출 위험이 없습니다.
- 반면 `NEXT_PUBLIC_SUPABASE_*`는 의도적으로 클라이언트에 노출되는 공개 값(anon key)이므로 정상입니다.

## 5. 배포 전 체크리스트

- [ ] `git status`에 `.env.local`이 보이지 않음 (추적되지 않음)
- [ ] 저장소 코드에 실제 Gemini 키 문자열이 없음
- [ ] Netlify Environment variables에 3개 키 등록 완료
- [ ] `@netlify/plugin-nextjs` 활성화
- [ ] `npm run assets:verify`, `npm test`, `npm run lint`, `npm run build` 통과
- [ ] GitHub `main` 푸시 완료
- [ ] `npx netlify status`에서 로그인 계정 확인
- [ ] 아래 명령으로 `mokpo-imsung-v1`에 연결한 뒤 운영 배포

```bash
npx netlify link --id 8217888f-3b1e-4e42-b62c-e21bccf4353e
npx netlify deploy --prod
```

다른 기존 사이트인 `mokpo-imsung-app`에는 이 개편판을 배포하지 않는다.
