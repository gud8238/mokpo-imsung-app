# 🛠️ 프로젝트 인수인계 문서 (HANDOFF)

> **목적**: 이 문서는 새로운 Claude Code 채팅 세션에서도 작업을 끊김 없이 이어가기 위한 **컨텍스트 엔지니어링(harness)** 문서입니다.
> 새 세션을 시작하면 **가장 먼저 이 파일을 읽어** 프로젝트 전체 맥락을 파악하세요.

- **최종 업데이트**: 2026-07-19
- **작성자/소유자**: 목포임성초 서찬아 (gud8238@gmail.com)
- **GitHub**: https://github.com/gud8238/mokpo-imsung-app
- **로컬 경로**: `C:\Users\목포AISW\Desktop\claude-code\mokpo-imsung-reading-ai`

---

## 1. 프로젝트 한 줄 요약

**"BOOK돋움 질문도감"** — 목포임성초등학교 학생(1~6학년)이 책을 읽고 질문을 만들면, **Google Gemini AI**가 질문 유형(사실/추론/평가)을 분류하고 초등학생 눈높이의 따뜻한 피드백을 주는 **독서 교육 웹앱**.

---

## 2. 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프레임워크 | **Next.js 16.2.3** (App Router) + React 19 |
| 언어 | TypeScript 5 |
| UI | **Mantine UI v9** (`@mantine/core`, `@mantine/charts`, `@mantine/hooks`) + `@tabler/icons-react` |
| 인증/DB | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) |
| AI | **Google Gemini** (`@google/generative-ai`), 모델 `gemini-3.1-flash-lite` |
| 차트 | `@mantine/charts` (recharts 3 기반) |
| 문서 변환 | `pdf-lib` + `@pdf-lib/fontkit` (학생 AI 진단 결과 → 디자인된 PDF 다운로드) |
| 폰트 | Pretendard (CDN) |

> ⚠️ **주의**: `AGENTS.md`에 따르면 이 Next.js는 학습 데이터와 다른 breaking change가 있을 수 있음. 코드 작성 전 `node_modules/next/dist/docs/` 참고 권장.

---

## 3. 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성 (저장소에 없음! 직접 만들어야 함)
#    프로젝트 루트에 .env.local 생성

# 3. 개발 서버 실행
npm run dev   # http://localhost:3000
```

### `.env.local` (필수 — git에서 제외됨)
```
GEMINI_API_KEY=<Google AI Studio 키>
NEXT_PUBLIC_SUPABASE_URL=https://wglnrealznvbvybcoaja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon 키>
```
> ⛔ **현재 로컬에 `.env.local`이 없어 실제 실행/로그인/AI 호출은 불가**. 키 없이는 빌드/UI 확인까지만 가능.

---

## 4. 디렉터리 / 라우트 구조

```
src/
├── proxy.ts                      # 미들웨어(인증 게이트) — updateSession 호출
├── actions/
│   ├── auth.ts                   # login / logout (서버 액션)
│   └── questions.ts              # 질문 제출/삭제, 교사 피드백, 학생 성장분석
├── lib/
│   ├── gemini.ts                 # ★ AI 핵심: analyzeQuestion / analyzeStudentProgress + 프롬프트
│   ├── assets.ts                 # Supabase Storage 자산 URL 모음
│   └── supabase/
│       ├── client.ts             # 브라우저 클라이언트
│       ├── server.ts             # 서버 컴포넌트/액션 클라이언트
│       └── middleware.ts         # 세션 갱신 + 역할 기반 라우팅
└── app/
    ├── layout.tsx                # 루트 레이아웃 (Mantine Provider, 테마=indigo)
    ├── page.tsx                  # '/' → /login 리다이렉트
    ├── login/page.tsx            # 로그인 화면 (배경 영상 + 카드)
    ├── api/download-pdf/route.ts # 학생 진단결과 PDF 다운로드 API
    ├── student/                  # 👦 학생 영역 (보라색 테마)
    │   ├── layout.tsx            # 학생 네비게이션 (책 목록 / 내 기록)
    │   ├── books/                #   - 책 목록(BooksGrid) + [bookId] 질문작성(QuestionForm)
    │   └── history/              #   - 내 질문 기록(HistoryView)
    └── teacher/                  # 👩‍🏫 교사 영역 (파란색 테마)
        ├── layout.tsx           # 교사 네비게이션 (대시보드)
        ├── page.tsx             # 대시보드 데이터 페칭 → TeacherDashboard
        ├── books/[bookId]/      #   - 책별 질문 모아보기(BookQuestionsView)
        └── students/[studentId]/#   - 학생별 질문 + AI 성장분석(StudentQuestionsView)
```

---

## 5. 인증 & 역할 라우팅 (중요)

- **이메일 prefix로 역할 구분** (RLS 회피용, `middleware.ts`):
  - 교사: `teacher*@imsung.school` → `/teacher`
  - 학생: `st*@imsung.school` (예: `st0101@imsung.school`) → `/student/books`
- `proxy.ts` 미들웨어가 비로그인 사용자를 `/login`으로, 역할에 안 맞는 경로 접근을 자동 리다이렉트.
- 로그인 후 프로필(`name`, `class_name`)은 `profiles` 테이블에서 조회.

---

## 6. Supabase DB 스키마 (코드에서 확인된 것)

| 테이블 | 주요 컬럼 |
| --- | --- |
| `profiles` | `id`(=auth user id), `name`, `class_name` |
| `books` | `id`, `title`, `author`, `cover_image_url`, `description`, `created_at` |
| `questions` | `id`, `student_id`, `book_id`, `question_text`, `question_type`, `ai_feedback`(JSON 문자열), `created_at` |
| `teacher_feedbacks` | `id`, `question_id`, `teacher_id`, `feedback_text` |

- **Storage 버킷 `hero`**: intro.mp4, bookcover.png, question.png, books.png, book.png, student.png, imsung.png
  - Base URL: `https://wglnrealznvbvybcoaja.supabase.co/storage/v1/object/public/hero/`

---

## 7. 질문 유형 3분류 (도메인 핵심)

| 내부 코드값 | 학술 명칭 | 앱 표시 이름 | 색상 | 사고 수준 |
| --- | --- | --- | --- | --- |
| `factual` | 사실적 질문 | 📘 사실 질문 | 파랑(blue) | 기억·이해 |
| `inferential` | 추론적 질문 | 🔍 궁금 질문 | 보라(violet) | 분석·추론 |
| `evaluative` | 평가적 질문 | 💭 라면 질문 | 주황(orange) | 평가·문제해결 |

- 위계 관계: **사실적 → 추론적 → 평가적** (사고의 확장)
- 전체 분류 기준/프롬프트는 `src/lib/gemini.ts`의 `QUESTION_ANALYSIS_PROMPT`에 상세히 정의됨.

### AI 함수 2개 (`src/lib/gemini.ts`)
1. `analyzeQuestion(bookTitle, questionText, studentSelectedType)` → 질문 1건 분류 + 피드백
   - 반환: `{ ai_determined_type, is_correct, feedback, encouragement }`
2. `analyzeStudentProgress(studentName, questions[])` → 학생 누적 성장 분석
   - 반환: `{ summary, strengths, areas_for_improvement }`
- 둘 다 **429 rate-limit 재시도 로직**(최대 3회) + 실패 시 **fallback 응답** 내장.
- JSON만 출력하도록 프롬프트 + 정규식(`/\{[\s\S]*\}/`) 파싱.

---

## 8. 코딩 컨벤션 / 주의사항

- **언어/톤**: UI 문구는 전부 한국어, 초등학생 친화적 이모지/존댓말("해요체"). 부정 평가 금지 → "조금 다르게 생각해볼 수 있어요" 식.
- **스타일**: Mantine 컴포넌트 + 인라인 `style` + 그라데이션. 학생=보라 계열, 교사=파랑 계열로 영역 구분.
- **서버/클라이언트 분리**: 데이터 페칭은 서버 컴포넌트(`page.tsx`), 인터랙션은 `'use client'` 컴포넌트로 분리.
- **AI 모델명**: `gemini-3.1-flash-lite` 하드코딩 (2곳). 변경 시 두 함수 모두 수정.
- `.env*`는 git 제외됨.

---

## 9. 현재 상태 & 다음 작업 (TODO)

### ✅ 완료
- [x] GitHub 저장소를 로컬에 클론 완료
- [x] 프로젝트 구조 전체 파악
- [x] 프로젝트 메모리 + 본 HANDOFF 문서 작성
- [x] 지침 문서 체계 구축: **CLAUDE.md(최상위)** + design.md + skills.md
- [x] `AGENTS.md` → `@CLAUDE.md`로 역전 (CLAUDE.md를 최상위 권위로, 타 도구 호환 유지)

### 📂 지침 문서 체계 (읽는 순서)
`CLAUDE.md` → `HANDOFF.md` → `design.md`(UI) / `skills.md`(워크플로)

### ⏭️ 다음에 할 일
- [x] Gemini API 키 `.env.local`에 저장, Netlify 환경변수 등록 완료
- [x] GitHub Actions CD 파이프라인 구성 (`.github/workflows/netlify-deploy.yml`)
- [x] Netlify 사이트 생성: https://mokpo-imsung-app.netlify.app (ID: 3ab968bf-1ada-4e83-b475-f93a565bb356)
- [ ] **⚠️ 사용자 작업 필요**: GitHub Secrets 5개 등록 (아래 §10 참고)
- [ ] **⚠️ 사용자 작업 필요**: Supabase ANON KEY 발급 후 `.env.local` + GitHub Secret + Netlify 환경변수에 등록
- [ ] (이후 기능/수정 작업)

> **새 세션 시작 시 체크리스트**
> 1. 이 `HANDOFF.md` 읽기
> 2. `MEMORY.md`(프로젝트 메모리) 확인
> 3. 사용자에게 "이어서 할 작업"을 물어보고 위 TODO 갱신
> 4. 코드 수정 후에는 이 문서의 §9 상태를 업데이트할 것

---

## 10. GitHub Secrets 등록 (CD 파이프라인 활성화 필수)

> 아래 주소에서 한 번만 등록하면 이후 git push 할 때마다 자동 배포됩니다.
> **등록 주소**: https://github.com/gud8238/mokpo-imsung-app/settings/secrets/actions

| Secret 이름 | 값 참조처 |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | `C:\Users\목포AISW\AppData\Roaming\netlify\Config\config.json` → `auth.token` |
| `NETLIFY_SITE_ID` | Netlify 대시보드 → 사이트 설정 → Site ID (또는 `netlify status`) |
| `GEMINI_API_KEY` | `.env.local` 참조 |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` 참조 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 대시보드 → 프로젝트 설정 → API → `anon public` 키 |

> ⚠️ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 없이는 빌드는 성공하더라도 로그인/DB 기능 전체 불가.
> ⚠️ 실제 키 값은 절대 이 문서(HANDOFF.md)나 코드에 직접 기재하지 말 것 — `.env.local`(git 제외) 또는 GitHub Secrets에만 보관.

## 11. 참고 링크

- GitHub: https://github.com/gud8238/mokpo-imsung-app
- Netlify 사이트: https://mokpo-imsung-v1.netlify.app
- Netlify 대시보드: https://app.netlify.com/projects/mokpo-imsung-v1
- Supabase 프로젝트 ref: `wglnrealznvbvybcoaja`
- 프로젝트 메모리: `C:\Users\목포AISW\.claude\projects\C--Users---AISW-Desktop-claude-code-mokpo-imsung-reading-ai\memory\`

## 12. 2026-07-19 저다각형 UI 개편

- 모든 로그인·학생·교사 화면을 B안 하이브리드 스토리북 저다각형 UI로 개편했다.
- 기존 Supabase 인증·질문 제출·교사 피드백·AI 분석 흐름은 유지했다.
- 생성 에셋 6개와 데스크톱용 저전력 Three.js 장면을 추가했다. 모바일, 모션 감소, WebGL 실패 시 정적/CSS 장면으로 폴백한다.
- 접근성 보강: 질문 유형 키보드 선택, 폼/아이콘 버튼 이름, 제목 계층, 본문 건너뛰기 링크, 모바일 교사 헤더를 적용했다.
- Supabase MCP는 프로젝트 `wglnrealznvbvybcoaja`에 읽기 전용으로 연결해 스키마와 RLS를 확인했다.
- 운영 배포 대상은 기존 `mokpo-imsung-app`이 아니라 **`mokpo-imsung-v1`**이다.
- Netlify site ID: `8217888f-3b1e-4e42-b62c-e21bccf4353e`

## 13. 2026-07-19 GIF·글래스 UI·PDF 진단 개편

- 로그인 배경을 사용자 제공 GIF인 `public/backgrounds/login-forest.gif`로 교체했다. 움직임 감소 설정에서는 기존 정적 저폴리 포스터를 사용한다.
- 로그인 카드는 반투명 흰색 글래스모피즘으로 바꾸고 입력창도 같은 유리 질감으로 정리했다.
- 공통 `StorySurface`의 학생/교사/로그인 상단 색 띠를 제거하고 표면 불투명도를 낮춰 모든 역할 화면에서 배경이 더 잘 보이게 했다.
- 학생 상단의 `책 목록`과 `내 기록`은 항상 동일한 테두리·배경·활성 상태를 가진 버튼으로 표시한다.
- 질문 작성 화면은 `질문 먼저 작성 → 질문 유형 선택 → 제출` 순서로 바꿨으며 기존 라디오 키보드 조작은 유지했다.
- AI 질문 진단 다운로드는 HWPX를 제거하고 `/api/download-pdf`에서 A4 PDF를 생성한다. Pretendard 한글 글꼴, 질문 유형 통계, 총평, 강점, 성장 방향, 페이지 번호를 포함한다.
- PDF 단일 페이지 및 3페이지 장문 샘플을 Poppler로 렌더링해 한글과 페이지 전환을 검수했다.
- Netlify CLI의 Windows 로컬 Edge Function 번들링은 드라이브 경로를 중복 조합해 실패하므로, 최종 배포는 GitHub Actions의 Ubuntu 러너에서 `netlify deploy --build --prod`로 수행한다.
