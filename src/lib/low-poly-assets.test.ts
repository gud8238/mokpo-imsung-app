import { describe, expect, it } from 'vitest';
import { LOW_POLY_ASSETS } from './low-poly-assets';

describe('LOW_POLY_ASSETS', () => {
  it('uses local optimized files for every role and icon', () => {
    expect(LOW_POLY_ASSETS.background.login).toBe('/low-poly/login-forest.webp');
    expect(LOW_POLY_ASSETS.background.student).toBe('/low-poly/student-trail.webp');
    expect(LOW_POLY_ASSETS.background.teacher).toBe('/low-poly/teacher-observatory.webp');
    expect(Object.values(LOW_POLY_ASSETS.icon)).toHaveLength(3);
    expect(Object.values(LOW_POLY_ASSETS.icon).every((path) => path.startsWith('/low-poly/'))).toBe(true);
  });
});
