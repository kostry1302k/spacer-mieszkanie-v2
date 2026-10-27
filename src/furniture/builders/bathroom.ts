// Wyposażenie łazienki: szafka z umywalką, lustro z LED, WC podwieszane, pralka, ścianka prysznica, grzejnik drabinkowy.
import * as THREE from 'three';
import type { Builder, Params, Part } from '../types';
import { basin, box, cylinder, disc, extrude, lathe, outline, plate, ring, rod, span, tube, type Outline } from '../parts';

const num = (p: Params, key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
const str = (p: Params, key: string, fallback: string) => (typeof p[key] === 'string' ? (p[key] as string) : fallback);

/** Umywalka nablatowa: toczona misa o cienkiej ściance, zaokrąglony rant, odpływ. Owal w × d, wysokość h. */
function vessel(mat: string, w: number, d: number, h: number, x: number, y: number, z: number): Part[] {
  const R = d / 2;
  const profile: [number, number][] = [
    [0, 0], [0.45, 0], [0.63, 0.04], [0.83, 0.25], [0.96, 0.58], [1, 0.9], [0.995, 0.98], [0.97, 1], [0.945, 0.97],
    [0.935, 0.88], [0.88, 0.56], [0.74, 0.28], [0.5, 0.15], [0, 0.135],
  ];
  return [
    lathe(mat, profile.map(([r, v]) => [r * R, v * h]), x, y, z, w / d, 1),
    cylinder('steel', 0.15 * R, 0.15 * R, 0.25, x, y + 0.135 * h, z, 32), // korek
  ];
}

/** Umywalka nablatowa jako osobny element (na blacie). */
export const vesselBasin: Builder = (p) => {
  const w = num(p, 'w', 45);
  const d = num(p, 'd', 35);
  return { parts: vessel(str(p, 'mat', 'ceramicWhite'), w, d, num(p, 'h', 13), 0, 0, 0), size: { w, d, h: 13 }, collide: false };
};

/** Bateria ścienna: rozeta z wylewką (lekko opadający łuk, perlator) i druga rozeta z dźwignią nad nią. Ściana na z = 0. */
function wallSpout(mat: string, x: number, y: number, z: number): Part[] {
  return [
    rod(mat, 3, 1.2, x, y, z + 0.6, 'z'),
    tube(mat, [[x, y, z + 1], [x, y - 0.2, z + 8], [x, y - 1, z + 15], [x, y - 2.2, z + 18]], 1.05),
    cylinder(mat, 1.2, 1.2, 1.8, x, y - 4, z + 18.2, 24),
    rod(mat, 2.6, 1.2, x, y + 10, z + 0.6, 'z'),
    cylinder(mat, 1.1, 1.1, 2.4, x, y + 8.8, z + 2.2, 20),
    rod(mat, 0.55, 7, x, y + 10, z + 5.5, 'z'), // dźwignia
  ];
}

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
  parts.push(...vessel(basin, w - 14, d - 12, 13, 0, top, 2)); // umywalka nablatowa
  parts.push(...wallSpout(str(p, 'tap', 'blackMetal'), 0, top + 24, -d / 2)); // bateria z wylewką ze ściany
  return { parts, size: { w, d, h: top + 25 }, collide: true };
};

/**
 * Lustro z prawdziwym odbiciem (Reflector w place.ts): kontur rect / round / oval / capsule / arch,
 * rama (mosiądz, czarny metal…; `frameW: 0` – bez ramy), opcjonalne podświetlenie od tyłu.
 */
export const mirror: Builder = (p) => {
  const kind = str(p, 'shape', 'rect') as Outline;
  const w = num(p, 'w', 60);
  const h = num(p, 'h', 90);
  const fw = num(p, 'frameW', 1.5);
  const r = num(p, 'r', 3);
  const parts: Part[] = [extrude('blackMatte', outline(new THREE.Shape(), kind, w, h, 0, r), 0.8, 0.2, 0)]; // tył tafli
  if (fw > 0) {
    const frame = outline(new THREE.Shape(), kind, w, h, fw, r);
    frame.holes.push(outline(new THREE.Path(), kind, w, h, 0, r));
    parts.push(extrude(str(p, 'frame', 'brass'), frame, 2.4, 0, 0.5));
  }
  if (p.backlit) parts.push(extrude('ledAlways', outline(new THREE.Shape(), kind, w, h, fw + 1.5, r), 0.4, -0.5, 0)); // poświata LED na ścianie
  return { parts, size: { w: w + 2 * fw, d: 3, h: h + 2 * fw }, collide: false, mirrors: [{ kind, w, h, r, z: 1.1 }] };
};

/** Okrągłe lustro z podświetleniem LED od tyłu (świeci także w dzień – łazienka bez okna). */
export const mirrorRound: Builder = (p) => mirror({ shape: 'round', w: 2 * num(p, 'r', 30), h: 2 * num(p, 'r', 30), frame: 'blackMetal', frameW: 0.8, backlit: true });

/** Lustro prostokątne z zaokrąglonymi narożnikami i podświetleniem. */
export const mirrorBacklit: Builder = (p) => mirror({ shape: 'rect', w: num(p, 'w', 55), h: num(p, 'h', 75), r: 4, frameW: 0, backlit: true });

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
      span('ledAlways', -w / 2 + 3, w / 2 - 3, -0.4, 0, -d / 2 + 4, d / 2 - 4),
    ],
    size: { w, d, h },
    collide: false,
    mirrors: [-1, 1].map((side) => ({ kind: 'rect' as const, w: w / 2 - 0.8, h: h - 0.6, r: 0.3, x: (side * w) / 4, y: 0.3, z: d / 2 - 0.5 })),
  };
};

/** Bateria ścienna z wylewką (czarny mat). */
export const wallTap: Builder = (p) => ({ parts: wallSpout(str(p, 'mat', 'blackMetal'), 0, 0, 0), size: { w: 8, d: 20, h: 16 }, collide: false });

/**
 * Wanna zabudowana: obrzeże z otworem o zaokrąglonych narożnikach, misa z łagodnie zaokrąglonym dnem,
 * odpływ i przelew. Front = dłuższy bok od pokoju.
 */
export const bathtub: Builder = (p) => {
  const w = num(p, 'w', 160);
  const d = num(p, 'd', 70);
  const h = num(p, 'h', 55);
  const mat = str(p, 'mat', 'ceramicWhite');
  const metal = str(p, 'metal', 'brass');
  const rim = 7;
  const deck = h - 3;
  const bottom = 6;
  return {
    parts: [
      plate(mat, w, d, 3, h, { w: w - 2 * rim, d: d - 2 * rim, r: 16 }, 0.6),
      span(mat, -w / 2, w / 2, 0, deck, d / 2 - 2, d / 2),
      span(mat, -w / 2, w / 2, 0, deck, -d / 2, -d / 2 + 2),
      span(mat, -w / 2, -w / 2 + 2, 0, deck, -d / 2, d / 2),
      span(mat, w / 2 - 2, w / 2, 0, deck, -d / 2, d / 2),
      basin(mat, w - 2 * rim + 2, d - 2 * rim + 2, deck - bottom, 16, 0, deck, 0),
      cylinder(metal, 2.6, 2.6, 0.3, -w / 2 + rim + 16, bottom, 0, 32), // odpływ
      rod(metal, 2.4, 0.6, -w / 2 + rim - 0.7, h - 16, 0, 'x'), // przelew
    ],
    size: { w, d, h },
    collide: true,
  };
};
