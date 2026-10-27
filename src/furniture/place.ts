import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { isTouchDevice } from '../core/quality';
import { outline } from './parts';
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

/** Rozdzielczość odbicia w lustrze (px). */
const MIRROR_RES = isTouchDevice ? 256 : 512;
/** Lustro dalej niż tyle metrów od kamery nie odświeża odbicia (zwykle jest za ścianą). */
const MIRROR_RANGE = 6;
let reflecting = false; // lustro w lustrze – bez rekurencji
const mirrorNormal = new THREE.Vector3();

/** Czy z punktu A widać punkt B w rzucie (cm) – lustro za ścianą nie odświeża odbicia. */
export type SightTest = (ax: number, ay: number, bx: number, by: number) => boolean;

const ANGLE: Record<FurnitureItem['facing'], number> = { '+y': 0, '-y': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

/**
 * Buduje meble z danych trybu. Bryły wszystkich mebli łączymy w jedną siatkę na materiał
 * (mało wywołań rysowania), modele GLB dochodzą osobno, gdy się wczytają.
 */
export function placeFurniture(items: FurnitureItem[], mats: MaterialSet, models: ModelCache, sight: SightTest = () => true): PlacedFurniture {
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

    for (const m of built.mirrors ?? []) {
      const geo = new THREE.ShapeGeometry(outline(new THREE.Shape(), m.kind, m.w, m.h, 0, m.r ?? 2, m.x ?? 0, m.y ?? 0), 32);
      const mirror = new Reflector(geo, { textureWidth: MIRROR_RES, textureHeight: MIRROR_RES, color: 0x828686, clipBias: 0.003, multisample: 0 });
      mirror.applyMatrix4(matrix.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, m.z)));
      mirror.forceUpdate = true; // pierwsze odbicie od razu, potem tylko gdy lustro widać
      const render = mirror.onBeforeRender;
      mirror.onBeforeRender = function (renderer, scene, camera, ...rest) {
        if (reflecting || camera.position.distanceTo(mirror.position) > MIRROR_RANGE) return;
        mirrorNormal.set(0, 0, 0.05).applyQuaternion(mirror.quaternion).add(mirror.position); // punkt 5 cm przed taflą
        if (!this.forceUpdate && !sight(camera.position.x * 100, camera.position.z * 100, mirrorNormal.x * 100, mirrorNormal.z * 100)) return;
        reflecting = true;
        render.call(this, renderer, scene, camera, ...rest);
        reflecting = false;
      };
      group.add(mirror);
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
        if (o instanceof Reflector) {
          o.geometry.dispose();
          o.dispose();
        }
      });
    },
  };
}
