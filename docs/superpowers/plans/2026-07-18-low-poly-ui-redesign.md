# BOOK돋움 Low-Poly UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve every existing BOOK돋움 feature while redesigning all login, student, and teacher pages as a readable, motion-aware hybrid low-poly storybook and deploying it to Netlify `mokpo-imsung-v1`.

**Architecture:** A shared client-side `LowPolyBackdrop` owns decorative CSS layers, static poster fallbacks, and a dynamically imported Three.js canvas. Existing route components keep their Supabase and Gemini data flow; they only consume focused visual primitives such as `StorySurface`, `LowPolyIcon`, and role-specific page classes. WebGL is progressive enhancement, so HTML content renders first and remains usable when motion is reduced or 3D initialization fails.

**Tech Stack:** Next.js 16.2.3 App Router, React 19.2.4, TypeScript 5, Mantine 9.0.2, Three.js 0.185.1, Motion 12.42.2, Supabase SSR 0.10.2, Vitest 4.1.10, Testing Library 16.3.2, Netlify CLI.

## Global Constraints

- Keep `factual`, `inferential`, and `evaluative` database and UI codes unchanged.
- Keep student purple and teacher blue role identity.
- Keep all user-facing copy in Korean, elementary-friendly 해요체.
- Do not change Supabase authentication, database mutations, Gemini analysis, teacher feedback, or HWPX behavior.
- Scope Supabase MCP to project ref `wglnrealznvbvybcoaja` with `read_only=true`.
- Decorative layers must use `pointer-events: none`; content must stay above them.
- Set foreground surfaces to at least 94% opaque where text, inputs, buttons, charts, or tables appear.
- Honor `prefers-reduced-motion`, Mantine `respectReducedMotion`, and Motion `reducedMotion="user"`.
- Cap WebGL device pixel ratio at `1.5`; pause rendering while hidden or outside the viewport.
- Preserve the user-owned `.gitignore` modification and untracked `deno.lock`; never stage them.
- Do not stage `.agents/`, `.superpowers/`, or `skills-lock.json`.
- Run implementation in an isolated worktree created with `superpowers:using-git-worktrees`.
- Push the finished `main` branch to `https://github.com/gud8238/mokpo-imsung-app`.
- Deploy only to Netlify site ID `8217888f-3b1e-4e42-b62c-e21bccf4353e`.

---

## File Structure

### New runtime files

- `src/theme.ts` — exported Mantine theme and shared low-poly color tokens.
- `src/app/Providers.tsx` — Mantine and Motion providers with reduced-motion policy.
- `src/components/low-poly/types.ts` — public low-poly component types.
- `src/components/low-poly/scene-policy.ts` — pure WebGL/CSS/static mode selection.
- `src/components/low-poly/scene-policy.test.ts` — mode-selection unit tests.
- `src/components/low-poly/LowPolyBackdrop.tsx` — shared decorative wrapper and progressive enhancement boundary.
- `src/components/low-poly/LowPolyScene.tsx` — client-only Three.js renderer.
- `src/components/low-poly/create-low-poly-world.ts` — scene geometry, palettes, and disposal helpers.
- `src/components/low-poly/StorySurface.tsx` — readable high-opacity surface primitive.
- `src/components/low-poly/LowPolyIcon.tsx` — semantic local image registry.
- `src/components/low-poly/low-poly.module.css` — background, surface, focus, and motion styles.
- `src/components/low-poly/index.ts` — stable public exports.
- `src/lib/low-poly-assets.ts` — static image paths and typed asset registry.
- `src/lib/low-poly-assets.test.ts` — registry and file-path tests.

### New test and configuration files

- `vitest.config.ts` — jsdom test configuration.
- `src/test/setup.ts` — Testing Library matchers and test cleanup.
- `.codex/config.toml` — project-scoped, read-only Supabase MCP.
- `scripts/verify-low-poly-assets.mjs` — asset existence and size guard.

### New generated assets

- `public/low-poly/login-forest.webp`
- `public/low-poly/student-trail.webp`
- `public/low-poly/teacher-observatory.webp`
- `public/low-poly/book-gem.webp`
- `public/low-poly/question-gem.webp`
- `public/low-poly/profile-gem.webp`

### Existing files to modify

- `package.json`, `package-lock.json`
- `src/app/layout.tsx`, `src/app/globals.css`
- `src/app/login/page.tsx`
- `src/app/student/layout.tsx`
- `src/app/student/books/BooksGrid.tsx`
- `src/app/student/books/[bookId]/QuestionForm.tsx`
- `src/app/student/history/HistoryView.tsx`
- `src/app/teacher/layout.tsx`
- `src/app/teacher/TeacherDashboard.tsx`
- `src/app/teacher/books/[bookId]/BookQuestionsView.tsx`
- `src/app/teacher/students/[studentId]/StudentQuestionsView.tsx`
- `design.md`, `HANDOFF.md`, `DEPLOY.md`

---

### Task 1: Isolated Workspace, Skills, Test Harness, and Supabase MCP

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Create: `.codex/config.toml`

**Interfaces:**
- Consumes: approved design spec at `docs/superpowers/specs/2026-07-18-low-poly-ui-redesign-design.md`.
- Produces: `npm test`, a jsdom test environment, installed Three.js/Motion dependencies, and project-scoped Supabase MCP configuration.

- [ ] **Step 1: Create an isolated implementation worktree**

Invoke `superpowers:using-git-worktrees`, then create or select a worktree on branch `codex/low-poly-ui-redesign` from the current `main` HEAD containing the approved design and this implementation plan.

Run inside the resulting worktree:

```powershell
git branch --show-current
git status --short
```

Expected: branch is `codex/low-poly-ui-redesign`; the worktree does not contain the main checkout's unrelated `.gitignore` or `deno.lock` changes.

- [ ] **Step 2: Install the selected implementation skills globally**

Run:

```powershell
npx.cmd skills add anthropics/skills@frontend-design -g -y
npx.cmd skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
npx.cmd skills add vercel-labs/agent-skills@web-design-guidelines -g -y
npx.cmd skills add freshtechbro/claudedesignskills@threejs-webgl -g -y
npx.cmd skills add freshtechbro/claudedesignskills@web3d-integration-patterns -g -y
npx.cmd skills add openai/skills@netlify-deploy -g -y
```

Expected: each command reports the named skill installed. Read every installed `SKILL.md` before the first action it governs.

- [ ] **Step 3: Refresh implementation guidance with Context7**

Resolve and query the official Context7 libraries for:

```text
/vercel/next.js — Next.js 16 client-only dynamic imports and Server/Client Component boundaries
/mantinedev/mantine — Mantine 9 theme defaults, focus rings, and respectReducedMotion
/mrdoob/three.js — transparent renderer resize, pixel ratio, animation pause, and disposal
/websites/motion_dev — MotionConfig reducedMotion="user" and useReducedMotion
```

Expected: the selected implementation patterns still match the current official documentation. If a documented API changed, update this plan's code to the current API before implementation and commit the plan correction separately.

- [ ] **Step 4: Install runtime and test dependencies**

Run:

```powershell
npm.cmd install three@0.185.1 motion@12.42.2
npm.cmd install --save-dev @types/three@0.185.1 vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1
```

Expected: `package.json` and `package-lock.json` record the exact versions.

- [ ] **Step 5: Add test scripts**

Add these properties to `package.json` under `scripts`:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

The complete scripts object must be:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 6: Create the Vitest configuration**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
```

Create `src/test/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs TypeScript tests in jsdom', () => {
    expect(document.createElement('div')).toBeInstanceOf(HTMLDivElement);
  });
});
```

- [ ] **Step 7: Add project-scoped Supabase MCP**

Create `.codex/config.toml`:

```toml
[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp?project_ref=wglnrealznvbvybcoaja&read_only=true"
auth = "oauth"
enabled = true
required = false
default_tools_approval_mode = "prompt"
startup_timeout_sec = 20
tool_timeout_sec = 60
```

After writing the config, restart Codex so the project-scoped server is loaded. Authenticate through **Settings → MCP servers → supabase → Authenticate**, resume this plan, and use the MCP to list the `profiles`, `books`, `questions`, and `teacher_feedbacks` table columns. Confirm the schema matches `HANDOFF.md` without issuing any write query.

- [ ] **Step 8: Verify the harness**

Run:

```powershell
npm.cmd test
npm.cmd run lint
```

Expected: the smoke test PASS; ESLint exits `0`.

- [ ] **Step 9: Commit the setup**

Run:

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.ts .codex/config.toml
git commit -m "chore: add low-poly UI toolchain"
```

Expected: one commit containing only the five listed paths.

---

### Task 2: Theme Tokens and Reduced-Motion Providers

**Files:**
- Create: `src/theme.ts`
- Create: `src/theme.test.ts`
- Create: `src/app/Providers.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `motion/react` and Mantine 9.
- Produces: `theme`, `LOW_POLY_TOKENS`, and `Providers({ children })`.

- [ ] **Step 1: Write the failing theme test**

Create `src/theme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LOW_POLY_TOKENS, theme } from './theme';

describe('low-poly theme', () => {
  it('preserves role colors and reduced-motion support', () => {
    expect(LOW_POLY_TOKENS.student.accent).toBe('#7259d9');
    expect(LOW_POLY_TOKENS.teacher.accent).toBe('#356b9e');
    expect(LOW_POLY_TOKENS.surface.opaque).toBe('rgba(255,255,255,0.96)');
    expect(theme.respectReducedMotion).toBe(true);
    expect(theme.focusRing).toBe('auto');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npm.cmd test -- src/theme.test.ts
```

Expected: FAIL because `src/theme.ts` does not exist.

- [ ] **Step 3: Create exact tokens and theme**

Create `src/theme.ts`:

```ts
import { createTheme } from '@mantine/core';

export const LOW_POLY_TOKENS = {
  student: {
    accent: '#7259d9',
    deep: '#3f2b83',
    foliage: '#5c9f72',
    mist: '#f4f0ff',
  },
  teacher: {
    accent: '#356b9e',
    deep: '#183d69',
    slate: '#6b7fa3',
    mist: '#edf5ff',
  },
  warm: {
    sun: '#ffd45d',
    coral: '#ef876d',
  },
  surface: {
    opaque: 'rgba(255,255,255,0.96)',
    glass: 'rgba(255,255,255,0.94)',
    border: 'rgba(44,54,78,0.10)',
  },
} as const;

export const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily:
    '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  defaultRadius: 'lg',
  focusRing: 'auto',
  respectReducedMotion: true,
  cursorType: 'pointer',
  defaultGradient: { from: '#7259d9', to: '#4c6ef5', deg: 135 },
  colors: {
    indigo: [
      '#f3f0ff', '#e8e1ff', '#d2c4ff', '#b49cff', '#9575e7',
      '#7259d9', '#6249c6', '#523caf', '#443294', '#382a79',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { minHeight: 44, fontWeight: 800 } },
    },
    TextInput: {
      defaultProps: { radius: 'md', size: 'md' },
    },
    PasswordInput: {
      defaultProps: { radius: 'md', size: 'md' },
    },
    Modal: {
      defaultProps: { centered: true, radius: 'xl', overlayProps: { blur: 4 } },
    },
  },
});
```

- [ ] **Step 4: Create the provider boundary**

Create `src/app/Providers.tsx`:

```tsx
'use client';

import { MantineProvider } from '@mantine/core';
import { MotionConfig } from 'motion/react';
import { theme } from '@/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
        {children}
      </MotionConfig>
    </MantineProvider>
  );
}
```

Modify `src/app/layout.tsx` to import `Providers`, remove the local `theme`, and replace the existing `MantineProvider` block:

```tsx
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './Providers';
```

```tsx
<body>
  <Providers>{children}</Providers>
</body>
```

- [ ] **Step 5: Add global accessibility and motion rules**

Append to `src/app/globals.css`:

```css
:root {
  --lp-student-accent: #7259d9;
  --lp-teacher-accent: #356b9e;
  --lp-surface: rgba(255, 255, 255, 0.96);
  --lp-border: rgba(44, 54, 78, 0.1);
  --lp-text: #202a40;
}

:focus-visible {
  outline: 3px solid #ffd45d;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Replace the existing `transition: all 0.2s ease;` declaration in the `a, button` rule with:

```css
a,
button {
  transition: color 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
```

- [ ] **Step 6: Verify and commit**

Run:

```powershell
npm.cmd test -- src/theme.test.ts
npm.cmd run lint
```

Expected: theme test PASS; ESLint exits `0`.

Commit:

```powershell
git add src/theme.ts src/theme.test.ts src/app/Providers.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add low-poly theme foundation"
```

---

### Task 3: Low-Poly Scene Policy and Shared Visual Primitives

**Files:**
- Create: `src/components/low-poly/types.ts`
- Create: `src/components/low-poly/scene-policy.ts`
- Create: `src/components/low-poly/scene-policy.test.ts`
- Create: `src/components/low-poly/LowPolyBackdrop.tsx`
- Create: `src/components/low-poly/StorySurface.tsx`
- Create: `src/components/low-poly/low-poly.module.css`
- Create: `src/components/low-poly/index.ts`

**Interfaces:**
- Produces:
  - `type LowPolyVariant = 'login' | 'student' | 'teacher'`
  - `type SceneMode = 'static' | 'css' | 'webgl'`
  - `chooseSceneMode(input: ScenePolicyInput): SceneMode`
  - `LowPolyBackdrop(props: LowPolyBackdropProps)`
  - `StorySurface(props: StorySurfaceProps)`

- [ ] **Step 1: Write failing scene-policy tests**

Create `src/components/low-poly/scene-policy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { chooseSceneMode } from './scene-policy';

describe('chooseSceneMode', () => {
  it('uses a static poster when reduced motion is requested', () => {
    expect(chooseSceneMode({
      reducedMotion: true,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('static');
  });

  it('uses CSS motion on narrow screens', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 390,
      documentVisible: true,
    })).toBe('css');
  });

  it('uses WebGL on capable desktop screens', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('webgl');
  });

  it('falls back to CSS when WebGL is unavailable or the page is hidden', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: false,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('css');
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: false,
    })).toBe('css');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npm.cmd test -- src/components/low-poly/scene-policy.test.ts
```

Expected: FAIL because `scene-policy.ts` does not exist.

- [ ] **Step 3: Implement types and scene policy**

Create `src/components/low-poly/types.ts`:

```ts
export type LowPolyVariant = 'login' | 'student' | 'teacher';
export type SceneMode = 'static' | 'css' | 'webgl';

export type ScenePolicyInput = {
  reducedMotion: boolean;
  webGLAvailable: boolean;
  viewportWidth: number;
  documentVisible: boolean;
};

export type LowPolyBackdropProps = {
  variant: LowPolyVariant;
  scene?: boolean;
  children: React.ReactNode;
  className?: string;
};
```

Create `src/components/low-poly/scene-policy.ts`:

```ts
import type { SceneMode, ScenePolicyInput } from './types';

export function chooseSceneMode(input: ScenePolicyInput): SceneMode {
  if (input.reducedMotion) return 'static';
  if (!input.documentVisible) return 'css';
  if (!input.webGLAvailable) return 'css';
  if (input.viewportWidth < 768) return 'css';
  return 'webgl';
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Implement the readable surface**

Create `src/components/low-poly/StorySurface.tsx`:

```tsx
import { Paper, type PaperProps } from '@mantine/core';
import classes from './low-poly.module.css';

type StorySurfaceProps = PaperProps & {
  tone?: 'neutral' | 'student' | 'teacher' | 'warm';
};

export function StorySurface({
  tone = 'neutral',
  className,
  children,
  ...props
}: StorySurfaceProps) {
  return (
    <Paper
      {...props}
      className={`${classes.surface} ${classes[`surface_${tone}`]} ${className ?? ''}`}
    >
      {children}
    </Paper>
  );
}
```

- [ ] **Step 5: Implement the progressive backdrop**

Create `src/components/low-poly/LowPolyBackdrop.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { chooseSceneMode, supportsWebGL } from './scene-policy';
import type { LowPolyBackdropProps, SceneMode } from './types';
import classes from './low-poly.module.css';

const LowPolyScene = dynamic(() => import('./LowPolyScene'), {
  ssr: false,
  loading: () => null,
});

export function LowPolyBackdrop({
  variant,
  scene = true,
  children,
  className,
}: LowPolyBackdropProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [mode, setMode] = useState<SceneMode>('static');

  useEffect(() => {
    const update = () => {
      setMode(chooseSceneMode({
        reducedMotion,
        webGLAvailable: supportsWebGL(),
        viewportWidth: window.innerWidth,
        documentVisible: document.visibilityState === 'visible',
      }));
    };
    update();
    window.addEventListener('resize', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [reducedMotion]);

  return (
    <div className={`${classes.backdrop} ${classes[variant]} ${className ?? ''}`}>
      <div className={classes.poster} aria-hidden="true" />
      {mode !== 'static' && <div className={classes.polygonDrift} aria-hidden="true" />}
      {scene && mode === 'webgl' && <LowPolyScene variant={variant} />}
      <div className={classes.roleOverlay} aria-hidden="true" />
      <div className={classes.content}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: Add complete core CSS**

Create `src/components/low-poly/low-poly.module.css`:

```css
.backdrop {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  color: var(--lp-text);
}

.poster,
.polygonDrift,
.roleOverlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.poster {
  z-index: -4;
  background-position: center;
  background-size: cover;
}

.login .poster { background-image: url('/low-poly/login-forest.webp'); }
.student .poster { background-image: url('/low-poly/student-trail.webp'); }
.teacher .poster { background-image: url('/low-poly/teacher-observatory.webp'); }

.polygonDrift {
  z-index: -2;
  opacity: 0.28;
  background:
    conic-gradient(from 210deg at 12% 18%, transparent 0 18%, #ffd45d 19% 24%, transparent 25%),
    conic-gradient(from 40deg at 88% 74%, transparent 0 35%, #7259d9 36% 43%, transparent 44%);
  animation: polygon-drift 32s ease-in-out infinite alternate;
}

.roleOverlay {
  z-index: -1;
}

.login .roleOverlay {
  background: linear-gradient(135deg, rgba(24, 38, 48, 0.34), rgba(66, 42, 92, 0.24));
}

.student .roleOverlay {
  background: linear-gradient(160deg, rgba(246, 241, 255, 0.72), rgba(235, 247, 230, 0.82));
}

.teacher .roleOverlay {
  background: linear-gradient(160deg, rgba(237, 245, 255, 0.78), rgba(230, 234, 248, 0.86));
}

.content {
  position: relative;
  z-index: 1;
  min-height: inherit;
}

.surface {
  background: var(--lp-surface);
  border: 1px solid var(--lp-border);
  box-shadow: 0 18px 45px rgba(41, 49, 76, 0.14);
  backdrop-filter: blur(14px);
}

.surface_student { border-top: 3px solid #7259d9; }
.surface_teacher { border-top: 3px solid #356b9e; }
.surface_warm { border-top: 3px solid #ef876d; }
.surface_neutral { border-top: 3px solid rgba(44, 54, 78, 0.12); }

@keyframes polygon-drift {
  from { transform: translate3d(-1.5%, -1%, 0) scale(1); }
  to { transform: translate3d(1.5%, 1%, 0) scale(1.04); }
}

@media (max-width: 47.99em) {
  .polygonDrift { opacity: 0.18; }
  .surface { backdrop-filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .polygonDrift { animation: none; }
}
```

- [ ] **Step 7: Export the public interface**

Create `src/components/low-poly/index.ts`:

```ts
export { LowPolyBackdrop } from './LowPolyBackdrop';
export { StorySurface } from './StorySurface';
export { chooseSceneMode } from './scene-policy';
export type { LowPolyBackdropProps, LowPolyVariant, SceneMode } from './types';
```

- [ ] **Step 8: Verify and commit**

Run:

```powershell
npm.cmd test -- src/components/low-poly/scene-policy.test.ts
npm.cmd run lint
```

Expected: four tests PASS; ESLint exits `0`. `LowPolyScene` may still be missing, so do not run the production build until Task 4 creates it.

Commit:

```powershell
git add src/components/low-poly
git commit -m "feat: add low-poly visual primitives"
```

---

### Task 4: Lightweight Three.js World

**Files:**
- Create: `src/components/low-poly/create-low-poly-world.ts`
- Create: `src/components/low-poly/create-low-poly-world.test.ts`
- Create: `src/components/low-poly/LowPolyScene.tsx`

**Interfaces:**
- Consumes: `LowPolyVariant`.
- Produces:
  - `SCENE_PALETTES`
  - `createLowPolyWorld(scene, variant): THREE.Group`
  - `disposeLowPolyWorld(group): void`
  - default `LowPolyScene({ variant })`.

- [ ] **Step 1: Write failing palette tests**

Create `src/components/low-poly/create-low-poly-world.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SCENE_PALETTES } from './create-low-poly-world';

describe('SCENE_PALETTES', () => {
  it('keeps student and teacher worlds visually distinct', () => {
    expect(SCENE_PALETTES.student.accent).toBe(0x7259d9);
    expect(SCENE_PALETTES.teacher.accent).toBe(0x356b9e);
    expect(SCENE_PALETTES.login.sun).toBe(0xffd45d);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npm.cmd test -- src/components/low-poly/create-low-poly-world.test.ts
```

Expected: FAIL because `create-low-poly-world.ts` does not exist.

- [ ] **Step 3: Implement procedural low-poly geometry**

Create `src/components/low-poly/create-low-poly-world.ts` with:

```ts
import * as THREE from 'three';
import type { LowPolyVariant } from './types';

export const SCENE_PALETTES = {
  login: { rock: 0x8c739e, foliage: 0x68aa72, accent: 0x7259d9, sun: 0xffd45d },
  student: { rock: 0xa88fbd, foliage: 0x65a976, accent: 0x7259d9, sun: 0xffd45d },
  teacher: { rock: 0x7082a5, foliage: 0x4f8b78, accent: 0x356b9e, sun: 0xffd45d },
} as const;

function material(color: number) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.82 });
}

export function createLowPolyWorld(scene: THREE.Scene, variant: LowPolyVariant) {
  const palette = SCENE_PALETTES[variant];
  const world = new THREE.Group();
  world.name = 'low-poly-world';

  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  const treeGeometry = new THREE.ConeGeometry(0.62, 1.45, 7);
  const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6);
  const bookGeometry = new THREE.BoxGeometry(0.78, 1, 0.16, 1, 1, 1);

  const rocks = [
    [-4.8, -1.7, -2.2, 1.35],
    [-3.0, -2.0, -1.1, 0.82],
    [3.5, -1.8, -1.5, 1.08],
    [5.0, -1.5, -2.6, 1.5],
  ] as const;

  rocks.forEach(([x, y, z, scale]) => {
    const rock = new THREE.Mesh(rockGeometry.clone(), material(palette.rock));
    rock.position.set(x, y, z);
    rock.scale.setScalar(scale);
    world.add(rock);
  });

  [-2.1, 2.25].forEach((x, index) => {
    const tree = new THREE.Group();
    const crown = new THREE.Mesh(treeGeometry.clone(), material(palette.foliage));
    crown.position.y = 0.9;
    const trunk = new THREE.Mesh(trunkGeometry.clone(), material(0x9a674c));
    tree.add(crown, trunk);
    tree.position.set(x, -1.35, -1.25 - index * 0.35);
    world.add(tree);
  });

  const book = new THREE.Mesh(bookGeometry, material(palette.accent));
  book.name = 'floating-book';
  book.position.set(2.8, 0.45, 0);
  book.rotation.set(-0.1, -0.45, 0.12);
  world.add(book);

  scene.add(world);
  return world;
}

export function disposeLowPolyWorld(world: THREE.Group) {
  world.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((entry) => entry.dispose());
  });
  world.removeFromParent();
}
```

- [ ] **Step 4: Implement the transparent renderer**

Create `src/components/low-poly/LowPolyScene.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { LowPolyVariant } from './types';
import { createLowPolyWorld, disposeLowPolyWorld } from './create-low-poly-world';
import classes from './low-poly.module.css';

export default function LowPolyScene({ variant }: { variant: LowPolyVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 9);

    scene.add(new THREE.HemisphereLight(0xfff4d3, 0x29475a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(-4, 6, 5);
    scene.add(keyLight);

    const world = createLowPolyWorld(scene, variant);
    const floatingBook = world.getObjectByName('floating-book');
    let frame = 0;
    let visible = true;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (time: number) => {
      if (visible && document.visibilityState === 'visible') {
        const seconds = time * 0.001;
        world.rotation.y = Math.sin(seconds * 0.12) * 0.035;
        if (floatingBook) {
          floatingBook.position.y = 0.45 + Math.sin(seconds * 0.72) * 0.14;
          floatingBook.rotation.z = 0.12 + Math.sin(seconds * 0.45) * 0.045;
        }
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      disposeLowPolyWorld(world);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={classes.scene} aria-hidden="true" />;
}
```

Add to `low-poly.module.css`:

```css
.scene {
  position: fixed;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

- [ ] **Step 5: Verify WebGL isolation and commit**

Run:

```powershell
npm.cmd test -- src/components/low-poly/create-low-poly-world.test.ts
npm.cmd run lint
npm.cmd run build
```

Expected: palette test PASS; lint and build exit `0`; Next does not report `ssr: false` in a Server Component because the dynamic import lives in `LowPolyBackdrop.tsx`.

Commit:

```powershell
git add src/components/low-poly
git commit -m "feat: add lightweight low-poly 3D scene"
```

---

### Task 5: Generate and Register Low-Poly Image Assets

**Files:**
- Create: `public/low-poly/login-forest.webp`
- Create: `public/low-poly/student-trail.webp`
- Create: `public/low-poly/teacher-observatory.webp`
- Create: `public/low-poly/book-gem.webp`
- Create: `public/low-poly/question-gem.webp`
- Create: `public/low-poly/profile-gem.webp`
- Create: `src/lib/low-poly-assets.ts`
- Create: `src/lib/low-poly-assets.test.ts`
- Create: `src/components/low-poly/LowPolyIcon.tsx`
- Modify: `src/components/low-poly/index.ts`
- Create: `scripts/verify-low-poly-assets.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: attached reference image `C:/Users/목포AISW/Desktop/original-5112a411b9151831b90e580956d817d6.webp`.
- Produces: `LOW_POLY_ASSETS` and `LowPolyIcon({ name, size, alt })`.

- [ ] **Step 1: Generate three background assets with the `imagegen` skill**

Use the attached image as the visual reference and generate these compositions:

```text
login-forest.webp:
Wide 16:9 low-poly storybook forest entrance for a Korean elementary reading app,
faceted mauve rocks, warm yellow sunrise, green polygon trees, open center clearing,
no text, no logos, no people, calm child-friendly palette, visual detail concentrated
at the edges so a login card remains readable in the center.

student-trail.webp:
Wide 16:9 low-poly reading trail, lilac rocks, soft green ground, small faceted trees,
floating book-shaped gems near the far edges, bright center and low contrast behind
content, no text, no logos, no people.

teacher-observatory.webp:
Wide 16:9 low-poly observatory landscape, blue slate rocks, teal foliage, restrained
violet accents, quiet professional but friendly mood, visual detail only around the
outer edges, no text, no logos, no people.
```

Save final outputs under `public/low-poly/` with the exact filenames above.

- [ ] **Step 2: Generate three transparent icon assets with the `imagegen` skill**

Generate isolated transparent-background low-poly icons:

```text
book-gem.webp: a faceted purple-and-blue closed book with a warm gold page edge.
question-gem.webp: a faceted violet question mark emerging from a small open book.
profile-gem.webp: a friendly abstract faceted child/teacher profile gem without facial detail.
```

Use a centered square composition, no text, no drop shadow baked into the pixels, and save the exact filenames.

- [ ] **Step 3: Visually inspect every generated asset**

Open all six files with the local image viewer. Reject and regenerate any asset containing text, watermarks, photorealistic faces, center-heavy clutter, illegible transparency, or colors that conflict with the role palette.

- [ ] **Step 4: Write a failing registry test**

Create `src/lib/low-poly-assets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LOW_POLY_ASSETS } from './low-poly-assets';

describe('LOW_POLY_ASSETS', () => {
  it('uses local optimized files for every role and icon', () => {
    expect(LOW_POLY_ASSETS.background.login).toBe('/low-poly/login-forest.webp');
    expect(LOW_POLY_ASSETS.background.student).toBe('/low-poly/student-trail.webp');
    expect(LOW_POLY_ASSETS.background.teacher).toBe('/low-poly/teacher-observatory.webp');
    expect(Object.values(LOW_POLY_ASSETS.icon)).toHaveLength(3);
    expect(Object.values(LOW_POLY_ASSETS.icon).every((path) => path.startsWith('/low-poly/'))).toBe(true);
  });
});
```

- [ ] **Step 5: Run the registry test and verify failure**

Run:

```powershell
npm.cmd test -- src/lib/low-poly-assets.test.ts
```

Expected: FAIL because `low-poly-assets.ts` does not exist.

- [ ] **Step 6: Implement the registry and icon**

Create `src/lib/low-poly-assets.ts`:

```ts
export const LOW_POLY_ASSETS = {
  background: {
    login: '/low-poly/login-forest.webp',
    student: '/low-poly/student-trail.webp',
    teacher: '/low-poly/teacher-observatory.webp',
  },
  icon: {
    book: '/low-poly/book-gem.webp',
    question: '/low-poly/question-gem.webp',
    profile: '/low-poly/profile-gem.webp',
  },
} as const;

export type LowPolyIconName = keyof typeof LOW_POLY_ASSETS.icon;
```

Create `src/components/low-poly/LowPolyIcon.tsx`:

```tsx
import Image from 'next/image';
import { LOW_POLY_ASSETS, type LowPolyIconName } from '@/lib/low-poly-assets';

export function LowPolyIcon({
  name,
  size = 32,
  alt = '',
}: {
  name: LowPolyIconName;
  size?: number;
  alt?: string;
}) {
  return (
    <Image
      src={LOW_POLY_ASSETS.icon[name]}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
    />
  );
}
```

Add to `src/components/low-poly/index.ts`:

```ts
export { LowPolyIcon } from './LowPolyIcon';
```

- [ ] **Step 7: Add a deterministic asset guard**

Create `scripts/verify-low-poly-assets.mjs`:

```js
import { stat } from 'node:fs/promises';

const files = [
  'public/low-poly/login-forest.webp',
  'public/low-poly/student-trail.webp',
  'public/low-poly/teacher-observatory.webp',
  'public/low-poly/book-gem.webp',
  'public/low-poly/question-gem.webp',
  'public/low-poly/profile-gem.webp',
];

for (const file of files) {
  const info = await stat(file);
  if (info.size === 0) throw new Error(`${file} is empty`);
  if (info.size > 1_500_000) throw new Error(`${file} exceeds 1.5 MB`);
}

console.log(`Verified ${files.length} low-poly assets`);
```

Add to `package.json` scripts:

```json
"assets:verify": "node scripts/verify-low-poly-assets.mjs"
```

- [ ] **Step 8: Verify and commit**

Run:

```powershell
npm.cmd run assets:verify
npm.cmd test -- src/lib/low-poly-assets.test.ts
npm.cmd run lint
```

Expected: six assets verified; registry test PASS; ESLint exits `0`.

Commit:

```powershell
git add public/low-poly src/lib/low-poly-assets.ts src/lib/low-poly-assets.test.ts src/components/low-poly/LowPolyIcon.tsx src/components/low-poly/index.ts scripts/verify-low-poly-assets.mjs package.json package-lock.json
git commit -m "feat: add generated low-poly art assets"
```

---

### Task 6: Redesign the Login Entrance

**Files:**
- Create: `src/app/login/LoginPage.test.tsx`
- Create: `src/app/login/login.module.css`
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `LowPolyBackdrop`, `StorySurface`, `LowPolyIcon`.
- Preserves: `login(formData)` server action and the current email/password field names.

- [ ] **Step 1: Write a failing login rendering test**

Create `src/app/login/LoginPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import LoginPage from './page';

vi.mock('@/actions/auth', () => ({
  login: vi.fn(async () => ({ error: null })),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe('LoginPage', () => {
  it('keeps accessible login controls inside the storybook entrance', () => {
    render(<MantineProvider><LoginPage /></MantineProvider>);
    expect(screen.getByRole('heading', { name: '생각의 숲으로 들어가요' })).toBeInTheDocument();
    expect(screen.getByLabelText('아이디 (이메일)')).toHaveAttribute('name', 'email');
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('name', 'password');
    expect(screen.getByRole('button', { name: '탐험 시작하기' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npm.cmd test -- src/app/login/LoginPage.test.tsx
```

Expected: FAIL because the approved heading and button copy are absent.

- [ ] **Step 3: Replace the video shell with the low-poly entrance**

In `src/app/login/page.tsx`:

- Remove the `<video>` and video overlay.
- Remove the `ASSETS.intro` and `ASSETS.bookcover` usages.
- Import:

```tsx
import { LowPolyBackdrop, LowPolyIcon, StorySurface } from '@/components/low-poly';
import classes from './login.module.css';
```

- Use this outer structure while preserving `handleSubmit`, error handling, field names, and school footer:

```tsx
<LowPolyBackdrop variant="login" scene>
  <Box className={classes.schoolMark} visibleFrom="sm">
    <LowPolyIcon name="question" size={42} alt="" />
    <Text fw={800} c="white">목포임성초등학교</Text>
  </Box>

  <Container size={440} className={classes.center}>
    <StorySurface tone="warm" p={44} radius="xl">
      <Center mb="md"><LowPolyIcon name="book" size={84} alt="" /></Center>
      <Title order={1} ta="center" className={classes.title}>생각의 숲으로 들어가요</Title>
      <Text ta="center" className={classes.subtitle}>책을 읽고 나만의 질문을 발견해요</Text>
      <form action={handleSubmit}>
        {/* Keep the existing Alert, TextInput, PasswordInput, and loading state. */}
      </form>
    </StorySurface>
  </Container>

  <Text className={classes.footer}>
    Copyright© 목포임성초 서찬아. All rights reserved.
  </Text>
</LowPolyBackdrop>
```

Set the submit button label to `탐험 시작하기`; keep `type="submit"`, `loading`, `fullWidth`, and `IconLogin`.

- [ ] **Step 4: Add responsive login styles**

Create `src/app/login/login.module.css`:

```css
.center {
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding-block: 72px;
}

.schoolMark {
  position: fixed;
  z-index: 3;
  top: 22px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.42);
}

.title {
  color: #202a40;
  font-size: clamp(1.65rem, 4vw, 2.1rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.subtitle {
  margin: 6px 0 26px;
  color: #667085;
}

.footer {
  position: fixed;
  z-index: 3;
  bottom: 18px;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.52);
}

@media (max-width: 36em) {
  .center { padding: 24px 16px 56px; }
}
```

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm.cmd test -- src/app/login/LoginPage.test.tsx
npm.cmd run lint
npm.cmd run build
```

Expected: login test PASS; lint and build exit `0`.

Commit:

```powershell
git add src/app/login
git commit -m "feat: redesign the low-poly login entrance"
```

---

### Task 7: Redesign Student and Teacher Application Shells

**Files:**
- Create: `src/components/low-poly/role-presentation.ts`
- Create: `src/components/low-poly/role-presentation.test.ts`
- Create: `src/components/low-poly/role-shell.module.css`
- Modify: `src/app/student/layout.tsx`
- Modify: `src/app/teacher/layout.tsx`

**Interfaces:**
- Produces: `ROLE_PRESENTATION.student` and `ROLE_PRESENTATION.teacher`.
- Preserves: profile loading, `logout`, pathname matching, and all existing routes.

- [ ] **Step 1: Write the failing role-presentation test**

Create `src/components/low-poly/role-presentation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ROLE_PRESENTATION } from './role-presentation';

describe('ROLE_PRESENTATION', () => {
  it('keeps student and teacher navigation distinct', () => {
    expect(ROLE_PRESENTATION.student.title).toBe('BOOK돋움 질문도감');
    expect(ROLE_PRESENTATION.teacher.title).toBe('BOOK돋움 교사 관찰소');
    expect(ROLE_PRESENTATION.student.variant).toBe('student');
    expect(ROLE_PRESENTATION.teacher.variant).toBe('teacher');
  });
});
```

- [ ] **Step 2: Implement role presentation**

Create `src/components/low-poly/role-presentation.ts`:

```ts
export const ROLE_PRESENTATION = {
  student: {
    variant: 'student',
    title: 'BOOK돋움 질문도감',
    subtitle: '생각의 숲',
  },
  teacher: {
    variant: 'teacher',
    title: 'BOOK돋움 교사 관찰소',
    subtitle: '질문 관찰소',
  },
} as const;
```

- [ ] **Step 3: Add shared shell styles**

Create `src/components/low-poly/role-shell.module.css`:

```css
.header {
  border: 0;
  color: white;
  box-shadow: 0 7px 24px rgba(35, 42, 72, 0.2);
  backdrop-filter: blur(14px);
}

.studentHeader {
  background: linear-gradient(100deg, rgba(63, 43, 131, 0.97), rgba(114, 89, 217, 0.92));
}

.teacherHeader {
  background: linear-gradient(100deg, rgba(24, 61, 105, 0.97), rgba(53, 107, 158, 0.92));
}

.navItem {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 7px;
  padding: 8px 13px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: white;
}

.navItemActive {
  border-color: rgba(255,255,255,0.36);
  background: rgba(255,255,255,0.18);
  font-weight: 800;
}

.profile {
  min-height: 44px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 24px;
  background: rgba(255,255,255,0.13);
  color: white;
}
```

- [ ] **Step 4: Wrap the student shell**

In `src/app/student/layout.tsx`:

- Import `LowPolyBackdrop`, `LowPolyIcon`, `ROLE_PRESENTATION`, and `role-shell.module.css`.
- Keep the existing profile `useEffect`, loading state, nav routes, menu, and logout form.
- Replace the logo image with:

```tsx
<LowPolyIcon name="question" size={30} alt="" />
<Box>
  <Text size="lg" fw={900} c="white" visibleFrom="xs">
    {ROLE_PRESENTATION.student.title}
  </Text>
  <Text size="xs" c="white" opacity={0.72} visibleFrom="sm">
    {ROLE_PRESENTATION.student.subtitle}
  </Text>
</Box>
```

- Apply `classes.header` and `classes.studentHeader` to `AppShell.Header`.
- Apply `classes.navItem` and the active class to every navigation button.
- Replace the current `AppShell.Main` gradient with:

```tsx
<AppShell.Main>
  <LowPolyBackdrop variant="student" scene={false}>
    {children}
  </LowPolyBackdrop>
</AppShell.Main>
```

- [ ] **Step 5: Wrap the teacher shell**

Apply the same boundary to `src/app/teacher/layout.tsx`, using:

```tsx
<LowPolyIcon name="question" size={30} alt="" />
<Text size="lg" fw={900} c="white">
  {ROLE_PRESENTATION.teacher.title}
</Text>
```

Use `classes.teacherHeader`, preserve the `/teacher` dashboard route and profile/logout behavior, and wrap main content with:

```tsx
<LowPolyBackdrop variant="teacher" scene={false}>
  {children}
</LowPolyBackdrop>
```

- [ ] **Step 6: Verify and commit**

Run:

```powershell
npm.cmd test -- src/components/low-poly/role-presentation.test.ts
npm.cmd run lint
npm.cmd run build
```

Expected: role test PASS; lint and build exit `0`.

Commit:

```powershell
git add src/components/low-poly/role-presentation.ts src/components/low-poly/role-presentation.test.ts src/components/low-poly/role-shell.module.css src/app/student/layout.tsx src/app/teacher/layout.tsx
git commit -m "feat: redesign student and teacher shells"
```

---

### Task 8: Redesign All Student Content Pages

**Files:**
- Create: `src/app/student/student-pages.module.css`
- Create: `src/app/student/student-ui-contract.test.tsx`
- Modify: `src/app/student/books/BooksGrid.tsx`
- Modify: `src/app/student/books/[bookId]/QuestionForm.tsx`
- Modify: `src/app/student/history/HistoryView.tsx`

**Interfaces:**
- Consumes: `StorySurface`, `LowPolyIcon`, existing data props.
- Preserves: book navigation, question submission, AI feedback, question deletion, and history rendering.

- [ ] **Step 1: Write a student UI contract test**

Create `src/app/student/student-ui-contract.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import BooksGrid from './books/BooksGrid';
import HistoryView from './history/HistoryView';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe('student UI contract', () => {
  it('renders the approved books hero and a book action', () => {
    render(
      <MantineProvider>
        <BooksGrid
          books={[{ id: 1, title: '긴긴밤', author: '루리', cover_image_url: null, description: null }]}
          studentName="서별"
        />
      </MantineProvider>,
    );
    expect(screen.getByRole('heading', { name: '어떤 책에서 질문을 발견할까요?' })).toBeInTheDocument();
    expect(screen.getByText('긴긴밤')).toBeInTheDocument();
  });

  it('keeps an explicit empty history state', () => {
    render(<MantineProvider><HistoryView questions={[]} /></MantineProvider>);
    expect(screen.getByText('아직 작성한 질문이 없어요')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the contract test and verify failure**

Run:

```powershell
npm.cmd test -- src/app/student/student-ui-contract.test.tsx
```

Expected: FAIL because the approved books heading is absent.

- [ ] **Step 3: Add shared student page styles**

Create `src/app/student/student-pages.module.css`:

```css
.page { position: relative; padding-block: 34px 52px; }
.hero { margin-bottom: 24px; padding: clamp(20px, 4vw, 34px); }
.eyebrow { color: #7259d9; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
.title { color: #202a40; font-weight: 900; letter-spacing: -0.04em; }
.gridCard { height: 100%; overflow: hidden; transition: transform .22s ease, box-shadow .22s ease; }
.gridCard:hover { transform: translateY(-6px) rotateX(1deg); box-shadow: 0 22px 42px rgba(67,53,122,.18); }
.bookCover { border-radius: 10px 15px 15px 10px; box-shadow: -6px 10px 18px rgba(50,44,82,.2); }
.questionStage { margin-bottom: 18px; }
.historyItem { position: relative; overflow: hidden; }
.feedback { background: rgba(246,248,255,.96); }
@media (max-width: 36em) {
  .page { padding-block: 20px 36px; }
  .hero { padding: 20px; }
}
```

- [ ] **Step 4: Redesign `BooksGrid`**

In `BooksGrid.tsx`:

- Import `StorySurface`, `LowPolyIcon`, and `student-pages.module.css`.
- Add this hero before the grid:

```tsx
<StorySurface tone="student" className={classes.hero} radius="xl">
  <Text className={classes.eyebrow} size="xs">오늘의 독서 탐험</Text>
  <Title order={1} className={classes.title}>어떤 책에서 질문을 발견할까요?</Title>
  <Text c="dimmed">표지를 눌러 사실·궁금·라면 질문을 차근차근 만들어 봐요.</Text>
</StorySurface>
```

- Replace each outer `Card` with `StorySurface tone="student" className={classes.gridCard}`.
- Keep `Link href={`/student/books/${book.id}`}`, title, author, cover URL, and empty-cover behavior unchanged.
- Use `<LowPolyIcon name="book" size={64} alt="" />` when no cover image exists.
- Change the empty-state copy to `아직 만날 수 있는 책이 없어요` and keep it inside `StorySurface`.

- [ ] **Step 5: Redesign `QuestionForm` without changing behavior**

In `QuestionForm.tsx`:

- Import `StorySurface` and the student CSS.
- Replace the top book information paper with `StorySurface tone="student"`.
- Wrap the type-selection section, textarea section, loading state, AI result, and previous-question list in separate `StorySurface` components.
- Keep all state names, handlers, server-action calls, type values, result parsing, and router refresh behavior unchanged.
- Apply these exact section labels:

```tsx
<Text className={classes.eyebrow} size="xs">질문 씨앗 1</Text>
<Title order={3}>어떤 질문을 만들지 골라요</Title>
```

```tsx
<Text className={classes.eyebrow} size="xs">질문 씨앗 2</Text>
<Title order={3}>책을 떠올리며 질문을 적어요</Title>
```

```tsx
<Text className={classes.eyebrow} size="xs">생각이 자랐어요</Text>
<Title order={3}>AI 친구의 따뜻한 피드백</Title>
```

- Preserve the three type labels and colors exactly.

- [ ] **Step 6: Redesign `HistoryView`**

In `HistoryView.tsx`:

- Add a `StorySurface tone="student"` hero with heading `나의 독서 성장 지도`.
- Replace each record container with `StorySurface className={classes.historyItem}`.
- Keep question text, type badge, dates, AI feedback JSON parsing, teacher feedback, delete action, and router refresh unchanged.
- Set the empty heading to `아직 작성한 질문이 없어요` and supporting copy to `책을 골라 첫 번째 질문 씨앗을 심어 봐요.`

- [ ] **Step 7: Verify and commit**

Run:

```powershell
npm.cmd test -- src/app/student/student-ui-contract.test.tsx
npm.cmd run lint
npm.cmd run build
```

Expected: both student contract tests PASS; lint and build exit `0`.

Commit:

```powershell
git add src/app/student
git commit -m "feat: redesign all student reading pages"
```

---

### Task 9: Redesign All Teacher Content Pages

**Files:**
- Create: `src/app/teacher/teacher-pages.module.css`
- Create: `src/app/teacher/teacher-ui-contract.test.tsx`
- Modify: `src/app/teacher/TeacherDashboard.tsx`
- Modify: `src/app/teacher/books/[bookId]/BookQuestionsView.tsx`
- Modify: `src/app/teacher/students/[studentId]/StudentQuestionsView.tsx`

**Interfaces:**
- Consumes: `StorySurface`, `LowPolyIcon`, existing dashboard and detail props.
- Preserves: charts, navigation, deletes, feedback modal, AI diagnosis, and HWPX download.

- [ ] **Step 1: Write a teacher UI contract test**

Create `src/app/teacher/teacher-ui-contract.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import TeacherDashboard from './TeacherDashboard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

describe('teacher UI contract', () => {
  it('renders the observation-station hero and summary statistics', () => {
    render(
      <MantineProvider>
        <TeacherDashboard
          books={[]}
          students={[]}
          studentQuestionCounts={{}}
          bookQuestionCounts={{}}
          questionsData={[]}
        />
      </MantineProvider>,
    );
    expect(screen.getByRole('heading', { name: '학생들의 생각이 이렇게 자랐어요' })).toBeInTheDocument();
    expect(screen.getByText('전체 질문')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the contract test and verify failure**

Run:

```powershell
npm.cmd test -- src/app/teacher/teacher-ui-contract.test.tsx
```

Expected: FAIL because the approved observation-station heading is absent.

- [ ] **Step 3: Add shared teacher page styles**

Create `src/app/teacher/teacher-pages.module.css`:

```css
.page { position: relative; padding-block: 34px 52px; }
.hero { margin-bottom: 24px; padding: clamp(20px, 4vw, 34px); }
.eyebrow { color: #356b9e; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.title { color: #202a40; font-weight: 900; letter-spacing: -.04em; }
.stat { min-height: 118px; position: relative; overflow: hidden; }
.chart { overflow: hidden; }
.listItem { transition: transform .2s ease, box-shadow .2s ease; }
.listItem:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgba(42,61,90,.14); }
.feedback { background: rgba(242,249,245,.96); }
@media (max-width: 36em) {
  .page { padding-block: 20px 36px; }
  .hero { padding: 20px; }
}
```

- [ ] **Step 4: Redesign `TeacherDashboard`**

- Add a `StorySurface tone="teacher"` hero:

```tsx
<Text className={classes.eyebrow} size="xs">오늘의 질문 관찰</Text>
<Title order={1} className={classes.title}>학생들의 생각이 이렇게 자랐어요</Title>
<Text c="dimmed">질문 분포와 최근 활동을 살펴보고 따뜻한 피드백을 남겨요.</Text>
```

- Convert statistic, chart, recent-question, book, and student-ranking containers to `StorySurface`.
- Keep all existing counts, chart data, sort order, links, badges, and empty states unchanged.
- Use `tone="teacher"` for dashboard surfaces and keep green/yellow status colors where they communicate state.

- [ ] **Step 5: Redesign `BookQuestionsView`**

- Replace the top book information panel with `StorySurface tone="teacher"`.
- Replace each question row and the empty state with `StorySurface`.
- Keep question deletion confirmation, teacher feedback modal, feedback submission, AI feedback accordion, and all type color mappings unchanged.
- Use the heading `책 속 질문 아카이브`.

- [ ] **Step 6: Redesign `StudentQuestionsView`**

- Replace the student summary, each grouped book section, AI diagnosis panel, and modal contents with `StorySurface`.
- Keep grouping by book, AI diagnosis call, result fields, HWPX form submission, feedback submission, deletion, and router refresh unchanged.
- Use heading `학생 생각 성장 기록` and retain the student's real name and class label.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
npm.cmd test -- src/app/teacher/teacher-ui-contract.test.tsx
npm.cmd run lint
npm.cmd run build
```

Expected: teacher contract test PASS; lint and build exit `0`.

Commit:

```powershell
git add src/app/teacher
git commit -m "feat: redesign all teacher observation pages"
```

---

### Task 10: Accessibility, Motion, Functional, and Visual Verification

**Files:**
- Modify only files that fail a concrete verification check.

**Interfaces:**
- Consumes: complete redesigned UI.
- Produces: verified desktop/mobile/reduced-motion/WebGL-fallback behavior with no functional regressions.

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
npm.cmd run assets:verify
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: all four commands exit `0`; no test is skipped; no asset exceeds 1.5 MB.

- [ ] **Step 2: Start the production-like local app**

Run in a hidden background process and save its PID outside the repository:

```powershell
$devProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev') -WindowStyle Hidden -PassThru
$devProcess.Id | Set-Content -LiteralPath (Join-Path $env:TEMP 'mokpo-low-poly-dev.pid')
```

Expected: Next.js reports a ready URL and `.env.local` provides Supabase and Gemini variables without printing their values.

- [ ] **Step 3: Inspect the public login screen**

Using the in-app Browser, inspect `http://localhost:3000/login` at:

- Desktop: `1440 × 900`
- Mobile: `390 × 844`

Verify:

- heading and fields are visible without scrolling on desktop;
- card remains readable on mobile;
- background never covers inputs or button;
- focus rings are visible;
- decorative canvas does not receive pointer events.

Capture screenshots to a temporary verification directory outside Git staging.

- [ ] **Step 4: Authenticate for protected-page verification**

Ask the user to sign in once in the in-app Browser using a valid student account, inspect `/student/books`, one `/student/books/[bookId]`, and `/student/history`, then sign out and repeat with a valid teacher account for `/teacher`, one book detail, and one student detail.

Never request credentials in chat and never inspect browser password storage.

- [ ] **Step 5: Verify reduced-motion behavior**

Emulate `prefers-reduced-motion: reduce` in the browser and reload login, student books, and teacher dashboard.

Expected:

- no continuous CSS polygon animation;
- no Three.js canvas;
- static posters remain visible;
- buttons, fields, charts, and navigation remain usable.

- [ ] **Step 6: Verify the WebGL fallback**

Block WebGL context creation in browser test setup and reload `/login`.

Expected: the static login poster and CSS overlay render; no uncaught error reaches the page; the login form works.

- [ ] **Step 7: Verify existing functional flows**

With user-approved test accounts:

1. Student selects a book and opens the question form.
2. Student selects each existing question type and confirms the submitted code remains unchanged.
3. Student submits one test question and sees AI loading, feedback, and encouragement.
4. Student views history and leaves the created test question in place for the teacher flow.
5. Teacher opens the dashboard, book detail, and student detail.
6. Teacher submits feedback on the test question created in step 3.
7. Teacher runs AI diagnosis and starts an HWPX download.
8. Teacher deletes only the test question created in step 3 and confirms it disappears.

Do not modify or delete unrelated production records.

- [ ] **Step 8: Run web-design guideline review**

Invoke the installed `web-design-guidelines` skill against all changed UI files. Fix only concrete findings related to contrast, focus, semantics, responsive layout, motion, or obscured content.

- [ ] **Step 9: Re-run verification after fixes**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
$devPid = Get-Content -LiteralPath (Join-Path $env:TEMP 'mokpo-low-poly-dev.pid')
Stop-Process -Id $devPid
```

Expected: all commands exit `0`.

- [ ] **Step 10: Commit verification fixes**

Stage only files changed in response to recorded verification failures:

```powershell
git add src public scripts package.json package-lock.json
git commit -m "fix: harden low-poly UI accessibility and fallbacks"
```

If no file changed, do not create an empty commit.

---

### Task 11: Documentation, Review, GitHub Push, and Netlify Production Deploy

**Files:**
- Modify: `design.md`
- Modify: `HANDOFF.md`
- Modify: `DEPLOY.md`

**Interfaces:**
- Consumes: verified implementation branch.
- Produces: reviewed documentation, merged `main`, GitHub push, and production deployment at `https://mokpo-imsung-v1.netlify.app`.

- [ ] **Step 1: Update `design.md`**

Replace the old soft-gradient-only guidance with the approved B-pattern rules:

```markdown
## 로우폴리 하이브리드 스토리북

- 공통 배경은 `LowPolyBackdrop`을 사용한다.
- 학생은 보라·초록 생각의 숲, 교사는 파랑·청회색 질문 관찰소를 사용한다.
- 텍스트·입력·차트 표면은 `StorySurface`를 사용하고 최소 94% 불투명도를 유지한다.
- 배경과 캔버스는 `pointer-events: none`이어야 한다.
- 지속 모션은 `prefers-reduced-motion`에서 중지한다.
- WebGL은 장식용 점진적 향상이며 정적 포스터가 항상 폴백으로 존재한다.
```

Keep the factual/inferential/evaluative mapping table.

- [ ] **Step 2: Update `HANDOFF.md`**

In §9, record:

```markdown
- [x] 전체 페이지 B안 하이브리드 로우폴리 UI 적용
- [x] 정적 포스터·CSS 모션·Three.js 점진적 향상 적용
- [x] 모션 감소 및 WebGL 실패 폴백 검증
- [x] Supabase MCP 프로젝트 범위·읽기 전용 설정 추가
- [ ] Netlify `mokpo-imsung-v1` 프로덕션 배포 확인
```

Update the final update date to `2026-07-18` and replace old Netlify target references with `mokpo-imsung-v1` where they describe the active production target.

- [ ] **Step 3: Update `DEPLOY.md`**

Record the exact production target:

```markdown
- Netlify site name: `mokpo-imsung-v1`
- Netlify site ID: `8217888f-3b1e-4e42-b62c-e21bccf4353e`
- Production URL: `https://mokpo-imsung-v1.netlify.app`
```

Keep all credentials in environment variables and never write token values.

- [ ] **Step 4: Commit documentation**

Run:

```powershell
git add design.md HANDOFF.md DEPLOY.md
git commit -m "docs: document the low-poly design system"
```

- [ ] **Step 5: Request code review**

Invoke `superpowers:requesting-code-review` and review the complete diff from `316e595` to `HEAD`. Resolve every confirmed high- or medium-priority finding, rerun tests, and commit fixes with:

```powershell
git add -u src public scripts package.json package-lock.json design.md HANDOFF.md DEPLOY.md
git add src/**/*.test.ts src/**/*.test.tsx
git commit -m "fix: address low-poly UI review findings"
```

If the review produces no file changes, skip this commit.

- [ ] **Step 6: Run verification-before-completion**

Invoke `superpowers:verification-before-completion`, then run:

```powershell
npm.cmd run assets:verify
npm.cmd test
npm.cmd run lint
npm.cmd run build
git status --short
git log --oneline -12
```

Expected: all verification commands exit `0`; status contains no unintended files in the implementation worktree.

- [ ] **Step 7: Integrate the implementation branch**

Invoke `superpowers:finishing-a-development-branch`. Merge `codex/low-poly-ui-redesign` into local `main` without discarding the user-owned dirty files in the original checkout.

Expected: `main` contains the design commit and every verified implementation commit.

- [ ] **Step 8: Push GitHub first**

Run from the main checkout:

```powershell
git remote get-url origin
git push origin main
```

Expected:

```text
https://github.com/gud8238/mokpo-imsung-app
```

and the push reports `main -> main`.

- [ ] **Step 9: Link the exact Netlify project**

Run:

```powershell
netlify.cmd link --id 8217888f-3b1e-4e42-b62c-e21bccf4353e
netlify.cmd status
```

Expected:

```text
Current project: mokpo-imsung-v1
Project URL: https://mokpo-imsung-v1.netlify.app
Project Id: 8217888f-3b1e-4e42-b62c-e21bccf4353e
```

- [ ] **Step 10: Deploy production with the CLI**

Run:

```powershell
netlify.cmd deploy --build --prod --site 8217888f-3b1e-4e42-b62c-e21bccf4353e
```

Expected: deploy state is ready and the production URL is `https://mokpo-imsung-v1.netlify.app`.

- [ ] **Step 11: Verify the deployed site**

Run:

```powershell
$response = Invoke-WebRequest -Uri 'https://mokpo-imsung-v1.netlify.app/login' -UseBasicParsing
$response.StatusCode
```

Expected: `200`.

Open the production URL in the in-app Browser and verify:

- low-poly login poster and form;
- no missing asset requests;
- responsive mobile layout;
- reduced-motion static fallback;
- student and teacher protected routes redirect correctly when signed out.

- [ ] **Step 12: Record final deployment evidence**

After the production URL passes verification, change the remaining `HANDOFF.md` item to:

```markdown
- [x] Netlify `mokpo-imsung-v1` 프로덕션 배포 확인
```

Commit and push only that status update:

```powershell
git add HANDOFF.md
git commit -m "docs: record low-poly production deployment"
git push origin main
```

Run:

```powershell
netlify.cmd status
git rev-parse HEAD
git status --short --branch
```

Expected: Netlify is linked to `mokpo-imsung-v1`, Git reports the pushed commit, and only pre-existing user-owned changes remain in the original checkout.
