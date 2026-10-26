// Oprawy oświetleniowe; każda oddaje też źródło światła (włączane wieczorem).
import * as THREE from 'three';
import type { Builder, Params, Part } from '../types';
import { cylinder, sphere, span } from '../parts';

const num = (p: Params, key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
const str = (p: Params, key: string, fallback: string) => (typeof p[key] === 'string' ? (p[key] as string) : fallback);
const color = (p: Params) => num(p, 'color', 0xffcf9e); // ok. 2700–3000 K

/** Lampa wisząca: kula z mlecznego szkła na przewodzie. `y` w danych = wysokość sufitu (270). */
export const pendantGlobe: Builder = (p) => {
  const r = num(p, 'r', 15);
  const drop = num(p, 'drop', 90);
  const ceiling = num(p, 'ceiling', 270);
  const cy = ceiling - drop - r;
  return {
    parts: [cylinder('blackMetal', 6, 6, 2, 0, ceiling - 2, 0), cylinder('cable', 0.3, 0.3, drop, 0, ceiling - drop, 0), cylinder('blackMetal', 3, 3, 4, 0, cy + r - 1, 0), sphere('opal', r, 0, cy, 0, 32)],
    size: { w: 2 * r, d: 2 * r, h: ceiling },
    collide: false,
    lights: [{ x: 0, y: cy, z: 0, intensity: num(p, 'cd', 40), color: color(p) }],
  };
};

/** Lampa wisząca z rattanu (warstwowy klosz). */
export const pendantRattan: Builder = (p) => {
  const r = num(p, 'r', 28);
  const drop = num(p, 'drop', 70);
  const ceiling = num(p, 'ceiling', 270);
  const bottom = ceiling - drop - 48;
  const parts: Part[] = [cylinder('blackMetal', 6, 6, 2, 0, ceiling - 2, 0), cylinder('cable', 0.3, 0.3, drop, 0, ceiling - drop, 0)];
  // Trzy kondygnacje klosza o malejącej średnicy.
  for (const [i, k] of [[0, 1], [1, 0.82], [2, 0.6]] as const) parts.push(cylinder('rattan', r * k, r * k, 16, 0, bottom + i * 16, 0, 32));
  parts.push(sphere('opal', 6, 0, bottom + 18, 0, 16));
  return {
    parts,
    size: { w: 2 * r, d: 2 * r, h: ceiling },
    collide: false,
    lights: [{ x: 0, y: bottom - 5, z: 0, intensity: num(p, 'cd', 45), color: color(p) }],
  };
};

/** Oczko sufitowe (downlight). */
export const downlight: Builder = (p) => {
  const ceiling = num(p, 'ceiling', 270);
  return {
    parts: [cylinder(str(p, 'mat', 'blackMatte'), 5, 5, 0.6, 0, ceiling - 0.6, 0, 24), cylinder(p.alwaysOn ? 'ledAlways' : 'led', 3.5, 3.5, 0.2, 0, ceiling - 0.8, 0, 24)],
    size: { w: 10, d: 10, h: ceiling },
    collide: false,
    // `noLight` – sama świecąca oprawa bez źródła światła (oszczędność na telefonach).
    lights: p.noLight ? undefined : [{ x: 0, y: ceiling - 15, z: 0, intensity: num(p, 'cd', 25), color: color(p), alwaysOn: Boolean(p.alwaysOn) }],
  };
};

/** Lampa podłogowa z trzema kulami. */
export const floorLampGlobes: Builder = (p) => {
  const h = num(p, 'h', 160);
  const parts: Part[] = [cylinder('blackMetal', 14, 15, 2, 0, 0, 0, 32), cylinder('blackMetal', 1, 1, h - 10, 0, 2, 0)];
  const globes: [number, number, number][] = [[0, h - 2, 0], [10, h - 40, 4], [-6, h - 75, -5]];
  for (const [x, y, z] of globes) {
    parts.push(span('blackMetal', Math.min(0, x), Math.max(0, x) + 0.6, y - 0.3, y + 0.3, z - 0.3, z + 0.3));
    parts.push(sphere('opal', 9, x, y + 8, z, 24));
  }
  return {
    parts,
    size: { w: 32, d: 32, h: h + 18 },
    collide: true,
    lights: [{ x: 0, y: h - 30, z: 0, intensity: num(p, 'cd', 25), color: color(p) }],
  };
};

/** Kinkiet / lampka nad łóżkiem (mała, bez osobnego światła – tylko świecący klosz). */
export const wallSpot: Builder = (p) => ({
  parts: [span(str(p, 'mat', 'shelfWhite'), -2, 2, -2, 2, -2, 6), cylinder(str(p, 'mat', 'shelfWhite'), 3.5, 3.5, 9, 0, -10, 8), cylinder('opal', 3, 3, 0.3, 0, -10.2, 8)],
  size: { w: 8, d: 12, h: 12 },
  collide: false,
});

/** Żyrandol typu „sputnik”: pionowy pręt z ramionami zakończonymi mlecznymi kulami. */
export const chandelierGlobes: Builder = (p) => {
  const drop = num(p, 'drop', 80);
  const ceiling = num(p, 'ceiling', 270);
  const arms = num(p, 'arms', 6);
  const reach = num(p, 'reach', 38);
  const hub = ceiling - drop;
  const parts: Part[] = [cylinder('blackMetal', 6, 6, 2, 0, ceiling - 2, 0), cylinder('blackMetal', 0.8, 0.8, drop, 0, hub, 0), sphere('blackMetal', 3, 0, hub, 0, 16)];
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2;
    const tilt = i % 2 ? 12 : -8; // ramiona na dwóch wysokościach
    const [x, z] = [Math.cos(a) * reach, Math.sin(a) * reach];
    const mid = { x: x / 2, z: z / 2 };
    const len = Math.hypot(x, tilt, z);
    const arm = cylinder('blackMetal', 0.5, 0.5, len, 0, -len / 2, 0, 8);
    arm.geo.rotateX(Math.PI / 2);
    arm.geo.lookAt(new THREE.Vector3(x, tilt, z));
    arm.geo.translate(mid.x, hub + tilt / 2, mid.z);
    parts.push(arm, sphere('opal', 7, x, hub + tilt, z, 20));
  }
  return {
    parts,
    size: { w: 2 * reach, d: 2 * reach, h: ceiling },
    collide: false,
    lights: [{ x: 0, y: hub - 5, z: 0, intensity: num(p, 'cd', 45), color: color(p) }],
  };
};

/** Lampa podłogowa z lnianym abażurem. */
export const floorLampShade: Builder = (p) => {
  const h = num(p, 'h', 155);
  return {
    parts: [
      cylinder('blackMetal', 13, 14, 2, 0, 0, 0, 32),
      cylinder(str(p, 'stem', 'blackMetal'), 1, 1, h - 30, 0, 2, 0),
      cylinder(str(p, 'shade', 'shadeLinen'), 18, 22, 30, 0, h - 30, 0, 40),
      cylinder('opal', 4, 4, 6, 0, h - 26, 0, 16),
    ],
    size: { w: 44, d: 44, h },
    collide: true,
    lights: [{ x: 0, y: h - 22, z: 0, intensity: num(p, 'cd', 25), color: color(p) }],
  };
};

/** Grono trzech kul z mlecznego szkła na przewodach różnej długości. `bottom` – wysokość dołu najniższej kuli. */
export const pendantCluster: Builder = (p) => {
  const ceiling = num(p, 'ceiling', 270);
  const bottom = num(p, 'bottom', 137);
  const globes: [number, number, number, number][] = [[0, 0, 13, 0], [-12, 6, 10, 22], [11, -7, 9, 30]]; // x, z, promień, wyżej o
  const parts: Part[] = [cylinder('blackMetal', 7, 7, 2, 0, ceiling - 2, 0)];
  for (const [x, z, r, up] of globes) {
    const cy = bottom + up + r;
    parts.push(cylinder('cable', 0.25, 0.25, ceiling - cy - r, x, cy + r, z), cylinder('blackMetal', 2.5, 2.5, 3, x, cy + r - 1, z), sphere('opal', r, x, cy, z, 28));
  }
  return {
    parts,
    size: { w: 50, d: 50, h: ceiling },
    collide: false,
    lights: [{ x: 0, y: bottom + 20, z: 0, intensity: num(p, 'cd', 40), color: color(p) }],
  };
};

/** Czarny reflektor natynkowy z trzema kierunkowymi punktami na belce. */
export const trackSpot: Builder = (p) => {
  const ceiling = num(p, 'ceiling', 270);
  const len = num(p, 'len', 60);
  const parts: Part[] = [span('blackMatte', -len / 2, len / 2, ceiling - 3, ceiling, -2, 2, 0.5)];
  for (const x of [-len / 2 + 8, 0, len / 2 - 8]) {
    parts.push(cylinder('blackMatte', 0.8, 0.8, 5, x, ceiling - 8, 0), cylinder('blackMatte', 3.2, 3.2, 10, x, ceiling - 18, 0), cylinder('led', 2.6, 2.6, 0.3, x, ceiling - 18.2, 0));
  }
  return { parts, size: { w: len, d: 6, h: ceiling }, collide: false, lights: [{ x: 0, y: ceiling - 25, z: 0, intensity: num(p, 'cd', 30), color: color(p) }] };
};

/** Lampka nocna: czarna podstawa i klosz (świeci tylko kloszem). */
export const tableLamp: Builder = (p) => ({
  parts: [cylinder('blackMetal', 6, 7, 2, 0, 0, 0, 24), cylinder('blackMetal', 0.8, 0.8, 26, 0, 2, 0), cylinder(str(p, 'shade', 'shadeLinen'), 7, 10, 14, 0, 26, 0, 28)],
  size: { w: 20, d: 20, h: 40 },
  collide: false,
});
