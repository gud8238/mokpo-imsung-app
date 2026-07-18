import { readFileSync } from 'node:fs';
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
    expect(screen.getByTestId('login-card')).toBeInTheDocument();

    const email = screen.getByLabelText(/아이디 \(이메일\)/);
    expect(email).toHaveAttribute('name', 'email');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'username');
    expect(email).toHaveAttribute('spellcheck', 'false');

    const password = screen.getByLabelText(/비밀번호/);
    expect(password).toHaveAttribute('name', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: '탐험 시작하기' })).toBeInTheDocument();
  });

  it('keeps the mobile footer below the expanded login content', () => {
    const styles = readFileSync('src/app/login/login.module.css', 'utf8');

    expect(styles).toMatch(/@media \(max-width: 36em\) \{[\s\S]*?\.footer \{[\s\S]*?position: absolute;[\s\S]*?bottom: 16px;[\s\S]*?padding-inline: 16px;[\s\S]*?box-sizing: border-box;[\s\S]*?\}/);
  });
});
