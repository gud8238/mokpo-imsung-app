import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import LoginPage from './page';

vi.mock('@/actions/auth', () => ({
  login: vi.fn(async () => ({ error: null })),
}));

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt} />
  ),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

describe('LoginPage', () => {
  it('keeps accessible login controls inside the storybook entrance', () => {
    render(<MantineProvider><LoginPage /></MantineProvider>);

    expect(screen.getByRole('heading', { name: '생각의 숲으로 들어가요' })).toBeInTheDocument();
    expect(screen.getByLabelText(/아이디 \(이메일\)/)).toHaveAttribute('name', 'email');
    expect(screen.getByLabelText(/비밀번호/)).toHaveAttribute('name', 'password');
    expect(screen.getByRole('button', { name: '탐험 시작하기' })).toBeInTheDocument();
  });
});
