import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import type { FurnitureItem, Variant } from '../types';
import type { CeilingFixture } from '../../geometry/fixtures';
import { FURNITURE_BASE } from './common';
import { rawMaterials } from './raw';
import { styl1Furniture, styl1FurnitureMaterials, styl1Materials } from './styl1';
import { styl2Furniture, styl2FurnitureMaterials, styl2Materials } from './styl2';

export type ModeId = 'raw' | 'styl1' | 'styl2';

export interface ModeDefinition {
  id: ModeId;
  name: string;
  /** Krótka etykieta przycisku. */
  label: string;
  /** Powierzchnie architektury + paleta mebli. */
  materials: Record<SurfaceKey, MaterialSpec> & Record<string, MaterialSpec>;
  /** Wariant układu narzucony przez tryb; null = użytkownik przełącza „nową ściankę”. */
  variant: Variant | null;
  interiorDoors: boolean;
  /** Gołe żarówki na wypustach (stan surowy); w wykończeniach lampy są meblami. */
  ceilingFixture: CeilingFixture;
  furniture: FurnitureItem[];
}

export const MODES: Record<ModeId, ModeDefinition> = {
  raw: {
    id: 'raw',
    name: 'Stan surowy',
    label: 'Surowy',
    materials: rawMaterials,
    variant: null,
    interiorDoors: false,
    ceilingFixture: 'bulb',
    furniture: [],
  },
  styl1: {
    id: 'styl1',
    name: 'Styl 1 – ciemny orzech',
    label: 'Styl 1',
    materials: { ...FURNITURE_BASE, ...styl1FurnitureMaterials, ...styl1Materials },
    variant: 'rebuild',
    interiorDoors: true,
    ceilingFixture: 'none',
    furniture: styl1Furniture,
  },
  styl2: {
    id: 'styl2',
    name: 'Styl 2 – jasny minimalizm',
    label: 'Styl 2',
    materials: { ...FURNITURE_BASE, ...styl2FurnitureMaterials, ...styl2Materials },
    variant: 'rebuild',
    interiorDoors: true,
    ceilingFixture: 'none',
    furniture: styl2Furniture,
  },
};
