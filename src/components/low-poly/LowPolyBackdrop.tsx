'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { chooseSceneMode, supportsWebGL } from './scene-policy';
import type { LowPolyBackdropProps, SceneMode } from './types';
import classes from './low-poly.module.css';

const LowPolyScene = dynamic(() => import('./LowPolyScene'), {
  ssr: false,
  loading: () => null,
});

export function LowPolyBackdrop({
  variant,
  scene = true,
  children,
  className,
}: LowPolyBackdropProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [mode, setMode] = useState<SceneMode>('static');

  useEffect(() => {
    const update = () => {
      setMode(chooseSceneMode({
        reducedMotion,
        webGLAvailable: supportsWebGL(),
        viewportWidth: window.innerWidth,
        documentVisible: document.visibilityState === 'visible',
      }));
    };
    update();
    window.addEventListener('resize', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [reducedMotion]);

  return (
    <div className={`${classes.backdrop} ${classes[variant]} ${className ?? ''}`}>
      <div className={classes.poster} aria-hidden="true" />
      {mode !== 'static' && <div className={classes.polygonDrift} aria-hidden="true" />}
      {scene && mode === 'webgl' && <LowPolyScene variant={variant} />}
      <div className={classes.roleOverlay} aria-hidden="true" />
      <div className={classes.content}>{children}</div>
    </div>
  );
}
