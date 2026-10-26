import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import { COMMON } from './common';

const wall: MaterialSpec = { texture: 'greyPlaster', tint: 0xf2efea, roughness: 1, normalScale: 0.6 };
const floor: MaterialSpec = { texture: 'screed', tint: 0xd8d4ce, roughness: 1, normalScale: 0.8 };

/** Stan surowy: wylewka, szary tynk cementowo-wapienny, otynkowany sufit, gołe żarówki. */
export const rawMaterials: Record<SurfaceKey, MaterialSpec> = {
  ...COMMON,
  wall,
  wallBathroom: wall,
  floor,
  floorBathroom: floor,
  ceiling: { texture: 'ceilingPlaster', tint: 0xe2e0dc, roughness: 1, normalScale: 0.5 },
  threshold: { texture: 'screed', tint: 0xc4c0ba, roughness: 1 },
  doorInterior: { color: 0xeeebe6, roughness: 0.6 }, // nieużywane – w stanie surowym brak skrzydeł
  bulb: { color: 0xfff4e0, roughness: 0.2, emissive: 0xffc98f, glow: 4 }, // goła żarówka 2700 K
};
