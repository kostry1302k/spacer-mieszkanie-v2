// Zabudowa kuchenna: szafki dolne z blatem (opcjonalnie zlew / płyta z piekarnikiem), szafki górne, lodówka w zabudowie, okap, panel ścienny.
import type { Builder, Params, Part } from '../types';
import { cylinder, ring, rod, span } from '../parts';

const num = (p: Params, key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
const str = (p: Params, key: string, fallback: string) => (typeof p[key] === 'string' ? (p[key] as string) : fallback);

const PLINTH = 10;
const COUNTER = 4;

/** Szafka dolna z blatem; `appliance`: 'sink' | 'hob' | brak. Front = strona frontów. */
export const baseCabinet: Builder = (p) => {
  const w = num(p, 'w', 60);
  const d = num(p, 'd', 60);
  const h = num(p, 'h', 90);
  const front = str(p, 'front', 'walnut');
  const top = str(p, 'top', 'stoneDark');
  const doors = num(p, 'doors', w > 70 ? 2 : 1);
  const body = h - COUNTER;
  const parts: Part[] = [
    span('blackMatte', -w / 2, w / 2, 0, PLINTH, -d / 2, d / 2 - 6), // cokół
    span(str(p, 'carcass', 'blackMatte'), -w / 2, w / 2, PLINTH, body, -d / 2, d / 2 - 2), // korpus
    span(top, -w / 2, w / 2, body, h, -d / 2, d / 2, 0.3), // blat
  ];
  const fw = w / doors;
  for (let i = 0; i < doors; i++) {
    const x0 = -w / 2 + i * fw;
    if (p.appliance === 'hob') {
      // Piekarnik pod płytą: czarne szkło + uchwyt.
      parts.push(span('ovenGlass', x0 + 0.3, x0 + fw - 0.3, PLINTH + 14, body - 12, d / 2 - 2, d / 2, 0.3));
      parts.push(rod('steel', 0.8, fw - 12, x0 + fw / 2, body - 16, d / 2 + 2.5));
      parts.push(span(front, x0 + 0.3, x0 + fw - 0.3, PLINTH + 0.3, PLINTH + 13.7, d / 2 - 2, d / 2, 0.3));
      parts.push(span(front, x0 + 0.3, x0 + fw - 0.3, body - 11.7, body - 0.3, d / 2 - 2, d / 2, 0.3));
    } else {
      parts.push(span(front, x0 + 0.3, x0 + fw - 0.3, PLINTH + 0.3, body - 0.3, d / 2 - 2, d / 2, 0.3));
    }
  }
  if (p.appliance === 'hob') {
    parts.push(span('ovenGlass', -w / 2 + 4, w / 2 - 4, h, h + 0.6, -d / 2 + 6, d / 2 - 6, 0.3));
    for (const [x, z, r] of [[-w / 4 + 2, -d / 6, 8], [w / 4 - 2, -d / 6, 6], [-w / 4 + 2, d / 6, 6], [w / 4 - 2, d / 6, 8]] as const)
      parts.push(ring('steel', r, 0.25, x, h + 0.7, z));
  }
  if (p.appliance === 'sink') {
    // Komora zlewu (ciemna wnęka w blacie) i bateria.
    parts.push(span('sinkBlack', -w / 2 + 8, w / 2 - 8, h - 0.4, h + 0.2, -d / 2 + 8, d / 2 - 10, 1));
    parts.push(cylinder('blackMetal', 1.6, 1.8, 26, 0, h, -d / 2 + 4));
    parts.push(rod('blackMetal', 1.2, 18, 0, h + 25, -d / 2 + 12, 'z'));
  }
  return { parts, size: { w, d, h }, collide: true };
};

/** Szafka górna (wisząca); `glass` – front z ryflowanym szkłem i podświetleniem. */
export const wallCabinet: Builder = (p) => {
  const w = num(p, 'w', 60);
  const d = num(p, 'd', 35);
  const h = num(p, 'h', 70);
  const front = str(p, 'front', 'walnut');
  const doors = num(p, 'doors', w > 70 ? 2 : 1);
  const parts: Part[] = [span(str(p, 'carcass', 'blackMatte'), -w / 2, w / 2, 0, h, -d / 2, d / 2 - 2)];
  const fw = w / doors;
  for (let i = 0; i < doors; i++) {
    const x0 = -w / 2 + i * fw;
    parts.push(span(p.glass ? 'fluted' : front, x0 + 0.3, x0 + fw - 0.3, 0.3, h - 0.3, d / 2 - 2, d / 2, 0.3));
  }
  if (p.underLight !== false) parts.push(span('led', -w / 2 + 2, w / 2 - 2, -0.6, 0, d / 2 - 6, d / 2 - 4)); // LED pod szafką
  return { parts, size: { w, d, h }, collide: false };
};

/** Lodówka w zabudowie (wysoka szafa z frontami). */
export const fridgeColumn: Builder = (p) => {
  const w = num(p, 'w', 60);
  const d = num(p, 'd', 60);
  const h = num(p, 'h', 215);
  const front = str(p, 'front', 'walnut');
  return {
    parts: [
      span('blackMatte', -w / 2, w / 2, 0, h, -d / 2, d / 2 - 2),
      span(front, -w / 2 + 0.3, w / 2 - 0.3, PLINTH, 88, d / 2 - 2, d / 2, 0.3),
      span(front, -w / 2 + 0.3, w / 2 - 0.3, 88.6, h - 0.3, d / 2 - 2, d / 2, 0.3),
      span('blackMatte', -w / 2, w / 2, 0, PLINTH, d / 2 - 6, d / 2 - 2),
    ],
    size: { w, d, h },
    collide: true,
  };
};

/** Okap podszafkowy / kominowy (prosta czarna bryła). */
export const hood: Builder = (p) => {
  const w = num(p, 'w', 60);
  const d = num(p, 'd', 45);
  const h = num(p, 'h', 12);
  return { parts: [span(str(p, 'mat', 'blackMatte'), -w / 2, w / 2, 0, h, -d / 2, d / 2, 0.5)], size: { w, d, h }, collide: false };
};

/** Płaski panel na ścianie (np. kamień nad blatem). */
export const wallPanel: Builder = (p) => {
  const w = num(p, 'w', 100);
  const h = num(p, 'h', 55);
  const t = num(p, 't', 1);
  return { parts: [span(str(p, 'mat', 'stoneDark'), -w / 2, w / 2, 0, h, -t / 2, t / 2)], size: { w, d: t, h }, collide: false };
};

/** Reling ścienny z kilkoma zawieszonymi przyborami. */
export const rail: Builder = (p) => {
  const w = num(p, 'w', 90);
  const mat = str(p, 'mat', 'blackMetal');
  const parts: Part[] = [rod(mat, 0.8, w, 0, 0, 3), span(mat, -w / 2, -w / 2 + 1.5, -1.5, 1.5, 0, 3), span(mat, w / 2 - 1.5, w / 2, -1.5, 1.5, 0, 3)];
  for (let i = 0; i < 4; i++) {
    const x = -w / 2 + 15 + i * ((w - 30) / 3);
    parts.push(span(mat, x - 0.3, x + 0.3, -6, 0, 2.7, 3.3)); // hak
    parts.push(span(i % 2 ? 'steel' : 'shelfWhite', x - (i % 2 ? 1.5 : 6), x + (i % 2 ? 1.5 : 6), i % 2 ? -26 : -18, -6, 2, i % 2 ? 4 : 10)); // przybór / pojemnik
  }
  return { parts, size: { w, d: 6, h: 4 }, collide: false };
};
