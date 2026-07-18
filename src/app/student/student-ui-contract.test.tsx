/* eslint-disable @next/next/no-img-element */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import BooksGrid from './books/BooksGrid';
import HistoryView from './history/HistoryView';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
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

  it('keeps student text surfaces on readable backgrounds', () => {
    const questionFormSource = readFileSync(
      resolve(process.cwd(), 'src/app/student/books/[bookId]/QuestionForm.tsx'),
      'utf8',
    );
    const historyViewSource = readFileSync(
      resolve(process.cwd(), 'src/app/student/history/HistoryView.tsx'),
      'utf8',
    );

    expect(questionFormSource).not.toContain("background: 'linear-gradient(135deg, rgba(76,110,245,0.05), rgba(121,80,242,0.05))'");
    expect(questionFormSource).not.toContain("style={{ background: 'rgba(76,110,245,0.05)' }}");
    expect(questionFormSource).toContain("'linear-gradient(135deg, #f0fff4, #f8fff9)'");
    expect(questionFormSource).toContain("'linear-gradient(135deg, #fff9db, #fffdf4)'");
    expect(historyViewSource).not.toContain("style={{ background: 'rgba(76,110,245,0.05)' }}");
  });

  it('asks for the question before asking for its type', () => {
    const questionFormSource = readFileSync(
      resolve(process.cwd(), 'src/app/student/books/[bookId]/QuestionForm.tsx'),
      'utf8',
    );

    const questionStage = questionFormSource.indexOf('책을 떠올리며 질문을 적어요');
    const typeStage = questionFormSource.indexOf('질문의 종류를 골라요');

    expect(questionStage).toBeGreaterThan(-1);
    expect(typeStage).toBeGreaterThan(questionStage);
  });

  it('renders book list and history as matching navigation buttons', () => {
    const layoutSource = readFileSync(resolve(process.cwd(), 'src/app/student/layout.tsx'), 'utf8');

    expect(layoutSource).toContain("{ href: '/student/books', label: '책 목록'");
    expect(layoutSource).toContain("{ href: '/student/history', label: '내 기록'");
    expect(layoutSource.match(/className={`\$\{classes\.navItem\}/g)).toHaveLength(1);
    expect(layoutSource).not.toContain("label: '내 기록', icon: ASSETS.book, compact: true");
  });
});
