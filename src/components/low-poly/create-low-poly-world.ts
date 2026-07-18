import * as THREE from 'three';
import type { LowPolyVariant } from './types';

export const SCENE_PALETTES = {
  login: { rock: 0x8c739e, foliage: 0x68aa72, accent: 0x7259d9, sun: 0xffd45d },
  student: { rock: 0xa88fbd, foliage: 0x65a976, accent: 0x7259d9, sun: 0xffd45d },
  teacher: { rock: 0x7082a5, foliage: 0x4f8b78, accent: 0x356b9e, sun: 0xffd45d },
} as const;

function material(color: number) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.82 });
}

export function createLowPolyWorld(scene: THREE.Scene, variant: LowPolyVariant) {
  const palette = SCENE_PALETTES[variant];
  const world = new THREE.Group();
  world.name = 'low-poly-world';

  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  const treeGeometry = new THREE.ConeGeometry(0.62, 1.45, 7);
  const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6);
  const bookGeometry = new THREE.BoxGeometry(0.78, 1, 0.16, 1, 1, 1);

  const rocks = [
    [-4.8, -1.7, -2.2, 1.35],
    [-3.0, -2.0, -1.1, 0.82],
    [3.5, -1.8, -1.5, 1.08],
    [5.0, -1.5, -2.6, 1.5],
  ] as const;

  rocks.forEach(([x, y, z, scale]) => {
    const rock = new THREE.Mesh(rockGeometry.clone(), material(palette.rock));
    rock.position.set(x, y, z);
    rock.scale.setScalar(scale);
    world.add(rock);
  });

  [-2.1, 2.25].forEach((x, index) => {
    const tree = new THREE.Group();
    const crown = new THREE.Mesh(treeGeometry.clone(), material(palette.foliage));
    crown.position.y = 0.9;
    const trunk = new THREE.Mesh(trunkGeometry.clone(), material(0x9a674c));
    tree.add(crown, trunk);
    tree.position.set(x, -1.35, -1.25 - index * 0.35);
    world.add(tree);
  });

  const book = new THREE.Mesh(bookGeometry, material(palette.accent));
  book.name = 'floating-book';
  book.position.set(2.8, 0.45, 0);
  book.rotation.set(-0.1, -0.45, 0.12);
  world.add(book);

  scene.add(world);
  return world;
}

export function disposeLowPolyWorld(world: THREE.Group) {
  world.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((entry) => entry.dispose());
  });
  world.removeFromParent();
}
