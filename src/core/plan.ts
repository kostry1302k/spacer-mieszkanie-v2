// Pomocnicze obliczenia na danych rzutu (cm). Bez zależności – używane też przez scripts/check-data.ts.
import type { Apartment, Point, Variant, Wall } from '../data/types';

/** Pole wielokąta w m² (wzór Gaussa, wejście w cm). */
export function polygonArea(polygon: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x0, y0] = polygon[i];
    const [x1, y1] = polygon[(i + 1) % polygon.length];
    sum += x0 * y1 - x1 * y0;
  }
  return Math.abs(sum) / 2 / 10_000;
}

/** Środek ciężkości wielokąta (cm) – np. do etykiet pokoi. */
export function polygonCentroid(polygon: readonly Point[]): Point {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x0, y0] = polygon[i];
    const [x1, y1] = polygon[(i + 1) % polygon.length];
    const cross = x0 * y1 - x1 * y0;
    a += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  return [cx / (3 * a), cy / (3 * a)];
}

export function inVariant(item: { variants?: Variant[] }, variant: Variant): boolean {
  return !item.variants || item.variants.includes(variant);
}

/** Oś, wzdłuż której biegnie ściana (dłuższy bok prostokąta). */
export function wallAxis(wall: Wall): 'x' | 'y' {
  return wall.x1 - wall.x0 >= wall.y1 - wall.y0 ? 'x' : 'y';
}

export function wallsFor(ap: Apartment, variant: Variant): Wall[] {
  return ap.walls.filter((w) => inVariant(w, variant));
}

/** Czy punkt leży wewnątrz wielokąta (test promienia). */
export function pointInPolygon(x: number, y: number, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
