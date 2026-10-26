import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import type { FurnitureItem } from '../types';
import { COMMON } from './common';

/**
 * Styl 1 – „Mocca & Orzech”, ciepły ciemny minimalizm.
 * Źródło: materialy/style/styl-1/M12 Skypoint 57 — Styl 1.pdf (paleta – plansza 02, rzut – 03, widoki – 04–08, światło – 09).
 */

// Paleta z planszy 02 (kolory orientacyjne, jak w dokumencie).
const LEN = 0xcfc3b3; // ściany – kolor bazowy
const SPIEK = 0xa89b8b; // kamień – spiek greige 60 × 120

export const styl1Materials: Record<SurfaceKey, MaterialSpec> = {
  ...COMMON,
  wall: { texture: 'paint', tint: 0xd6cab9, roughness: 0.95, normalScale: 0.3 }, // Len, głęboki mat
  wallBathroom: { tiles: { w: 60, h: 120 }, color: SPIEK, grout: 0x8a7d6f, roughness: 0.7, veins: true }, // spiek pionowo, do sufitu
  floor: { texture: 'oakHerringbone', tint: 0xc49e7c, roughness: 0.7 }, // dąb – jodełka, olej, lekko przydymiony
  floorBathroom: { tiles: { w: 60, h: 120 }, color: 0x9f9282, grout: 0x8f8273, roughness: 0.75, veins: true },
  ceiling: { texture: 'paint', tint: 0xf3ede4, roughness: 0.95, normalScale: 0.2 }, // ciepła biel
  threshold: { texture: 'oakHerringbone', tint: 0xc49e7c, roughness: 0.7 }, // jedna podłoga, bez progów
  concrete: { texture: 'smokedOak', tint: 0xb08d6c, roughness: 0.8 }, // balkon: płyty tarasowe drewnopodobne
  doorInterior: { color: 0x4a3b31, roughness: 0.55 },
  doorEntrance: { color: 0x3b2f28, roughness: 0.5 }, // od wewnątrz w odcieniu mocca
  bulb: { color: 0xfff6e8, roughness: 0.3 }, // nieużywane – lampy są meblami
};

/** Paleta mebli stylu 1 (nadpisuje FURNITURE_BASE). */
export const styl1FurnitureMaterials: Record<string, MaterialSpec> = {
  walnut: { texture: 'walnut', tint: 0xc9a07c, roughness: 0.7 }, // dąb wędzony #5A4130 – lamele, fronty, panele
  oakMocca: { texture: 'walnut', tint: 0x8c6c58, roughness: 0.6 }, // dąb barwiony na mocca – stół, stolik
  felt: { color: 0x3b2f28, roughness: 1 }, // filc pod lamelami (mocca)
  upholstery: { texture: 'fabric', tint: 0xdcc2a6, roughness: 1, normalScale: 0.8 }, // welur greige
  boucle: { texture: 'fabric', tint: 0xd6c8b4, roughness: 1, normalScale: 1 }, // bouclé greige – łóżko
  cushionLinen: { texture: 'fabric', tint: 0xfff2e0, roughness: 1 },
  cushionMocca: { texture: 'fabric', tint: 0x5b473b, roughness: 0.9 }, // czekoladowy aksamit
  linenWhite: { color: 0xe9e1d4, roughness: 0.95 }, // pościel len
  duvet: { texture: 'fabric', tint: 0xe6ddcf, roughness: 1, normalScale: 0.4 },
  throw: { texture: 'fabric', tint: 0x4a3a30, roughness: 1 }, // pled mocca
  rug: { texture: 'carpet', tint: 0xcdbca6, roughness: 1 }, // wełna z wyraźnym splotem
  lenLacquer: { color: LEN, roughness: 0.5 }, // górne szafki kuchni – „znikają”
  glinaLacquer: { color: 0x847464, roughness: 0.85 }, // fronty szafy w sypialni (lakier mat jak ściana)
  glinaPaint: { texture: 'paint', tint: 0x948575, roughness: 0.95, normalScale: 0.3 }, // ściana za łóżkiem
  stoneGreige: { color: SPIEK, roughness: 0.5 }, // blaty i plecy kuchni, blat łazienki
  woodTile: { texture: 'smokedOak', tint: 0xc8a37f, roughness: 0.55 }, // gres drewnopodobny w prysznicu
  curtainMocca: { color: 0x3b2f28, roughness: 1, doubleSided: true },
  curtainTaupe: { color: 0x8d7d6d, roughness: 1, doubleSided: true },
  curtainSheer: { color: 0xe2d8ca, roughness: 1, opacity: 0.78, doubleSided: true },
  shadeLinen: { color: 0xe8dfd1, roughness: 0.9, emissive: 0xffd9b0, glow: 1.2, doubleSided: true },
};

const CEIL = 270;

/**
 * Wyposażenie wg rzutu z planszy 03 (wariant po przebudowie). Współrzędne w cm jak w wymiary.md, `facing` = kierunek frontu.
 * Pola skrzydeł drzwi balkonowych (X 69,5–159,5 i 379,5–469,5, do Y ≈ 506) i drzwi wewnętrznych zostają wolne.
 */
export const styl1Furniture: FurnitureItem[] = [
  // ── Salon (plansza 04): lamele na całej nowej ściance, lewitująca szafka RTV, TV 55″ ──
  { id: 'tvLamellas', type: 'lamellaPanel', x: 276.5, y: 400.75, facing: '+x', params: { w: 357.5, h: CEIL, slat: 4, gap: 2, felt: 'felt' } },
  { id: 'wallWasher', type: 'block', x: 283, y: 400.75, z: CEIL - 1.2, facing: '+x', params: { w: 357.5, d: 4, h: 1, mat: 'led' } }, // profil LED w suficie muskający lamele
  { id: 'tv', type: 'tv', x: 280.7, y: 425, z: 72, facing: '+x', params: { w: 122, h: 70 } }, // środek ekranu 107 cm
  { id: 'tvCabinet', type: 'tvCabinet', x: 295.2, y: 425, facing: '+x', params: { w: 200, d: 35, h: 40, lift: 25, fronts: 'plain', doors: 3, ledUnder: true } }, // 54,5 od ściany balkonowej
  { id: 'sofa', type: 'sofa', x: 494, y: 425, facing: '-x', params: { w: 160, d: 90, accentA: 'cushionLinen', accentB: 'cushionMocca' } },
  { id: 'coffeeTable', type: 'coffeeTable', x: 400, y: 425, facing: '-x', params: { w: 60, h: 40, shape: 'round', mat: 'oakMocca' } },
  { id: 'livingRug', type: 'rug', x: 385, y: 440, facing: '-x', params: { w: 230, d: 160 } },
  { id: 'floorLamp', type: 'floorLampShade', x: 300, y: 538, facing: '+x', params: { cd: 22 } },
  { id: 'trackSpot', type: 'trackSpot', x: 405, y: 395, facing: '+y', params: { len: 60, cd: 26 } },

  // ── Aneks i jadalnia (plansza 05): L wokół szachtu, dół dąb wędzony, góra w kolorze ściany do sufitu, spiek ──
  { id: 'fridge', type: 'fridgeColumn', x: 388, y: 30, facing: '+y', params: { h: CEIL } },
  { id: 'hobCabinet', type: 'baseCabinet', x: 448.5, y: 30, facing: '+y', params: { w: 61, appliance: 'hob', top: 'stoneGreige' } },
  { id: 'hobWallCabinet', type: 'wallCabinet', x: 448.5, y: 17.5, z: 150, facing: '+y', params: { w: 61, h: 120, front: 'lenLacquer', carcass: 'lenLacquer' } }, // szafka z okapem
  { id: 'hobSplash', type: 'wallPanel', x: 448.5, y: 0.5, z: 90, facing: '+y', params: { w: 61, h: 60, mat: 'stoneGreige' } },
  { id: 'sinkCabinet', type: 'baseCabinet', x: 509, y: 100, facing: '-x', params: { w: 80, doors: 2, appliance: 'sink', top: 'stoneGreige' } },
  { id: 'dishwasher', type: 'baseCabinet', x: 509, y: 162.5, facing: '-x', params: { w: 45, doors: 1, top: 'stoneGreige' } }, // zmywarka 45 w zabudowie
  { id: 'wallCabinets', type: 'wallCabinet', x: 521.5, y: 122.5, z: 150, facing: '-x', params: { w: 125, h: 120, doors: 2, front: 'lenLacquer', carcass: 'lenLacquer' } },
  { id: 'sinkSplash', type: 'wallPanel', x: 538.5, y: 122.5, z: 90, facing: '-x', params: { w: 125, h: 60, mat: 'stoneGreige' } },
  // Stół 75 × 75 dosunięty do ściany prawej, 43 cm od blatu; 3 krzesła drewniane z plecionym siedziskiem.
  { id: 'diningTable', type: 'diningTable', x: 501.5, y: 265.5, facing: '+y', params: { shape: 'square', w: 75, mat: 'oakMocca' } },
  { id: 'chairN', type: 'diningChair', x: 501.5, y: 210, facing: '+y' },
  { id: 'chairW', type: 'diningChair', x: 446, y: 265.5, facing: '+x' },
  { id: 'chairS', type: 'diningChair', x: 501.5, y: 321, facing: '-y' },
  { id: 'diningCluster', type: 'pendantCluster', x: 501.5, y: 265.5, facing: '+y', params: { bottom: 137, ceiling: CEIL, cd: 38 } }, // ~62 cm nad blatem

  // ── Hol (plansza 08): szafa z lamel przy ścianie wejściowej, lustro 60 × 180 na ściance od kuchni ──
  { id: 'hallWardrobe', type: 'wardrobe', x: 200, y: 25, facing: '+y', params: { w: 80, d: 50, h: CEIL, doors: 2, fronts: 'lamella' } },
  { id: 'hallMirror', type: 'mirrorRect', x: 348.8, y: 150, z: 20, facing: '-x', params: { w: 60, h: 180 } },
  { id: 'hallLight1', type: 'downlight', x: 254, y: 85, facing: '+y', params: { noLight: true } },
  { id: 'hallLight2', type: 'downlight', x: 254, y: 151, facing: '+y', params: { cd: 26 } },
  { id: 'hallLight3', type: 'downlight', x: 212, y: 205, facing: '+y', params: { noLight: true } }, // nad wejściem do sypialni

  // ── Sypialnia (plansza 06): ściana za łóżkiem w kolorze Glina, panel-wezgłowie z półką, szafa do sufitu w kolorze ściany ──
  { id: 'accentWall', type: 'wallPanel', x: 0.2, y: 405.75, facing: '+x', params: { w: 347.5, h: CEIL, t: 0.4, mat: 'glinaPaint' } },
  { id: 'headboardPanel', type: 'headboardPanel', x: 1.4, y: 461.5, facing: '+x', params: { w: 202, h: 112, shelf: 12 } },
  { id: 'bed', type: 'bed', x: 105.4, y: 431, facing: '+x', params: { w: 140, l: 200, headH: 95, frame: 'boucle', upholstered: true, pillow: 'cushionLinen' } },
  { id: 'bedWardrobe', type: 'wardrobe', x: 30.4, y: 293.5, facing: '+x', params: { w: 120, d: 60, h: CEIL, doors: 2, front: 'glinaLacquer', handles: 'bar' } },
  { id: 'nightstand', type: 'drawers', x: 22.4, y: 532.5, facing: '+x', params: { w: 40, d: 40, h: 48, n: 1 } },
  { id: 'nightLamp', type: 'tableLamp', x: 22.4, y: 538, z: 48, facing: '+x' },
  { id: 'sconceN', type: 'wallSpot', x: 2.6, y: 372, z: 125, facing: '+x', params: { mat: 'blackMetal' } },
  { id: 'sconceS', type: 'wallSpot', x: 2.6, y: 491, z: 125, facing: '+x', params: { mat: 'blackMetal' } },
  { id: 'shelfArtA', type: 'artFrame', x: 4, y: 418, z: 112, facing: '+x', params: { w: 34, h: 44 } },
  { id: 'shelfArtB', type: 'artFrame', x: 4, y: 458, z: 112, facing: '+x', params: { w: 44, h: 54 } },
  { id: 'bedPendant', type: 'pendantRattan', x: 132, y: 431, facing: '+y', params: { r: 26, drop: 70, ceiling: CEIL, cd: 40 } },
  { id: 'bedRug', type: 'rug', x: 185, y: 435, facing: '+x', params: { w: 200, d: 130 } }, // w poprzek przejścia przy nogach łóżka

  // ── Zasłony: szyna pod sufitem, lniana firana + zasłona zaciemniająca (salon mocca, sypialnia taupe) ──
  { id: 'curtainBedL', type: 'curtain', x: 36, y: 559, facing: '-y', params: { w: 56, mat: 'curtainTaupe', ceiling: CEIL } },
  { id: 'sheerBed', type: 'curtain', x: 186, y: 571, facing: '-y', params: { w: 48, mat: 'curtainSheer', ceiling: CEIL, depth: 6, period: 9 } },
  { id: 'curtainBedR', type: 'curtain', x: 236.5, y: 568, facing: '-y', params: { w: 51, mat: 'curtainTaupe', ceiling: CEIL } },
  { id: 'curtainLivL', type: 'curtain', x: 300, y: 568, facing: '-y', params: { w: 44, mat: 'curtainMocca', ceiling: CEIL } },
  { id: 'sheerLiv', type: 'curtain', x: 348, y: 571, facing: '-y', params: { w: 50, mat: 'curtainSheer', ceiling: CEIL, depth: 6, period: 9 } },
  { id: 'curtainLivR', type: 'curtain', x: 503, y: 559, facing: '-y', params: { w: 60, mat: 'curtainMocca', ceiling: CEIL } },

  // ── Łazienka (plansza 07): spiek do sufitu, gres drewnopodobny w prysznicu, wspólny blat nad pralką i szafką ──
  { id: 'showerWoodL', type: 'wallPanel', x: 0.3, y: 182, facing: '+x', params: { w: 80, h: CEIL, t: 0.6, mat: 'woodTile' } },
  { id: 'showerWoodB', type: 'wallPanel', x: 45, y: 221.7, facing: '-y', params: { w: 90, h: CEIL, t: 0.6, mat: 'woodTile' } },
  { id: 'showerNiche', type: 'block', x: 1, y: 182, z: 110, facing: '+x', params: { w: 50, d: 1, h: 30, mat: 'felt' } },
  { id: 'showerNicheLed', type: 'block', x: 1.6, y: 182, z: 139, facing: '+x', params: { w: 48, d: 0.6, h: 0.8, mat: 'ledAlways' } },
  { id: 'shower', type: 'showerGlass', x: 35, y: 142, facing: '-y', params: { len: 70, h: 200, depth: 80, side: 'right' } },
  { id: 'wcFrame', type: 'block', x: 10, y: 101, facing: '+x', params: { w: 82, d: 20, h: 110, mat: 'wallBathroom', collide: true } }, // zabudowa stelaża = półka
  { id: 'wc', type: 'wcWallHung', x: 47, y: 101, facing: '+x', params: { mat: 'ceramicWhite', plateZ: 86 } },
  { id: 'bathCounter', type: 'block', x: 90, y: 26, z: 86, facing: '+y', params: { w: 120, d: 52, h: 4, mat: 'stoneGreige' } },
  { id: 'basin', type: 'block', x: 121, y: 27, z: 89.8, facing: '+y', params: { w: 40, d: 32, h: 0.4, mat: 'ceramicWhite', r: 0.1 } },
  { id: 'bathTap', type: 'wallTap', x: 121, y: 0.5, z: 100, facing: '+y' },
  { id: 'washer', type: 'washer', x: 61, y: 27.5, facing: '+y' },
  { id: 'basinDrawer', type: 'drawers', x: 121, y: 25, z: 52, facing: '+y', params: { w: 58, d: 50, h: 34, n: 1 } },
  { id: 'mirrorCabinet', type: 'mirrorCabinet', x: 90, y: 7.5, z: 112, facing: '+y', params: { w: 116, h: 75, d: 15 } },
  { id: 'towelRail', type: 'towelRadiator', x: 146, y: 182, z: 40, facing: '-x', params: { w: 50, h: 100 } },
  { id: 'bathLight1', type: 'downlight', x: 105, y: 106, facing: '+y', params: { cd: 28, alwaysOn: true } },
  { id: 'bathLight2', type: 'downlight', x: 121, y: 186, facing: '+y', params: { alwaysOn: true, noLight: true } },

  // ── Balkon: stolik z dwoma krzesłami, donica, kinkiet zewnętrzny na filarze ──
  { id: 'balconyTable', type: 'diningTable', x: 180, y: 680, facing: '+y', params: { r: 30, h: 72, mat: 'blackMatte' } },
  { id: 'balconyChairW', type: 'diningChair', x: 128, y: 680, facing: '+x', params: { mat: 'blackMatte' } },
  { id: 'balconyChairE', type: 'diningChair', x: 232, y: 680, facing: '-x', params: { mat: 'blackMatte' } },
  { id: 'planter', type: 'block', x: 420, y: 738, facing: '-y', params: { w: 90, d: 30, h: 40, mat: 'walnut', collide: true } },
  { id: 'planterPlantA', type: 'model', x: 395, y: 738, z: 40, facing: '-y', params: { file: 'potted_plant_04.glb', height: 26, w: 20, d: 20, collide: false } },
  { id: 'planterPlantB', type: 'model', x: 420, y: 738, z: 40, facing: '-y', params: { file: 'potted_plant_04.glb', height: 30, w: 20, d: 20, collide: false, rotate: 70 } },
  { id: 'planterPlantC', type: 'model', x: 445, y: 738, z: 40, facing: '-y', params: { file: 'potted_plant_04.glb', height: 24, w: 20, d: 20, collide: false, rotate: 140 } },
  { id: 'balconySconce', type: 'wallSpot', x: 269.5, y: 619, z: 200, facing: '+y', params: { mat: 'blackMetal' } },
];
