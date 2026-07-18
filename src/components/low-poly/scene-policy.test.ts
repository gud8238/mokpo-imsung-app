import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseSceneMode, supportsWebGL } from './scene-policy';

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('releases the short-lived WebGL probe context after capability detection', () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn().mockReturnValue({ loseContext });
    const getContext = vi.fn().mockReturnValue({ getExtension });
    vi.spyOn(document, 'createElement').mockReturnValue({ getContext } as unknown as HTMLCanvasElement);

    expect(supportsWebGL()).toBe(true);
    expect(getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
    expect(loseContext).toHaveBeenCalledOnce();
  });
});
