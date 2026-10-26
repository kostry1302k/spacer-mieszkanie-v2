import type { MaterialSpec, SurfaceKey } from '../../scene/materials';

/** Powierzchnie wspólne dla wszystkich trybów (stolarka i elementy od dewelopera, otoczenie). */
export const COMMON = {
  concrete: { texture: 'concrete', tint: 0xd0cdc8, roughness: 1 }, // płyta balkonu
  facade: { color: 0xe9e6df, roughness: 0.9 }, // elewacja – tynk cienkowarstwowy
  ground: { color: 0x5f6e3c, roughness: 1 }, // trawa pod budynkiem
  frame: { color: 0x3b3e42, roughness: 0.45 }, // stolarka okienna antracyt
  glass: { color: 0xc9dbe6, roughness: 0.05, opacity: 0.12 },
  doorEntrance: { color: 0x56534f, roughness: 0.45, metalness: 0.3 },
  metal: { color: 0x2a2b2d, roughness: 0.4, metalness: 0.7 },
  radiator: { color: 0xf1f1ee, roughness: 0.35 },
  fixture: { color: 0xf4f3ef, roughness: 0.4 },
  cable: { color: 0x2d2d2d, roughness: 0.6 },
} satisfies Partial<Record<SurfaceKey, MaterialSpec>>;

/**
 * Domyślna paleta mebli – każdy styl może nadpisać pojedyncze materiały.
 * Nazwy odpowiadają tym używanym w builderach (src/furniture/builders).
 */
export const FURNITURE_BASE = {
  walnut: { texture: 'walnut', tint: 0xdcb596, roughness: 0.7 }, // ciepły orzech
  upholstery: { texture: 'fabric', tint: 0xa79a8b, roughness: 1, normalScale: 0.8 },
  cushionBordo: { texture: 'fabric', tint: 0x7a2a34, roughness: 1 },
  cushionGreen: { texture: 'fabric', tint: 0x3b5a45, roughness: 1 },
  linenWhite: { color: 0xeeece8, roughness: 0.95 },
  duvet: { texture: 'fabric', tint: 0xd2d0cc, roughness: 1, normalScale: 0.4 },
  throw: { texture: 'fabric', tint: 0x55524f, roughness: 1 },
  blackMatte: { color: 0x1e1d1c, roughness: 0.65 },
  blackMetal: { color: 0x171717, roughness: 0.35, metalness: 0.7 },
  steel: { color: 0xa5a7aa, roughness: 0.3, metalness: 0.9 },
  stoneDark: { color: 0x2d2b29, roughness: 0.45 },
  ovenGlass: { color: 0x0d0d0e, roughness: 0.08, metalness: 0.3 },
  sinkBlack: { color: 0x161616, roughness: 0.4 },
  fluted: { color: 0x6c6a66, roughness: 0.15, metalness: 0.2, opacity: 0.7 },
  shelfWhite: { color: 0xf2f0ec, roughness: 0.5 },
  art: { color: 0xc8b49c, roughness: 0.9 },
  rug: { texture: 'carpet', tint: 0xddd4c7, roughness: 1 },
  rugJute: { texture: 'wicker', tint: 0xc8ad86, roughness: 1, normalScale: 0.6 },
  rattan: { texture: 'wicker', tint: 0xffffff, roughness: 0.9, doubleSided: true },
  opal: { color: 0xf7f3ec, roughness: 0.3, emissive: 0xffd9b0, glow: 2.5 },
  led: { color: 0xffe6c8, roughness: 0.4, emissive: 0xffc98a, glow: 4 },
  ledAlways: { color: 0xffe6c8, roughness: 0.4, emissive: 0xffc98a, glow: 4, alwaysOn: true },
  mirror: { color: 0x5c6164, roughness: 0.1, metalness: 1 }, // ciemniej i matowiej – odbija niebo z HDRI, nie pokój
  glassClear: { color: 0xd8e4ea, roughness: 0.05, opacity: 0.18 },
  ceramicBlack: { color: 0x1b1b1b, roughness: 0.2 },
  ceramicWhite: { color: 0xf5f5f3, roughness: 0.18 },
  applianceWhite: { color: 0xf1f1f0, roughness: 0.3 },
  tvScreen: { color: 0x08090a, roughness: 0.12, metalness: 0.2 },
  curtainLinen: { color: 0xd9d1c4, roughness: 1, doubleSided: true },
  curtainDark: { color: 0x3d2f27, roughness: 1, doubleSided: true },
  curtainTaupe: { color: 0x9c8b7b, roughness: 1, doubleSided: true },
  oakLight: { texture: 'oak', tint: 0xffffff, roughness: 0.65 },
  panelDark: { texture: 'walnut', tint: 0x9a7a62, roughness: 0.75 },
  blackFront: { color: 0x1c1c1d, roughness: 0.55 },
  stoneLight: { color: 0xd9d3c9, roughness: 0.35 },
  wardrobeGreige: { color: 0xd8d2c9, roughness: 0.55 }, // fronty bezuchwytowe, jasny greige
  bedFabric: { texture: 'fabric', tint: 0xa79d91, roughness: 1, normalScale: 0.8 },
  cushionOat: { texture: 'fabric', tint: 0xcbbca6, roughness: 1 },
  cushionBlack: { texture: 'fabric', tint: 0x2b2a29, roughness: 1 },
  shadeLinen: { color: 0xefe8dc, roughness: 0.9, emissive: 0xffe2bb, glow: 1.2, doubleSided: true },
} satisfies Record<string, MaterialSpec>;
