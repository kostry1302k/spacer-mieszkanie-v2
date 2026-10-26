import * as THREE from 'three';
import type { Apartment, Door, DoorKind, Variant } from '../data/types';
import { wallAxis, wallsFor } from '../core/plan';
import { m } from '../core/units';
import type { MaterialSet, SurfaceKey } from '../scene/materials';
import { boxGeometry, mergeStatic, type PlanBox } from './box';
import { alongWall, wallSpan } from './walls';

interface DoorStyle {
  frameWidth: number;
  /** Głębokość ościeżnicy; null = na całą grubość ściany. */
  frameDepth: number | null;
  leafThickness: number;
  frame: SurfaceKey;
  leaf: SurfaceKey;
  glazed: boolean;
}

const STYLES: Record<DoorKind, DoorStyle> = {
  entrance: { frameWidth: 6, frameDepth: null, leafThickness: 6, frame: 'frame', leaf: 'doorEntrance', glazed: false },
  interior: { frameWidth: 5, frameDepth: null, leafThickness: 4, frame: 'doorInterior', leaf: 'doorInterior', glazed: false },
  balcony: { frameWidth: 6, frameDepth: 7, leafThickness: 7, frame: 'frame', leaf: 'frame', glazed: true },
};

const SASH = 7; // szerokość profilu skrzydła drzwi balkonowych
const GAP = 0.5;

/** Skrzydło drzwi gotowe do animacji: obrót `pivot.rotation.y = openSign * kąt`. */
export interface DoorLeaf {
  door: Door;
  pivot: THREE.Group;
  openSign: 1 | -1;
  /** Geometria skrzydła w rzucie (cm) – do kolizji i minimapy. */
  plan: LeafPlan;
}

export interface LeafPlan {
  /** Zawias. */
  hx: number;
  hy: number;
  length: number;
  thickness: number;
  /** Kierunek od zawiasu wzdłuż zamkniętego skrzydła. */
  along: [number, number];
  /** Kierunek otwierania (normalna ściany, strona otwierania). */
  swing: [number, number];
}

/** Narożniki skrzydła w rzucie przy danym kącie otwarcia (radiany). */
export function leafCorners(p: LeafPlan, angle: number): [number, number][] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // Kierunek skrzydła obraca się od `along` do `swing`; grubość od `-swing` do `along`.
  const dir = [c * p.along[0] + s * p.swing[0], c * p.along[1] + s * p.swing[1]];
  const thick = [-c * p.swing[0] + s * p.along[0], -c * p.swing[1] + s * p.along[1]];
  const at = (a: number, b: number): [number, number] => [p.hx + dir[0] * a + thick[0] * b, p.hy + dir[1] * a + thick[1] * b];
  return [at(0, 0), at(p.length, 0), at(p.length, p.thickness), at(0, p.thickness)];
}

export interface OpeningsOptions {
  variant: Variant;
  interiorDoors: boolean;
}

export function buildOpenings(ap: Apartment, opts: OpeningsOptions, mats: MaterialSet): { group: THREE.Group; leaves: DoorLeaf[] } {
  const group = new THREE.Group();
  group.name = 'openings';
  const leaves: DoorLeaf[] = [];
  const staticParts = new Map<SurfaceKey, THREE.BufferGeometry[]>();
  const addStatic = (key: SurfaceKey, b: PlanBox) => staticParts.set(key, [...(staticParts.get(key) ?? []), boxGeometry(b)]);
  const walls = wallsFor(ap, opts.variant);

  for (const door of ap.doors) {
    const opening = ap.openings.find((o) => o.id === door.openingId)!;
    const wall = walls.find((w) => w.id === opening.wallId);
    if (!wall || (door.kind === 'interior' && !opts.interiorDoors)) continue;

    const style = STYLES[door.kind];
    const F = style.frameWidth;
    const [n0, n1] = wallSpan(wall);
    const s = door.swing;
    const face = s > 0 ? n1 : n0;
    const plane = face - s * door.frameInset;
    const frameN: [number, number] = style.frameDepth === null ? [n0, n1] : [plane, plane - s * style.frameDepth];
    const box = (a0: number, a1: number, n: [number, number], z0: number, z1: number) => alongWall(wall, a0, a1, n[0], n[1], z0, z1);

    // Ościeżnica: dwa słupki, nadproże i (dla balkonu) próg.
    addStatic(style.frame, box(opening.from, opening.from + F, frameN, 0, opening.head));
    addStatic(style.frame, box(opening.to - F, opening.to, frameN, 0, opening.head));
    addStatic(style.frame, box(opening.from + F, opening.to - F, frameN, opening.head - F, opening.head));
    if (style.glazed) addStatic(style.frame, box(opening.from + F, opening.to - F, frameN, 0, 3));

    const zBottom = style.glazed ? 3 : 1;
    const zTop = opening.head - F;
    const leafA0 = Math.max(door.leafFrom, opening.from + F) + GAP;
    const leafA1 = Math.min(door.leafTo, opening.to - F) - GAP;
    const leafN: [number, number] = [plane, plane - s * style.leafThickness];

    // Stała część przeszklenia (drzwi balkonowe przy filarze).
    if (style.glazed) {
      const fixed: [number, number] | null =
        door.leafFrom > opening.from + F ? [opening.from + F, door.leafFrom] : door.leafTo < opening.to - F ? [door.leafTo, opening.to - F] : null;
      if (fixed) glazedPanel(fixed[0] + GAP, fixed[1] - GAP).forEach(([key, b]) => addStatic(key, b));
    }

    function glazedPanel(a0: number, a1: number): [SurfaceKey, PlanBox][] {
      const glassN: [number, number] = [plane - s * (style.leafThickness / 2 - 0.4), plane - s * (style.leafThickness / 2 + 0.4)];
      return [
        ['frame', box(a0, a0 + SASH, leafN, zBottom, zTop)],
        ['frame', box(a1 - SASH, a1, leafN, zBottom, zTop)],
        ['frame', box(a0 + SASH, a1 - SASH, leafN, zBottom, zBottom + SASH)],
        ['frame', box(a0 + SASH, a1 - SASH, leafN, zTop - SASH, zTop)],
        ['glass', box(a0 + SASH, a1 - SASH, glassN, zBottom + SASH, zTop - SASH)],
      ];
    }

    // Skrzydło otwierane, zbudowane w układzie zawiasu.
    const hingeA = door.hinge === 'from' ? leafA0 : leafA1;
    const d = door.hinge === 'from' ? 1 : -1;
    const handleA = door.hinge === 'from' ? leafA1 - 8 : leafA0 + 8;
    const leafParts: [SurfaceKey, PlanBox][] = style.glazed
      ? glazedPanel(leafA0, leafA1)
      : [[style.leaf, box(leafA0, leafA1, leafN, zBottom, zTop)]];
    const handleN: [number, number] = [plane + s * 6, plane - s * (style.leafThickness + 6)];
    leafParts.push(['metal', box(handleA - 1.5, handleA + 1.5, handleN, 103, 106)]);

    const pivotPos = alongWall(wall, hingeA, hingeA, plane, plane, 0, 0);
    const pivot = new THREE.Group();
    pivot.name = `door:${door.id}`;
    pivot.position.set(m(pivotPos.x0), 0, m(pivotPos.y0));
    for (const key of new Set(leafParts.map(([k]) => k))) {
      const geo = mergeStatic(leafParts.filter(([k]) => k === key).map(([, b]) => boxGeometry(b)));
      geo.translate(-pivot.position.x, 0, -pivot.position.z);
      const mesh = new THREE.Mesh(geo, mats[key]);
      mesh.castShadow = key !== 'glass';
      mesh.receiveShadow = true;
      pivot.add(mesh);
    }
    group.add(pivot);
    const axis = wallAxis(wall);
    const openSign = (axis === 'x' ? -s * d : s * d) as 1 | -1;
    const plan: LeafPlan = {
      hx: pivotPos.x0,
      hy: pivotPos.y0,
      length: leafA1 - leafA0,
      thickness: style.leafThickness,
      along: axis === 'x' ? [d, 0] : [0, d],
      swing: axis === 'x' ? [0, s] : [s, 0],
    };
    leaves.push({ door, pivot, openSign, plan });
  }

  for (const [key, geos] of staticParts) {
    const mesh = new THREE.Mesh(mergeStatic(geos), mats[key]);
    mesh.castShadow = key !== 'glass';
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return { group, leaves };
}
