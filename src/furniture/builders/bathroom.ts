// Wyposażenie łazienki: szafka z umywalką, lustro z LED, WC podwieszane, pralka, ścianka prysznica, grzejnik drabinkowy.
import type { Builder, Params, Part } from '../types';
import { box, cylinder, disc, ring, rod, span } from '../parts';

const num = (p: Params, key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
const str = (p: Params, key: string, fallback: string) => (typeof p[key] === 'string' ? (p[key] as string) : fallback);

/** Wisząca szafka z blatem i umywalką nablatową (albo wpuszczaną) oraz baterią ścienną. */
export const vanity: Builder = (p) => {
  const w = num(p, 'w', 58);
  const d = num(p, 'd', 46);
  const top = 85;
  const front = str(p, 'front', 'walnut');
  const counter = str(p, 'top', 'stoneDark');
  const basin = str(p, 'basin', 'ceramicBlack');
  const parts: Part[] = [
    span(front, -w / 2, w / 2, 45, top - 3, -d / 2, d / 2, 0.5),
    span('blackMatte', -w / 2 + 1, w / 2 - 1, 63.8, 64.2, d / 2 - 0.3, d / 2 + 0.1), // fuga szuflad
    span(counter, -w / 2, w / 2, top - 3, top, -d / 2, d / 2, 0.3),
  ];
  if (p.vessel !== false) {
    parts.push(box(basin, w - 16, 12, d - 16, 0, top + 6, 2, 5)); // umywalka nablatowa
    parts.push(span('sinkBlack', -w / 2 + 11, w / 2 - 11, top + 11.9, top + 12.1, -d / 2 + 13, d / 2 - 9));
  } else {
    parts.push(span(basin, -w / 2 + 6, w / 2 - 6, top - 0.2, top + 0.1, -d / 2 + 8, d / 2 - 6, 1));
  }
  parts.push(rod(str(p, 'tap', 'blackMetal'), 1.2, 16, 0, top + 22, -d / 2 + 8, 'z')); // bateria z wylewką ze ściany
  return { parts, size: { w, d, h: top + 25 }, collide: true };
};

/** Okrągłe lustro z podświetleniem LED od tyłu (świeci także w dzień – łazienka bez okna). */
export const mirrorRound: Builder = (p) => {
  const r = num(p, 'r', 30);
  return {
    parts: [ring('ledAlways', r + 0.8, 1.4, 0, r, -0.8, 'front'), disc('mirror', r, 0, r, 0.6), ring('blackMetal', r, 0.6, 0, r, 0.6, 'front')],
    size: { w: 2 * r, d: 3, h: 2 * r },
    collide: false,
  };
};

/** Lustro prostokątne z zaokrąglonymi narożnikami i podświetleniem. */
export const mirrorBacklit: Builder = (p) => {
  const w = num(p, 'w', 55);
  const h = num(p, 'h', 75);
  return {
    parts: [span('ledAlways', -w / 2 - 1.5, w / 2 + 1.5, -1.5, h + 1.5, -2.5, -1.5, 3), span('mirror', -w / 2, w / 2, 0, h, -1.5, 0, 4)],
    size: { w, d: 3, h },
    collide: false,
  };
};

/** WC podwieszane z przyciskiem spłukiwania na ścianie. Front = przód miski. */
export const wcWallHung: Builder = (p) => {
  const bowl = str(p, 'mat', 'ceramicWhite');
  const d = 54;
  return {
    parts: [
      box(bowl, 36, 30, 46, 0, 33, -d / 2 + 25, 12), // miska
      box(bowl, 37, 3, 44, 0, 49, -d / 2 + 25, 1.4), // deska
      span(str(p, 'plate', 'blackMatte'), -12, 12, num(p, 'plateZ', 98), num(p, 'plateZ', 98) + 15, -d / 2, -d / 2 + 1), // przycisk
    ],
    size: { w: 37, d, h: 50 },
    collide: true,
  };
};

/** Pralka ładowana od przodu. */
export const washer: Builder = () => {
  const w = 60;
  const d = 55;
  const h = 85;
  return {
    parts: [
      span('applianceWhite', -w / 2, w / 2, 0, h, -d / 2, d / 2, 1.5),
      ring('steel', 15, 1.6, 0, 40, d / 2, 'front'),
      disc('ovenGlass', 14, 0, 40, d / 2 + 0.2),
      span('blackMatte', -w / 2 + 3, w / 2 - 3, h - 12, h - 3, d / 2 - 0.2, d / 2 + 0.2),
    ],
    size: { w, d, h },
    collide: true,
  };
};

/**
 * Prysznic walk-in: tafla szkła w czarnym profilu wzdłuż frontu (oś x), głowica deszczownica na ramieniu.
 * Obrys to brodzik w posadzce (nie blokuje), szkło blokuje osobno w danych.
 */
export const showerGlass: Builder = (p) => {
  const len = num(p, 'len', 80);
  const h = num(p, 'h', 200);
  const head = str(p, 'head', 'blackMetal');
  const depth = num(p, 'depth', 90);
  // Po której stronie (lokalnie) jest ściana, do której przylega tafla.
  const s = p.side === 'right' ? 1 : -1;
  const wallX = (s * len) / 2;
  return {
    parts: [
      span('glassClear', -len / 2, len / 2, 0, h, -0.4, 0.4),
      span(head, wallX - 1, wallX + 1, 0, h, -1, 1), // profil przyścienny
      span(head, -len / 2, len / 2, h - 1.5, h, -1, 1),
      rod(head, 0.8, depth - 10, -wallX - s * 3, h + 0.8, -depth / 2 + 5, 'z'), // drążek stabilizujący
      // Deszczownica na ramieniu ze ściany za szkłem.
      rod(head, 1, 35, wallX - s * 30, 210, -depth + 18, 'z'),
      cylinder(head, 12, 12, 1, wallX - s * 30, 208, -depth + 34, 40),
      cylinder(head, 1.2, 1.2, 100, wallX - s * 15, 95, -depth + 2), // drążek z rączką
      span('sinkBlack', -len / 2 + 10, len / 2 - 10, 0.05, 0.25, -depth + 6, -depth + 10), // odpływ liniowy
    ],
    size: { w: len, d: 2, h },
    collide: true,
  };
};

/** Grzejnik drabinkowy. */
export const towelRadiator: Builder = (p) => {
  const w = num(p, 'w', 50);
  const h = num(p, 'h', 100);
  const mat = str(p, 'mat', 'blackMetal');
  const parts: Part[] = [cylinder(mat, 1.5, 1.5, h, -w / 2, 0, 0), cylinder(mat, 1.5, 1.5, h, w / 2, 0, 0)];
  for (let y = 6; y < h - 2; y += 9) parts.push(rod(mat, 1, w, 0, y, 0));
  return { parts, size: { w: w + 3, d: 8, h }, collide: false };
};

/** Szafka z lustrem nad umywalką, z podświetleniem od spodu (świeci zawsze – łazienka bez okna). */
export const mirrorCabinet: Builder = (p) => {
  const w = num(p, 'w', 116);
  const h = num(p, 'h', 75);
  const d = num(p, 'd', 15);
  return {
    parts: [
      span(str(p, 'mat', 'walnut'), -w / 2, w / 2, 0, h, -d / 2, d / 2 - 0.6, 0.3),
      span('mirror', -w / 2 + 0.3, -0.2, 0.3, h - 0.3, d / 2 - 0.6, d / 2),
      span('mirror', 0.2, w / 2 - 0.3, 0.3, h - 0.3, d / 2 - 0.6, d / 2),
      span('ledAlways', -w / 2 + 3, w / 2 - 3, -0.4, 0, -d / 2 + 4, d / 2 - 4),
    ],
    size: { w, d, h },
    collide: false,
  };
};

/** Bateria ścienna z wylewką (czarny mat). */
export const wallTap: Builder = (p) => ({
  parts: [cylinder(str(p, 'mat', 'blackMetal'), 3, 3, 1, 0, 0, 0.5), rod(str(p, 'mat', 'blackMetal'), 1, 18, 0, 0, 9, 'z'), cylinder(str(p, 'mat', 'blackMetal'), 0.8, 0.8, 6, 6, 1, 0.5)],
  size: { w: 8, d: 18, h: 6 },
  collide: false,
});
