'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { LowPolyVariant } from './types';
import { createLowPolyWorld, disposeLowPolyWorld } from './create-low-poly-world';
import classes from './low-poly.module.css';

export default function LowPolyScene({ variant }: { variant: LowPolyVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 9);

    scene.add(new THREE.HemisphereLight(0xfff4d3, 0x29475a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(-4, 6, 5);
    scene.add(keyLight);

    const world = createLowPolyWorld(scene, variant);
    const floatingBook = world.getObjectByName('floating-book');
    let frame = 0;
    let visible = true;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (time: number) => {
      if (visible && document.visibilityState === 'visible') {
        const seconds = time * 0.001;
        world.rotation.y = Math.sin(seconds * 0.12) * 0.035;
        if (floatingBook) {
          floatingBook.position.y = 0.45 + Math.sin(seconds * 0.72) * 0.14;
          floatingBook.rotation.z = 0.12 + Math.sin(seconds * 0.45) * 0.045;
        }
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      disposeLowPolyWorld(world);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={classes.scene} aria-hidden="true" />;
}
