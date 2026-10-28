import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import type { FurnitureItem, Variant } from '../types';
import type { CeilingFixture } from '../../geometry/fixtures';
import { FURNITURE_BASE } from './common';
import { rawMaterials } from './raw';

/** Identyfikator trybu (przycisk w panelu): 'raw' i style danego mieszkania. */
export type ModeId = string;

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

/** Stan surowy – wspólny dla wszystkich mieszkań; `variant: null`, gdy mieszkanie ma przełącznik nowej ścianki. */
export const rawMode = (variant: Variant | null = 'developer'): ModeDefinition => ({
  id: 'raw',
  name: 'Stan surowy',
  label: 'Surowy',
  materials: rawMaterials,
  variant,
  interiorDoors: false,
  ceilingFixture: 'bulb',
  furniture: [],
});

/** Styl wykończenia: materiały architektury i meble na wspólnej palecie mebli. */
export const finishMode = (
  def: Pick<ModeDefinition, 'id' | 'name' | 'label' | 'furniture'> & { surfaces: Record<SurfaceKey, MaterialSpec>; palette: Record<string, MaterialSpec>; variant?: Variant },
): ModeDefinition => ({
  id: def.id,
  name: def.name,
  label: def.label,
  materials: { ...FURNITURE_BASE, ...def.palette, ...def.surfaces },
  variant: def.variant ?? 'developer',
  interiorDoors: true,
  ceilingFixture: 'none',
  furniture: def.furniture,
});
