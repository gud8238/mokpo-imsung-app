/* eslint-disable @next/next/no-img-element */
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
});
