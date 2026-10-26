import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { FurnitureItem } from '../data/types';
import type { Rect } from '../controls/collisions';
import { applyWorldUV } from '../geometry/box';
import type { MaterialSet } from '../scene/materials';
import { BUILDERS } from './builders';
import type { ModelCache } from './gltf';

/** Źródło światła w rzucie (cm), z wysokością `z`. */
export interface Lamp {
  x: number;
  y: number;
  z: number;
  intensity: number;
  color: number;
  alwaysOn?: boolean;
}

export interface PlacedFurniture {
  group: THREE.Group;
  colliders: Rect[];
  lamps: Lamp[];
  dispose(): void;
}

const ANGLE: Record<FurnitureItem['facing'], number> = { '+y': 0, '-y': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

/**
 * Buduje meble z danych trybu. Bryły wszystkich mebli łączymy w jedną siatkę na materiał
 * (mało wywołań rysowania), modele GLB dochodzą osobno, gdy się wczytają.
 */
export function placeFurniture(items: FurnitureItem[], mats: MaterialSet, models: ModelCache): PlacedFurniture {
  const group = new THREE.Group();
  group.name = 'furniture';
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const colliders: Rect[] = [];
  const lamps: Lamp[] = [];
  let disposed = false;

  for (const item of items) {
    const builder = BUILDERS[item.type as keyof typeof BUILDERS];
    if (!builder) throw new Error(`Mebel ${item.id}: nieznany typ „${item.type}”`);
    const built = builder(item.params ?? {});
    const angle = ANGLE[item.facing];
    const z = item.z ?? 0;
    const matrix = new THREE.Matrix4()
      .makeTranslation(item.x / 100, z / 100, item.y / 100)
      .multiply(new THREE.Matrix4().makeRotationY(angle))
      .multiply(new THREE.Matrix4().makeScale(0.01, 0.01, 0.01));

    for (const part of built.parts) {
      if (!mats[part.mat]) throw new Error(`Mebel ${item.id}: brak materiału „${part.mat}” w palecie trybu`);
      const geo = part.geo.index ? part.geo.toNonIndexed() : part.geo;
      applyWorldUV(geo, 0.01); // UV w metrach w układzie mebla – słoje i splot w realnej skali
      geo.applyMatrix4(matrix);
      buckets.set(part.mat, [...(buckets.get(part.mat) ?? []), geo]);
    }

    // Obrys w rzucie: przy obrocie o 90° szerokość i głębokość zamieniają się osiami.
    const sideways = item.facing === '+x' || item.facing === '-x';
    const hx = (sideways ? built.size.d : built.size.w) / 2;
    const hy = (sideways ? built.size.w : built.size.d) / 2;
    if (built.collide) colliders.push({ x0: item.x - hx, x1: item.x + hx, y0: item.y - hy, y1: item.y + hy });

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (const l of built.lights ?? []) {
      lamps.push({ x: item.x + l.x * c + l.z * s, y: item.y - l.x * s + l.z * c, z: z + l.y, intensity: l.intensity, color: l.color, alwaysOn: l.alwaysOn });
    }

    for (const m of built.models ?? []) {
      void models.instance(m.file, m.height).then((obj) => {
        if (disposed) return;
        obj.position.set(item.x / 100, z / 100, item.y / 100);
        obj.rotation.y = angle + THREE.MathUtils.degToRad(m.rotate ?? 0);
        group.add(obj);
      });
    }
  }

  for (const [mat, geos] of buckets) {
    const mesh = new THREE.Mesh(mergeGeometries(geos), mats[mat]);
    geos.forEach((g) => g.dispose());
    mesh.name = `furniture:${mat}`;
    const material = mats[mat];
    mesh.castShadow = !material.transparent && !(material.userData.glow > 0);
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return {
    group,
    colliders,
    lamps,
    dispose() {
      disposed = true;
      group.traverse((o) => {
        // Geometrie modeli GLB są współdzielone z pamięcią podręczną – zwalniamy tylko własne siatki.
        if (o instanceof THREE.Mesh && o.name.startsWith('furniture:')) o.geometry.dispose();
      });
    },
  };
}
