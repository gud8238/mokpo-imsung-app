# GIF Glass UI and PDF Diagnosis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the supplied GIF and translucent glass surfaces across the app, reorder the student question flow, align student navigation buttons, and replace HWPX diagnosis downloads with a polished Korean PDF.

**Architecture:** Keep the existing `LowPolyBackdrop` and `StorySurface` boundaries, changing their CSS contract instead of rewriting every page. Isolate PDF layout in a pure `src/lib/diagnosis-pdf.ts` generator and keep the Route Handler responsible only for request validation and the downloadable response.

**Tech Stack:** Next.js 16 App Router, React 19, Mantine 9, CSS Modules, Vitest, pdf-lib, @pdf-lib/fontkit, Pretendard OTF, Netlify Next.js runtime.

## Global Constraints

- Preserve Supabase schemas and question type values `factual`, `inferential`, `evaluative`.
- Preserve Gemini model and analysis prompts.
- Use the user-provided GIF; do not generate raster assets.
- Keep Korean UI copy and keyboard accessibility.
- Do not stage unrelated pre-existing `.gitignore`, `.agents/`, `deno.lock`, or `skills-lock.json` changes.

---

### Task 1: Background and glass surface contract

**Files:**
- Create: `public/backgrounds/login-forest.gif`
- Modify: `src/components/low-poly/low-poly.module.css`
- Modify: `src/app/login/login.module.css`
- Modify: `src/app/login/page.tsx`
- Modify: `src/theme.ts`
- Test: `src/app/login/LoginPage.test.tsx`
- Test: `src/app/accessibility-contract.test.ts`

**Interfaces:**
- Consumes: existing `LowPolyBackdrop variant="login|student|teacher"` and `StorySurface tone` props.
- Produces: GIF-backed login poster, reduced-motion fallback, translucent surfaces with no top stripe.

- [ ] Write failing source-contract tests asserting `/backgrounds/login-forest.gif`, `rgba(255,255,255,0.68)`, no `border-top`, and a reduced-motion static poster rule.
- [ ] Run `npm.cmd test -- src/app/login/LoginPage.test.tsx src/app/accessibility-contract.test.ts` and confirm the new assertions fail.
- [ ] Copy the supplied GIF, update poster/overlay/surface CSS, and move login field styling into the glass design.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Transparent role pages and navigation parity

**Files:**
- Modify: `src/components/low-poly/role-shell.module.css`
- Modify: `src/app/student/layout.tsx`
- Modify: `src/app/student/student-pages.module.css`
- Modify: `src/app/teacher/teacher-pages.module.css`
- Test: `src/app/student/student-ui-contract.test.tsx`
- Test: `src/app/teacher/teacher-ui-contract.test.tsx`

**Interfaces:**
- Consumes: student `navItems` array and shared `.navItem` class.
- Produces: identical book/history navigation buttons and translucent role page cards.

- [ ] Add failing contract assertions for both student links using the same class, surface alpha below `.85`, and no opaque mobile fallback.
- [ ] Run the two focused UI contract tests and confirm failure.
- [ ] Apply shared navigation markup and glass surface classes; reduce role overlay opacity without reducing text contrast.
- [ ] Re-run focused tests.

### Task 3: Question-first student flow

**Files:**
- Modify: `src/app/student/books/[bookId]/QuestionForm.tsx`
- Modify: `src/app/student/student-pages.module.css`
- Test: `src/app/student/student-ui-contract.test.tsx`

**Interfaces:**
- Consumes: existing `selectedType`, `questionText`, radio keyboard handlers, and `submitQuestion` action.
- Produces: DOM order `질문 씨앗 1` textarea, then `질문 씨앗 2` radiogroup, then submit.

- [ ] Add a failing source-order test using indices of `책을 떠올리며 질문을 적어요` and `질문의 종류를 골라요`.
- [ ] Run the focused student test and verify the order assertion fails.
- [ ] Reorder stages, update copy, preserve radio semantics and submit validation.
- [ ] Re-run the focused student test.

### Task 4: PDF diagnosis generator

**Files:**
- Create: `src/lib/diagnosis-pdf.ts`
- Create: `src/lib/diagnosis-pdf.test.ts`
- Create: `public/fonts/Pretendard-Regular.otf`
- Create: `public/fonts/Pretendard-Bold.otf`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `generateDiagnosisPdf(input: DiagnosisPdfInput): Promise<Uint8Array>` and `sanitizePdfFilename(name: string): string`.
- `DiagnosisPdfInput` contains `studentName`, `summary`, `strengths`, `areasForImprovement`, `questionCount`, and `typeCounts`.

- [ ] Write failing tests for filename sanitation, `%PDF` bytes, multi-page long Korean content, and all three question counts.
- [ ] Run `npm.cmd test -- src/lib/diagnosis-pdf.test.ts` and confirm module-not-found/behavior failures.
- [ ] Install `pdf-lib` and `@pdf-lib/fontkit`, add Korean fonts, implement A4 drawing helpers, measured wrapping, pagination, colored sections, footer, and metadata.
- [ ] Re-run the PDF tests.

### Task 5: PDF Route Handler and teacher download UI

**Files:**
- Delete: `src/app/api/download-hwpx/route.ts`
- Create: `src/app/api/download-pdf/route.ts`
- Create: `src/app/api/download-pdf/route.test.ts`
- Modify: `src/app/teacher/students/[studentId]/StudentQuestionsView.tsx`
- Modify: `src/app/accessibility-contract.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `generateDiagnosisPdf` and the AI diagnosis result.
- Produces: `POST /api/download-pdf` and a Blob-based client download named `<학생명>_질문진단결과.pdf`.

- [ ] Write failing route tests for 400 validation and a 200 `application/pdf` attachment response; add a failing source contract that forbids `download-hwpx`, `HWPX`, and `md2hwp`.
- [ ] Run focused tests and verify failure.
- [ ] Implement JSON validation, PDF response headers, client loading/error state, question statistics payload, and PDF button copy; remove `md2hwp`.
- [ ] Re-run focused tests.

### Task 6: Visual and release verification

**Files:**
- Modify: `HANDOFF.md`
- Create: `output/pdf/sample-question-diagnosis.pdf` only for local verification, then keep it untracked or remove it before commit.
- Create: `tmp/pdfs/*` only for rendered verification, then remove intermediates.

**Interfaces:**
- Produces: verified production build and deployment.

- [ ] Generate a representative Korean PDF, run `pdfinfo`, render with `pdftoppm`, and visually inspect every PNG page.
- [ ] Run `npm.cmd test`, `npm.cmd run assets:verify`, `npm.cmd run lint`, and `npm.cmd run build` with zero failures.
- [ ] Run the app and inspect login, student books/question/history, and teacher dashboard/diagnosis at desktop and mobile widths.
- [ ] Update `HANDOFF.md` with the new PDF route, GIF asset, UI behavior, and deployment target.
- [ ] Stage only task-related files and commit.
- [ ] Push `main` to `origin`.
- [ ] Run `npx.cmd netlify deploy --prod`, verify the production URL, and perform a final HTTP smoke check.
