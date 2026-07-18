import type { SceneMode, ScenePolicyInput } from './types';

export function chooseSceneMode(input: ScenePolicyInput): SceneMode {
  if (input.reducedMotion) return 'static';
  if (!input.documentVisible) return 'css';
  if (!input.webGLAvailable) return 'css';
  if (input.viewportWidth < 768) return 'css';
  return 'webgl';
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!context) return false;

    const loseContext = (context as WebGLRenderingContext)
      .getExtension('WEBGL_lose_context');
    loseContext?.loseContext();
    return true;
  } catch {
    return false;
  }
}
