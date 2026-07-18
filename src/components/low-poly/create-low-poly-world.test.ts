import { describe, expect, it } from 'vitest';
import { SCENE_PALETTES } from './create-low-poly-world';

describe('SCENE_PALETTES', () => {
  it('keeps student and teacher worlds visually distinct', () => {
    expect(SCENE_PALETTES.student.accent).toBe(0x7259d9);
    expect(SCENE_PALETTES.teacher.accent).toBe(0x356b9e);
    expect(SCENE_PALETTES.login.sun).toBe(0xffd45d);
  });
});
