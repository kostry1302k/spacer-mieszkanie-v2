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

/** Odwraca ścianki bryły (widok od środka) – wnętrza mis, wanien i zlewów. */
export function inverted(part: Part): Part {
  const geo = part.geo.index ? part.geo.toNonIndexed() : part.geo;
  for (const attr of Object.values(geo.attributes) as THREE.BufferAttribute[]) {
    for (let i = 0; i < attr.count; i += 3)
      for (let c = 0; c < attr.itemSize; c++) {
        const a = attr.getComponent(i + 1, c);
        attr.setComponent(i + 1, c, attr.getComponent(i + 2, c));
        attr.setComponent(i + 2, c, a);
      }
  }
  const nor = geo.getAttribute('normal');
  for (let i = 0; i < nor.count; i++) nor.setXYZ(i, -nor.getX(i), -nor.getY(i), -nor.getZ(i));
  return { mat: part.mat, geo };
}

/**
 * Misa widziana od środka: pionowe ścianki, zaokrąglone narożniki i dno (promień `r`).
 * Górna krawędź na wysokości `y`, środek w (x, z).
 */
export function basin(mat: string, w: number, d: number, depth: number, r: number, x: number, y: number, z: number): Part {
  const box = new RoundedBoxGeometry(w, depth * 2, d, 5, Math.min(r, w / 2 - 0.01, d / 2 - 0.01, depth - 0.01)).toNonIndexed();
  const src = box.getAttribute('position');
  for (let i = 0; i < src.count; i++) src.setY(i, Math.min(src.getY(i), 0)); // górna połowa spłaszczona…
  // …i usunięta: płaskie „wieko” na krawędzi zasłaniałoby wnętrze przy wypalaniu światła (Cycles widzi obie strony ścianek).
  const keep: number[] = [];
  for (let t = 0; t < src.count; t += 3) if (Math.min(src.getY(t), src.getY(t + 1), src.getY(t + 2)) < -1e-4) keep.push(t);
  const geo = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(box.attributes) as [string, THREE.BufferAttribute][]) {
    const out = new Float32Array(keep.length * 3 * attr.itemSize);
    keep.forEach((t, k) => out.set(attr.array.subarray(t * attr.itemSize, (t + 3) * attr.itemSize), k * 3 * attr.itemSize));
    geo.setAttribute(name, new THREE.BufferAttribute(out, attr.itemSize));
  }
  geo.translate(x, y, z);
  return inverted({ mat, geo });
}

export type Outline = 'rect' | 'round' | 'oval' | 'capsule' | 'arch';

/** Kontur w płaszczyźnie xy (środek na x = `cx`, dół na y = `by`), powiększony o `grow` z każdej strony. */
export function outline<T extends THREE.Path>(path: T, kind: Outline, w: number, h: number, grow = 0, r = 2, cx = 0, by = 0): T {
  const W = w + 2 * grow;
  const H = h + 2 * grow;
  const x0 = cx - W / 2;
  const x1 = cx + W / 2;
  const y0 = by - grow;
  if (kind === 'round' || kind === 'oval') {
    path.absellipse(cx, y0 + H / 2, W / 2, H / 2, 0, Math.PI * 2, false, 0);
    return path;
  }
  if (kind === 'arch') {
    path.moveTo(x0, y0);
    path.lineTo(x1, y0);
    path.lineTo(x1, y0 + H - W / 2);
    path.absarc(cx, y0 + H - W / 2, W / 2, 0, Math.PI, false);
    path.lineTo(x0, y0);
    return path;
  }
  const rr = kind === 'capsule' ? W / 2 : Math.min(r + grow, W / 2, H / 2);
  path.moveTo(x0 + rr, y0);
  path.lineTo(x1 - rr, y0);
  path.absarc(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0, false);
  path.lineTo(x1, y0 + H - rr);
  path.absarc(x1 - rr, y0 + H - rr, rr, 0, Math.PI / 2, false);
  path.lineTo(x0 + rr, y0 + H);
  path.absarc(x0 + rr, y0 + H - rr, rr, Math.PI / 2, Math.PI, false);
  path.lineTo(x0, y0 + rr);
  path.absarc(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5, false);
  return path;
}

/** Bryła wyciągnięta z konturu (opcjonalnie z otworem) wzdłuż z, od z0 o grubość `t`, z fazką. */
export function extrude(mat: string, shape: THREE.Shape, t: number, z0: number, bevel = 0.3): Part {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.01, t - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 32 });
  geo.translate(0, 0, z0 + bevel);
  return { mat, geo };
}

/** Pozioma płyta w × d (blat, obrzeże wanny) z zaokrąglonym otworem; górna powierzchnia na `top`. */
export function plate(mat: string, w: number, d: number, t: number, top: number, hole?: { w: number; d: number; r: number; x?: number; z?: number }, bevel = 0.3): Part {
  const shape = outline(new THREE.Shape(), 'rect', w - 2 * bevel, d - 2 * bevel, 0, 0.01, 0, -(d - 2 * bevel) / 2);
  if (hole) shape.holes.push(outline(new THREE.Path(), 'rect', hole.w + 2 * bevel, hole.d + 2 * bevel, 0, hole.r + bevel, hole.x ?? 0, (hole.z ?? 0) - (hole.d + 2 * bevel) / 2));
  const part = extrude(mat, shape, t, 0, bevel);
  // Kontur leży w xy (y = głębokość mebla); obrót kładzie go poziomo, grubość idzie w dół od `top`.
  part.geo.rotateX(Math.PI / 2);
  part.geo.translate(0, top, 0);
  return part;
}

/** Bryła obrotowa z profilu [promień, wysokość], spłaszczona do owalu (`sx`, `sz`). */
export function lathe(mat: string, profile: [number, number][], x: number, y: number, z: number, sx = 1, sz = 1, segments = 64): Part {
  const geo = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments);
  geo.scale(sx, 1, sz);
  geo.translate(x, y, z);
  return { mat, geo };
}

/** Rurka wzdłuż gładkiej krzywej przez punkty (wylewki baterii, łuki). */
export function tube(mat: string, points: [number, number, number][], r: number, segments = 40): Part {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal');
  return { mat, geo: new THREE.TubeGeometry(curve, segments, r, 16, false) };
}
