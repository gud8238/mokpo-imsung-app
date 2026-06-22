# CLAUDE.md — 프로젝트 최상위 지침

> 이 문서는 **목포임성초 AI독서질문 웹앱(BOOK돋움 질문도감)** 프로젝트의 **최상위(top-level) 지침**입니다.
> Claude Code는 모든 세션 시작 시 이 파일을 먼저 읽고, 아래 분할 문서들을 함께 참고하여 작업합니다.
>
> **문서 우선순위**: `CLAUDE.md`(이 파일) → `HANDOFF.md` → `design.md` / `skills.md`

---

## 📚 연결 문서 (반드시 함께 참고)

| 문서 | 역할 | 언제 읽나 |
| --- | --- | --- |
| **[HANDOFF.md](./HANDOFF.md)** | 프로젝트 전체 맥락·구조·DB 스키마·TODO | **새 세션 시작 시 가장 먼저** |
| **[design.md](./design.md)** | 디자인 시스템(색상·타이포·UI 톤·컴포넌트 패턴) | UI/화면 작업 전 |
| **[skills.md](./skills.md)** | 이 프로젝트에서 쓰는 Claude Code 스킬·워크플로 | 기능 추가/디버깅/리뷰 전 |

---

## 0. 작업 시작 루틴 (매 세션 필수)

1. 이 `CLAUDE.md`를 읽는다.
2. `HANDOFF.md`의 **§9 현재 상태 & TODO**를 확인해 "어디까지 했는지" 파악한다.
3. UI 작업이면 `design.md`, 기능/디버깅/리뷰면 `skills.md`를 연다.
4. 작업을 마치면 `HANDOFF.md §9`를 갱신한다.

---

## 1. 프로젝트 한 줄 정의

목포임성초 학생(1~6학년)이 책을 읽고 질문을 만들면 **Google Gemini AI**가 질문 유형(사실/추론/평가)을 분류하고 초등학생 눈높이의 따뜻한 피드백을 주는 **독서 교육 웹앱**.

---

## 2. 기술 스택 (요약)

- **Next.js 16.2.3** (App Router) + **React 19** + **TypeScript**
- UI: **Mantine v9** + `@tabler/icons-react`
- 인증/DB: **Supabase** (`@supabase/ssr`)
- AI: **Google Gemini** `gemini-3.1-flash-lite` (`src/lib/gemini.ts`)
- 차트: `@mantine/charts` / 한글 변환: `md2hwp`

> ⚠️ **Next.js 주의**: 이 버전(16.2.3)은 학습 데이터와 다른 breaking change가 있을 수 있음.
> 새 API/규약을 쓰기 전 `node_modules/next/dist/docs/`의 해당 가이드를 확인하고 deprecation 경고를 준수할 것. (기존 `AGENTS.md` 규칙을 본 파일로 승격)

---

## 3. 명령어

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 실행
npm run lint       # ESLint
```

### 환경 변수 — `.env.local` (git 제외, 직접 생성 필요)
```
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://wglnrealznvbvybcoaja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
> 키가 없으면 로그인·AI·DB 동작 불가. (UI/빌드 점검까지만 가능)

---

## 4. 아키텍처 핵심 규칙

- **서버/클라이언트 분리 엄수**
  - 데이터 페칭 = 서버 컴포넌트(`page.tsx`) + 서버 액션(`src/actions/*`)
  - 인터랙션 UI = `'use client'` 컴포넌트로 분리 (예: `BooksGrid`, `QuestionForm`)
- **Supabase 클라이언트는 용도별로 구분** (새로 만들지 말 것)
  - 브라우저: `@/lib/supabase/client`
  - 서버 컴포넌트/액션: `@/lib/supabase/server`
  - 미들웨어: `@/lib/supabase/middleware`
- **인증/역할 라우팅은 이메일 prefix 기반** (`proxy.ts` → `middleware.ts`)
  - 교사 `teacher*@imsung.school` → `/teacher`
  - 학생 `st*@imsung.school` → `/student/books`
  - ⚠️ 역할 판별 로직을 바꿀 때는 `middleware.ts`와 `actions/auth.ts` **둘 다** 일관되게 수정.
- **AI 모델명 `gemini-3.1-flash-lite`는 `src/lib/gemini.ts`에 2곳 하드코딩.** 변경 시 둘 다 수정.
- **AI 호출은 항상 rate-limit 재시도 + fallback을 유지** (서비스 안정성). 새 AI 함수도 같은 패턴을 따를 것.

---

## 5. 도메인 규칙 — 질문 3분류 (절대 깨지 않기)

| 코드값 | 학술 명칭 | 앱 표시 | 색상 |
| --- | --- | --- | --- |
| `factual` | 사실적 질문 | 📘 사실 질문 | blue |
| `inferential` | 추론적 질문 | 🔍 궁금 질문 | violet |
| `evaluative` | 평가적 질문 | 💭 라면 질문 | orange |

- 코드값(`factual`/`inferential`/`evaluative`)은 **DB·AI·UI 전체에서 동일하게 사용**. 라벨/색상 매핑은 각 컴포넌트의 `TYPE_LABEL_MAP`/`TYPE_COLOR_MAP` 참조.
- 위계: 사실적 → 추론적 → 평가적 (사고의 확장).

---

## 6. 글쓰기 톤 (UI 문구의 철칙)

- **모든 사용자 문구는 한국어**, 초등학생 친화적 **존댓말(해요체)** + 이모지.
- **부정 평가 금지.** "틀렸어" ✗ → "조금 다르게 생각해볼 수 있어요" ◯
- 항상 격려하고 다음 단계로 도전하도록 유도.
- 자세한 색상·레이아웃·컴포넌트 규칙은 **[design.md](./design.md)** 참조.

---

## 7. 하지 말 것 (Do NOT)

- `.env*` 파일을 커밋하거나 키를 코드/문서에 하드코딩하지 말 것.
- 사용자가 명시적으로 요청하기 전에는 commit/push 하지 말 것.
- 질문 유형 코드값(영문 enum)을 임의로 바꾸지 말 것 (DB 데이터와 불일치 발생).
- 서버 전용 로직(Gemini 키 사용 등)을 클라이언트 컴포넌트로 옮기지 말 것.
