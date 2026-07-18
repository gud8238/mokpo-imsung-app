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
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}
