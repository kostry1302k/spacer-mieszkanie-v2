// Jedyny punkt styku silnika z danymi mieszkania. `@mieszkanie` to folder mieszkania/<id> (vite.config.ts, tsconfig.json).
import type { Apartment } from './data/types';
import type { ModeDefinition } from './data/modes';
import { site } from '@mieszkanie';

export interface Site {
  /** Krótki podpis w rogu ekranu. */
  badge: string;
  apartment: Apartment;
  /** Tryby w kolejności przycisków; pierwszy jest domyślny. */
  modes: ModeDefinition[];
}

export const { apartment, badge } = site;
export const MODES: Record<string, ModeDefinition> = Object.fromEntries(site.modes.map((m) => [m.id, m]));
export const DEFAULT_MODE = site.modes[0].id;
