import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { m } from '../core/units';

/** Prostopadłościan we współrzędnych rzutu (cm): x, y w rzucie, z = wysokość. */
export interface PlanBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
}

export function boxGeometry(b: PlanBox): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(m(b.x1 - b.x0), m(b.z1 - b.z0), m(b.y1 - b.y0));
  g.translate(m((b.x0 + b.x1) / 2), m((b.z0 + b.z1) / 2), m((b.y0 + b.y1) / 2));
  return g;
}

/**
 * Współrzędne UV z pozycji w świecie (rzut prostopadły na płaszczyznę ściany),
 * żeby faktury miały realną skalę (1 jednostka UV = 1 m) i ciągłość między kawałkami ścian.
 */
export function applyWorldUV(g: THREE.BufferGeometry, scale = 1): THREE.BufferGeometry {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i));
    const ay = Math.abs(nor.getY(i));
    const az = Math.abs(nor.getZ(i));
    const [u, v] =
      ax >= ay && ax >= az ? [pos.getZ(i), pos.getY(i)] : ay >= az ? [pos.getX(i), pos.getZ(i)] : [pos.getX(i), pos.getY(i)];
    uv[i * 2] = u * scale;
    uv[i * 2 + 1] = v * scale;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/** Łączy wiele brył w jedną geometrię (jeden draw call na materiał). */
export function mergeStatic(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(geometries.map((g) => (g.index ? g.toNonIndexed() : g)));
  geometries.forEach((g) => g.dispose());
  return applyWorldUV(merged);
}
