import type { Builder } from '../types';
import * as living from './living';
import * as kitchen from './kitchen';
import * as bathroom from './bathroom';
import * as lighting from './lighting';
import * as decor from './decor';

/** Wszystkie typy mebli dostępne w danych trybów (`FurnitureItem.type`). */
export const BUILDERS = { ...living, ...kitchen, ...bathroom, ...lighting, ...decor } satisfies Record<string, Builder>;

export type FurnitureType = keyof typeof BUILDERS;
