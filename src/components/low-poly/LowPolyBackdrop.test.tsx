import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LowPolyBackdrop } from './LowPolyBackdrop';

const { supportsWebGL } = vi.hoisted(() => ({ supportsWebGL: vi.fn(() => true) }));

vi.mock('motion/react', () => ({ useReducedMotion: () => false }));
vi.mock('./scene-policy', () => ({
  chooseSceneMode: () => 'css',
  supportsWebGL,
}));

describe('LowPolyBackdrop', () => {
  it('does not probe WebGL when the scene is disabled', () => {
    render(<LowPolyBackdrop variant="login" scene={false}>내용</LowPolyBackdrop>);

    expect(supportsWebGL).not.toHaveBeenCalled();
  });
});
