// Jedyny punkt styku silnika z danymi mieszkania. `@mieszkanie` to folder mieszkania/<id> (vite.config.ts, tsconfig.json).
import type { Apartment } from './data/types';
import type { ModeDefinition } from './data/modes';
import { site } from '@mieszkanie';

export interface Site {
  /** Folder mieszkania (mieszkania/<id>, public/bake/<id>). */
  id: string;
  /** Krótki podpis w rogu ekranu. */
  badge: string;
  apartment: Apartment;
  /** Tryby w kolejności przycisków; pierwszy jest domyślny. */
  modes: ModeDefinition[];
  /** Panoramy 360° z Blendera: public/pano/<id>/<tryb>-<panorama>-<pora>.jpg (render: scripts/bake.py --panorama). */
  panoramas?: Panorama[];
}

export interface Panorama {
  id: string;
  /** Pokój, w którym pojawia się przycisk „Zdjęcie 360°”. */
  room: string;
  /** Miejsce kamery w rzucie (cm) i wysokość oczu – do polecenia renderu. */
  x: number;
  y: number;
  z: number;
  /** Kierunek środka panoramy (stopnie, 0 = +Y w rzucie). */
  yaw: number;
  /** Gotowe rendery: `<tryb>-<pora>`. */
  renders: string[];
}

export const { id: siteId, apartment, badge } = site;
export const panoramas = site.panoramas ?? [];
export const MODES: Record<string, ModeDefinition> = Object.fromEntries(site.modes.map((m) => [m.id, m]));
export const DEFAULT_MODE = site.modes[0].id;
