import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import LoginPage from './page';

vi.mock('@/actions/auth', () => ({
  login: vi.fn(async () => ({ error: null })),
}));

vi.mock('@/components/low-poly', async () => {
  const actual = await vi.importActual<typeof import('@/components/low-poly')>(
    '@/components/low-poly',
  );

  return {
    ...actual,
    LowPolyBackdrop: ({
      variant,
      scene,
      children,
    }: {
      variant: string;
      scene?: boolean;
      children: React.ReactNode;
    }) => (
      <div
        data-testid="low-poly-backdrop"
        data-variant={variant}
        data-scene={String(scene)}
      >
        {children}
      </div>
    ),
    LowPolyIcon: ({
      name,
      size,
    }: {
      name: string;
      size?: number;
      alt?: string;
    }) => (
      <span
        aria-hidden="true"
        data-testid={`low-poly-icon-${name}`}
        data-size={size}
      />
    ),
  };
});

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

    expect(styles).toMatch(/@media \(max-width: 36em\) \{[\s\S]*?\.footer \{[\s\S]*?position: absolute;[\s\S]*?bottom: max\(16px, env\(safe-area-inset-bottom\)\);[\s\S]*?padding-inline: 16px;[\s\S]*?box-sizing: border-box;[\s\S]*?\}/);
  });

  it('uses the supplied animated forest and a translucent white glass card', () => {
    const backdropStyles = readFileSync('src/components/low-poly/low-poly.module.css', 'utf8');
    const loginStyles = readFileSync('src/app/login/login.module.css', 'utf8');

    expect(backdropStyles).toContain(".login .poster { background-image: url('/backgrounds/login-forest.gif'); }");
    expect(loginStyles).toContain('background: rgba(255, 255, 255, 0.68);');
    expect(loginStyles).toContain('backdrop-filter: blur(24px) saturate(130%);');
    expect(backdropStyles).toMatch(/prefers-reduced-motion:[\s\S]*\.login \.poster[\s\S]*login-forest\.webp/);
  });

  it('disables only the login WebGL decoration scene', () => {
    render(<MantineProvider><LoginPage /></MantineProvider>);

    const backdrop = screen.getByTestId('low-poly-backdrop');
    expect(backdrop).toHaveAttribute('data-variant', 'login');
    expect(backdrop).toHaveAttribute('data-scene', 'false');
    expect(screen.getByText('목포임성초등학교')).toBeInTheDocument();
    expect(screen.getByText(/Copyright© 목포임성초 서찬아/)).toBeInTheDocument();
    expect(
      within(screen.getByTestId('login-card')).getByTestId('low-poly-icon-book'),
    ).toHaveAttribute('data-size', '84');
  });
});
