import * as THREE from 'three';
import type { Apartment, Point, Variant } from '../data/types';
import { inVariant, wallsFor } from '../core/plan';
import { m } from '../core/units';
import { wallSpan } from './walls';

/** Pozioma płaszczyzna z obrysu rzutu: podłoga (normalna w górę) albo sufit (w dół). */
function planeFromPolygon(polygon: readonly Point[], height: number, facing: 'up' | 'down'): THREE.BufferGeometry {
  const sign = facing === 'up' ? -1 : 1;
  const shape = new THREE.Shape(polygon.map(([x, y]) => new THREE.Vector2(m(x), sign * m(y))));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(facing === 'up' ? -Math.PI / 2 : Math.PI / 2);
  g.translate(0, m(height), 0);
  return g;
}

export type FloorSurface = 'floor' | 'floorBathroom';

export function floorGeometries(ap: Apartment, variant: Variant): { surface: FloorSurface; geometry: THREE.BufferGeometry }[] {
  return ap.rooms
    .filter((r) => !r.outdoor && inVariant(r, variant))
    .map((r) => ({ surface: r.kind === 'bathroom' ? 'floorBathroom' : 'floor', geometry: planeFromPolygon(r.polygon, 0, 'up') }));
}

export function ceilingGeometries(ap: Apartment, variant: Variant): THREE.BufferGeometry[] {
  return ap.rooms.filter((r) => !r.outdoor && inVariant(r, variant)).map((r) => planeFromPolygon(r.polygon, ap.height, 'down'));
}

/** Podłoga w świetle otworów (progi), żeby pod drzwiami nie było dziury między pokojami. */
export function thresholdGeometries(ap: Apartment, variant: Variant): THREE.BufferGeometry[] {
  const walls = wallsFor(ap, variant);
  return ap.openings.flatMap((o) => {
    const wall = walls.find((w) => w.id === o.wallId);
    if (!wall || o.sill > 0) return [];
    const [n0, n1] = wallSpan(wall);
    const rect: Point[] =
      wall.x1 - wall.x0 >= wall.y1 - wall.y0
        ? [[o.from, n0], [o.to, n0], [o.to, n1], [o.from, n1]]
        : [[n0, o.from], [n1, o.from], [n1, o.to], [n0, o.to]];
    return [planeFromPolygon(rect, 0, 'up')];
  });
}
