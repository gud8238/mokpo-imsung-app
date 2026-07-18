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
    expect(questionForm).toContain('tabIndex={selectedType === null ? (index === 0 ? 0 : -1) : (isSelected ? 0 : -1)}');
    expect(questionForm).toContain('onKeyDown={(event) => handleQuestionTypeKeyDown(event, index)}');
    expect(questionForm).toContain("case 'ArrowRight':");
    expect(questionForm).toContain("case 'Home':");
    expect(questionForm).toContain('selectQuestionType(nextIndex);');
    expect(questionForm).toContain('questionTypeRefs.current[index]?.focus()');
    expect(questionForm).toContain('aria-label="질문 내용"');
    expect(questionForm).toContain('<Title order={1} size="h3"');
    expect(questionForm).toContain('<Title order={2} size="h3" className={classes.title} mb="md">AI 친구의 따뜻한 피드백</Title>');
    expect(questionForm).toContain('<Title order={2} size="h5" c="dark.7" mb="md">');
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

  it('keeps teacher icon actions at a touch-friendly size', () => {
    for (const path of [
      'src/app/teacher/books/[bookId]/BookQuestionsView.tsx',
      'src/app/teacher/students/[studentId]/StudentQuestionsView.tsx',
    ]) {
      expect(source(path)).toContain('size="xl"');
    }
  });

  it('keeps post-hero headings sequential without shrinking their visual hierarchy', () => {
    const dashboard = source('src/app/teacher/TeacherDashboard.tsx');
    const history = source('src/app/student/history/HistoryView.tsx');

    expect(dashboard).not.toContain('<Title order={4} className={classes.title}>');
    expect(dashboard).toContain('<Title order={2} size="h4" className={classes.title}>학급별 질문 유형 통계</Title>');
    expect(history).not.toContain('<Title order={3} className={classes.title} mt="md">');
    expect(history).toContain('<Title order={2} size="h3" className={classes.title} mt="md">');
  });

  it('uses targeted transitions for question choices and their icon treatment', () => {
    const globals = source('src/app/globals.css');
    const form = source('src/app/student/books/[bookId]/QuestionForm.tsx');

    expect(globals).not.toContain('transition: all 0.3s ease;');
    expect(globals).toContain('transition: transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;');
    expect(form).not.toContain("transition: 'all 0.3s'");
    expect(form).toContain("transition: 'background-color 0.3s ease, color 0.3s ease'");
  });

  it('keeps student diagnostic modal headings in sequence', () => {
    const view = source('src/app/teacher/students/[studentId]/StudentQuestionsView.tsx');

    expect(view).toContain('title={<Title order={2} size="h3">📝 피드백 작성</Title>}');
    expect(view).toContain('<Title order={2} size="h3">AI 질문 수준 진단</Title>');
    expect(view).toContain('<Title order={3} size="h5"');
  });

  it('downloads AI diagnosis as PDF without the legacy HWPX path', () => {
    const view = source('src/app/teacher/students/[studentId]/StudentQuestionsView.tsx');
    const packageJson = source('package.json');

    expect(view).toContain("fetch('/api/download-pdf'");
    expect(view).toContain('결과 보고서 다운로드 (PDF)');
    expect(view).not.toContain('download-hwpx');
    expect(view).not.toContain('HWPX');
    expect(packageJson).not.toContain('md2hwp');
  });

  it('provides skip links and a safe mobile login footer', () => {
    for (const path of ['src/app/student/layout.tsx', 'src/app/teacher/layout.tsx']) {
      const layout = source(path);
      expect(layout).toContain('href="#');
      expect(layout).toContain('className={classes.skipLink}');
      expect(layout).toContain('<AppShell.Main id=');
      expect(layout).toContain('tabIndex={-1}');
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

  it('keeps compact teacher controls named and decorative artwork silent', () => {
    const layout = source('src/app/teacher/layout.tsx');

    expect(layout).toContain('aria-label="대시보드"');
    expect(layout).toContain('aria-label="교사 메뉴"');
    expect(layout).toContain('alt=""');
  });

  it('does not skip from the book archive h1 to an h3 section', () => {
    const view = source('src/app/teacher/books/[bookId]/BookQuestionsView.tsx');

    expect(view).toContain('<Title order={2} size="h3" className={classes.title} mb={4}>{book.title}</Title>');
  });
});
