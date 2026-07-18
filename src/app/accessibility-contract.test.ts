import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('low-poly accessibility contract', () => {
  it('keeps the student question form keyboard-operable and labelled', () => {
    const questionForm = source('src/app/student/books/[bookId]/QuestionForm.tsx');

    expect(questionForm).toContain('role="radiogroup"');
    expect(questionForm).toContain('role="radio"');
    expect(questionForm).toContain('aria-checked={isSelected}');
    expect(questionForm).toContain('type="button"');
    expect(questionForm).toContain('aria-label="질문 내용"');
    expect(questionForm).toContain('<Title order={1} size="h3"');
  });

  it('labels teacher actions and feedback inputs', () => {
    for (const path of [
      'src/app/teacher/books/[bookId]/BookQuestionsView.tsx',
      'src/app/teacher/students/[studentId]/StudentQuestionsView.tsx',
    ]) {
      const view = source(path);
      expect(view).toContain('aria-label="피드백 작성"');
      expect(view).toContain('aria-label="질문 삭제"');
      expect(view).toContain('aria-label="학생에게 전할 피드백"');
    }
  });

  it('keeps student diagnostic modal headings in sequence', () => {
    const view = source('src/app/teacher/students/[studentId]/StudentQuestionsView.tsx');

    expect(view).toContain('title={<Title order={2} size="h3">📝 피드백 작성</Title>}');
    expect(view).toContain('<Title order={2} size="h3">AI 질문 수준 진단</Title>');
    expect(view).toContain('<Title order={3} size="h5"');
  });

  it('provides skip links and a safe mobile login footer', () => {
    for (const path of ['src/app/student/layout.tsx', 'src/app/teacher/layout.tsx']) {
      const layout = source(path);
      expect(layout).toContain('href="#');
      expect(layout).toContain('className={classes.skipLink}');
      expect(layout).toContain('<AppShell.Main id=');
    }

    const loginCss = source('src/app/login/login.module.css');
    expect(loginCss).toContain('env(safe-area-inset-bottom)');
  });

  it('reserves book-cover space before lazy images load', () => {
    const grid = source('src/app/student/books/BooksGrid.tsx');
    const css = source('src/app/student/student-pages.module.css');

    expect(grid).toContain('loading="lazy"');
    expect(grid).toContain('className={classes.bookCoverFrame}');
    expect(css).toContain('aspect-ratio: 3 / 4');
  });
});
