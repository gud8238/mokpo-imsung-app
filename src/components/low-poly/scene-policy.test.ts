import { describe, expect, it } from 'vitest';
import { chooseSceneMode } from './scene-policy';

describe('chooseSceneMode', () => {
  it('uses a static poster when reduced motion is requested', () => {
    expect(chooseSceneMode({
      reducedMotion: true,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('static');
  });

  it('uses CSS motion on narrow screens', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 390,
      documentVisible: true,
    })).toBe('css');
  });

  it('uses WebGL on capable desktop screens', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('webgl');
  });

  it('falls back to CSS when WebGL is unavailable or the page is hidden', () => {
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: false,
      viewportWidth: 1440,
      documentVisible: true,
    })).toBe('css');
    expect(chooseSceneMode({
      reducedMotion: false,
      webGLAvailable: true,
      viewportWidth: 1440,
      documentVisible: false,
    })).toBe('css');
  });
});
