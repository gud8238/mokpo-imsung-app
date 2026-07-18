import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import TeacherDashboard from './TeacherDashboard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

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

  it('keeps role pages glassy enough for the low-poly backgrounds to remain visible', () => {
    const surfaces = readFileSync(resolve(process.cwd(), 'src/components/low-poly/low-poly.module.css'), 'utf8');

    expect(surfaces).toContain('background: rgba(255, 255, 255, 0.74);');
    expect(surfaces).not.toContain('border-top: 3px solid');
    expect(surfaces).not.toMatch(/@media \(max-width: 47\.99em\)[\s\S]*backdrop-filter: none/);
  });
});
