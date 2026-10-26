// Tekstylia i dodatki: zasłony na karniszu, modele GLB (rośliny, fotel).
import type { Builder, Params, Part } from '../types';
import { folds, rod } from '../parts';

const num = (p: Params, key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
const str = (p: Params, key: string, fallback: string) => (typeof p[key] === 'string' ? (p[key] as string) : fallback);

/** Zasłona zebrana w fałdy, zawieszona na karniszu pod sufitem. Front = strona pokoju. */
export const curtain: Builder = (p) => {
  const w = num(p, 'w', 50);
  const ceiling = num(p, 'ceiling', 270);
  const parts: Part[] = [folds(str(p, 'mat', 'curtainLinen'), w, 1, ceiling - 6, 0, num(p, 'depth', 9), num(p, 'period', 12))];
  if (p.rod !== false) parts.push(rod('blackMetal', 1, w + 6, 0, ceiling - 5, -4));
  return { parts, size: { w, d: 10, h: ceiling }, collide: false };
};

/** Model GLB z public/assets/models, przeskalowany do zadanej wysokości. */
export const model: Builder = (p) => {
  const height = num(p, 'height', 80);
  const w = num(p, 'w', 50);
  const d = num(p, 'd', 50);
  return {
    parts: [],
    size: { w, d, h: height },
    collide: p.collide !== false,
    models: [{ file: str(p, 'file', ''), height, rotate: num(p, 'rotate', 0) }],
  };
};
