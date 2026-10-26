// Pomocnicze bryły do budowy mebli (wszystko w cm, w lokalnym układzie mebla).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Part } from './types';

/** Prostopadłościan o środku (x, y, z); `r` > 0 – zaokrąglone krawędzie (tkaniny, blaty). */
export function box(mat: string, w: number, h: number, d: number, x: number, y: number, z: number, r = 0): Part {
  const radius = Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01);
  const geo = radius > 0.05 ? new RoundedBoxGeometry(w, h, d, 3, radius) : new THREE.BoxGeometry(w, h, d);
  geo.translate(x, y, z);
  return { mat, geo };
}

/** Prostopadłościan zadany zakresami (od–do) w trzech osiach. */
export function span(mat: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, r = 0): Part {
  return box(mat, x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, r);
}

/** Walec pionowy (oś y) o środku podstawy w (x, y, z). */
export function cylinder(mat: string, rTop: number, rBottom: number, h: number, x: number, y: number, z: number, segments = 24): Part {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, segments);
  geo.translate(x, y + h / 2, z);
  return { mat, geo };
}

/** Walec o osi poziomej wzdłuż x (np. drążek, rura). */
export function rod(mat: string, r: number, length: number, x: number, y: number, z: number, axis: 'x' | 'z' = 'x'): Part {
  const geo = new THREE.CylinderGeometry(r, r, length, 12);
  geo.rotateZ(Math.PI / 2);
  if (axis === 'z') geo.rotateY(Math.PI / 2);
  geo.translate(x, y, z);
  return { mat, geo };
}

export function sphere(mat: string, r: number, x: number, y: number, z: number, segments = 24): Part {
  const geo = new THREE.SphereGeometry(r, segments, Math.round(segments * 0.66));
  geo.translate(x, y, z);
  return { mat, geo };
}

/** Pierścień (torus) w płaszczyźnie poziomej albo pionowej (front, płaszczyzna xy). */
export function ring(mat: string, r: number, tube: number, x: number, y: number, z: number, plane: 'horizontal' | 'front' = 'horizontal'): Part {
  const geo = new THREE.TorusGeometry(r, tube, 8, 48);
  if (plane === 'horizontal') geo.rotateX(Math.PI / 2);
  geo.translate(x, y, z);
  return { mat, geo };
}

/** Płaski krążek w płaszczyźnie frontu (xy), zwrócony do przodu (+z). */
export function disc(mat: string, r: number, x: number, y: number, z: number, segments = 48): Part {
  const geo = new THREE.CircleGeometry(r, segments);
  geo.translate(x, y, z);
  return { mat, geo };
}

/** Zasłona: pionowa płaszczyzna z falbanami (sinusoida), szerokość w x, wysokość od y0 do y1. */
export function folds(mat: string, w: number, y0: number, y1: number, z: number, depth: number, period: number): Part {
  const segments = Math.max(8, Math.round(w / 2));
  const geo = new THREE.PlaneGeometry(w, y1 - y0, segments, 1);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, (depth / 2) * Math.sin(((x + w / 2) / period) * Math.PI * 2));
  }
  geo.computeVertexNormals();
  geo.translate(0, (y0 + y1) / 2, z);
  return { mat, geo };
}
