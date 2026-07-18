import { describe, expect, it } from 'vitest';
import { LOW_POLY_TOKENS, theme } from './theme';

describe('low-poly theme', () => {
  it('preserves role colors and reduced-motion support', () => {
    expect(LOW_POLY_TOKENS.student.accent).toBe('#7259d9');
    expect(LOW_POLY_TOKENS.teacher.accent).toBe('#356b9e');
    expect(LOW_POLY_TOKENS.surface.opaque).toBe('rgba(255,255,255,0.82)');
    expect(LOW_POLY_TOKENS.surface.glass).toBe('rgba(255,255,255,0.74)');
    expect(theme.respectReducedMotion).toBe(true);
    expect(theme.focusRing).toBe('auto');
  });
});
