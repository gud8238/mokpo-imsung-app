# Login Scene Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove only the login page's four rocks, two trees, and floating book while preserving the GIF, login card, school mark, and copyright.

**Architecture:** Disable the optional WebGL scene at the login page call site by passing `scene={false}` to `LowPolyBackdrop`. Keep the shared backdrop and world-generation modules unchanged so student and teacher pages retain their current behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library

## Global Constraints

- Preserve `public/backgrounds/login-forest.gif`.
- Preserve the login card's internal book icon.
- Preserve the upper-right school mark and bottom copyright.
- Do not modify shared WebGL geometry or student/teacher scene behavior.
- Do not generate or add raster assets.

---

### Task 1: Disable the Login WebGL Scene

**Files:**
- Modify: `src/app/login/LoginPage.test.tsx`
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `LowPolyBackdropProps.scene?: boolean`
- Produces: a login page that renders `LowPolyBackdrop` with `scene={false}`

- [ ] **Step 1: Write the failing regression test**

Add this test to `src/app/login/LoginPage.test.tsx`:

```tsx
it('disables only the login WebGL decoration scene', () => {
  const page = readFileSync('src/app/login/page.tsx', 'utf8');

  expect(page).toContain('<LowPolyBackdrop variant="login" scene={false}>');
  expect(page).toContain('<Box className={classes.schoolMark} visibleFrom="sm">');
  expect(page).toContain('<Text className={classes.footer}>');
  expect(page).toContain('<LowPolyIcon name="book" size={84} alt="" />');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm.cmd test -- src/app/login/LoginPage.test.tsx
```

Expected: FAIL because the login page still contains `scene` rather than `scene={false}`.

- [ ] **Step 3: Implement the minimal change**

Change the opening backdrop in `src/app/login/page.tsx`:

```tsx
<LowPolyBackdrop variant="login" scene={false}>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm.cmd test -- src/app/login/LoginPage.test.tsx
```

Expected: all `LoginPage` tests pass.

### Task 2: Document and Verify the Change

**Files:**
- Modify: `HANDOFF.md`

**Interfaces:**
- Consumes: the verified login scene behavior from Task 1
- Produces: current handoff documentation and a deployable build

- [ ] **Step 1: Update the handoff**

Append a concise note that the login page now disables its WebGL scene, removing only the four rocks, two trees, and floating book while retaining the GIF, login card icon, school mark, and copyright.

- [ ] **Step 2: Run complete verification**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: all tests pass, ESLint exits 0, the Next.js production build succeeds, and `git diff --check` reports no errors.

- [ ] **Step 3: Commit the implementation**

Stage only:

```powershell
git add -- src/app/login/LoginPage.test.tsx src/app/login/page.tsx HANDOFF.md
git commit -m "fix: remove login scene decorations"
```

- [ ] **Step 4: Push and verify production**

Push `main`, wait for the Netlify GitHub Actions workflow, then verify:

- `/login` returns HTTP 200.
- `/backgrounds/login-forest.gif` returns `image/gif`.
- The login page has no WebGL canvas.
- The login card, school mark, copyright, and internal book icon remain visible.
