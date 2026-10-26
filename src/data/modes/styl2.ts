import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import type { FurnitureItem } from '../types';
import { styl1Furniture, styl1FurnitureMaterials, styl1Materials } from './styl1';

/**
 * Styl 2 – „Orzech, trawertyn i zieleń”, wariant 2.
 * Źródło: materialy/style/styl-2/Projekty wnętrz — M12 Skypoint · M21 Sfera II.pdf (rzut – plansza 03, widoki – 04–07).
 * Paleta, kuchnia, hol, ściana za łóżkiem, łazienka i WC jak w stylu 1; różnice niżej.
 */

const octagon: MaterialSpec = { tiles: { w: 20, h: 20 }, color: 0xdccdb5, grout: 0xcbbba1, roughness: 0.6, dots: 0x2f4a3a }; // gres ośmiokątny z zieloną kostką

export const styl2Materials: Record<SurfaceKey, MaterialSpec> = {
  ...styl1Materials,
  threshold: octagon, // progi przy drzwiach z holu – w płytkach holu
};

export const styl2FurnitureMaterials: Record<string, MaterialSpec> = {
  ...styl1FurnitureMaterials,
  octagon,
  seagrass: { tiles: { w: 2.5, h: 300 }, color: 0xd6c4a2, grout: 0xc4ae88, roughness: 1 }, // tapeta z trawy morskiej, owies
  graphite: { color: 0x3b3a38, roughness: 0.8 },
  graphitePaint: { texture: 'paint', color: 0x4a4744, roughness: 0.9, normalScale: 0.3 },
  leather: { color: 0x2a2624, roughness: 0.55 },
  rugDark: { texture: 'carpet', color: 0x4a4540, roughness: 1 },
  throw: { texture: 'fabric', color: 0xd8c8af, roughness: 1 }, // pled w kolorze trawertynu
};

const CEIL = 270;

/** Elementy stylu 1, które w stylu 2 wyglądają inaczej albo stoją gdzie indziej. */
const REPLACED = new Set([
  'stoolA', 'stoolB', 'tvWall', 'nicheBack', 'nicheSideN', 'nicheSideS', 'nicheLed', 'tv', 'tvCabinet',
  'sofa', 'coffeeTable', 'sideTable', 'floorLamp', 'olive', 'livingRug',
  'diningTable', 'chairN', 'chairW', 'chairS', 'diningDome', 'hallRunner',
  'bedWardrobe', 'armchair', 'armchairTable',
  'accentWall', 'deskTop', 'deskDrawers', 'deskLeg', 'deskChair', 'deskShelf1', 'deskShelf2', 'deskShelf3', 'deskLed', 'daybed', 'rollerBlind',
]);

export const styl2Furniture: FurnitureItem[] = [
  ...styl1Furniture.filter((f) => !REPLACED.has(f.id) && !f.id.startsWith('nicheShelf')),

  // ── Podłoga: ośmiokąty 20 × 20 w holu i w pasie kuchni, granica z jodełką mosiężną listwą ──
  { id: 'hallTiles', type: 'block', x: 687.25, y: 61.7, facing: '+y', params: { w: 697.3, d: 123.4, h: 0.3, mat: 'octagon' } },
  { id: 'kitchenTiles', type: 'block', x: 253.35, y: 230.3, facing: '+y', params: { w: 148.7, d: 460.6, h: 0.3, mat: 'octagon' } },
  { id: 'brassStrip', type: 'block', x: 179, y: 230.3, facing: '+x', params: { w: 460.6, d: 0.8, h: 0.35, mat: 'brass' } },

  // ── Półwysep: hokery pod nawisem, jasna kopuła nad blatem ──
  { id: 'stoolA', type: 'stool', x: 225, y: 548, facing: '-y', params: { seat: 'boucle', legs: 'brass' } },
  { id: 'stoolB', type: 'stool', x: 280, y: 548, facing: '-y', params: { seat: 'boucle', legs: 'brass' } },
  { id: 'peninsulaLamp', type: 'pendantDome', x: 252.7, y: 490.65, facing: '+y', params: { r: 18, bottom: 160, mat: 'shelfWhite', cd: 30 } },

  // ── Ściana TV: tapeta z trawy morskiej, panel z orzecha 180 na całą wysokość, TV na panelu, szafka lewitująca ──
  { id: 'seagrassWall', type: 'wallPanel', x: 327.4, y: 705.3, facing: '-x', params: { w: 330.6, h: CEIL, t: 0.6, mat: 'seagrass' } },
  { id: 'tvPanel', type: 'wallPanel', x: 326, y: 710, facing: '-x', params: { w: 180, h: CEIL, t: 2.8, mat: 'walnut' } },
  { id: 'tv', type: 'tv', x: 321.6, y: 710, z: 69, facing: '-x', params: { w: 146, h: 82 } },
  { id: 'tvCabinet', type: 'tvCabinet', x: 304.6, y: 710, facing: '-x', params: { w: 160, d: 40, h: 40, lift: 15, fronts: 'plain', doors: 3, ledUnder: true } },

  // ── Salon: narożnik bouclé 270 × 160 (szezlong od strony kuchni, 44 cm przejścia przy półwyspie), stolik ø 90, trawertynowy ø 40, juta ──
  { id: 'sofa', type: 'sofa', x: 47.5, y: 695, facing: '+x', params: { w: 270, d: 95, accentA: 'cushionOat', accentB: 'cushionGreen' } },
  { id: 'chaise', type: 'block', x: 125, y: 607.5, facing: '+x', params: { w: 95, d: 60, h: 44, r: 6, mat: 'boucle', collide: true } },
  { id: 'coffeeTable', type: 'coffeeTable', x: 190, y: 712, facing: '+x', params: { w: 90, h: 36, shape: 'round', mat: 'walnut' } },
  { id: 'sideTable', type: 'sideTable', x: 65, y: 535, facing: '+x', params: { r: 20, h: 50, mat: 'travertine' } },
  { id: 'floorLamp', type: 'floorLampShade', x: 20, y: 540, facing: '+x', params: { h: 165, cd: 25, stem: 'brass' } },
  { id: 'olive', type: 'model', x: 35, y: 852, facing: '+x', params: { file: 'potted_plant_04.glb', height: 120, w: 45, d: 45 } },
  { id: 'livingRug', type: 'rug', x: 175, y: 712, facing: '+x', params: { w: 240, d: 170, mat: 'rugJute' } },

  // ── Jadalnia: stół orzech 180 × 90, tapicerowana ławka pod lewą ścianą, 3 krzesła bouclé, dwie czarne kopuły ──
  { id: 'diningTable', type: 'diningTable', x: 87, y: 231.5, facing: '+x', params: { shape: 'square', w: 180, d: 90, mat: 'walnut' } },
  { id: 'bench', type: 'block', x: 20, y: 231.5, facing: '+x', params: { w: 180, d: 40, h: 45, r: 4, mat: 'boucle', collide: true } },
  { id: 'benchBack', type: 'block', x: 5, y: 231.5, z: 45, facing: '+x', params: { w: 180, d: 10, h: 40, r: 4, mat: 'boucle' } },
  { id: 'chairN', type: 'diningChair', x: 156, y: 172, facing: '-x', params: { seat: 'boucle' } },
  { id: 'chairM', type: 'diningChair', x: 156, y: 231.5, facing: '-x', params: { seat: 'boucle' } },
  { id: 'chairS', type: 'diningChair', x: 156, y: 291, facing: '-x', params: { seat: 'boucle' } },
  { id: 'diningDomeN', type: 'pendantDome', x: 87, y: 186, facing: '+y', params: { r: 20, bottom: 150, cd: 30 } },
  { id: 'diningDomeS', type: 'pendantDome', x: 87, y: 277, facing: '+y', params: { r: 20, bottom: 150, cd: 30 } },

  // ── Sypialnia: szafa przesuwna 292 × 65 naprzeciw łóżka, środkowe drzwi odsunięte – TV 43″ na osi łóżka ──
  { id: 'wardrobeL', type: 'block', x: 644.1, y: -266.35, facing: '+x', params: { w: 97.3, d: 60, h: CEIL, collide: true } },
  { id: 'wardrobeM', type: 'block', x: 634.1, y: -169, facing: '+x', params: { w: 97.4, d: 40, h: CEIL, collide: true } },
  { id: 'wardrobeR', type: 'block', x: 644.1, y: -71.65, facing: '+x', params: { w: 97.3, d: 60, h: CEIL, collide: true } },
  { id: 'wardrobeFrontL', type: 'wallPanel', x: 675.1, y: -266.35, z: 1, facing: '+x', params: { w: 97.3, h: CEIL - 2, t: 2, mat: 'limeFront' } },
  { id: 'wardrobeFrontM', type: 'wallPanel', x: 677.3, y: -258, z: 1, facing: '+x', params: { w: 97.3, h: CEIL - 2, t: 2, mat: 'limeFront' } }, // odsunięte na lewe skrzydło
  { id: 'wardrobeFrontR', type: 'wallPanel', x: 675.1, y: -71.65, z: 1, facing: '+x', params: { w: 97.3, h: CEIL - 2, t: 2, mat: 'limeFront' } },
  { id: 'bedTv', type: 'tv', x: 657.1, y: -169, z: 95, facing: '+x', params: { w: 95, h: 55 } },

  // ── Gabinet: ciemniej – grafitowa ściana, biurko 230 × 60, panel orzech z LED, witryny, szafki grafit do sufitu ──
  { id: 'graphiteWall', type: 'wallPanel', x: 604.7, y: -178.2, facing: '-x', params: { w: 338, h: CEIL, t: 0.4, mat: 'graphitePaint' } },
  { id: 'deskTop', type: 'block', x: 574.9, y: -231, z: 72, facing: '-x', params: { w: 228, d: 60, h: 4, collide: true } },
  { id: 'deskSupport', type: 'block', x: 575.9, y: -343.5, facing: '-x', params: { w: 3, d: 58, h: 72, mat: 'graphite' } },
  { id: 'deskDrawers', type: 'drawers', x: 577.4, y: -146.7, facing: '-x', params: { w: 59, d: 55, h: 72, n: 3, mat: 'graphite' } },
  { id: 'deskPanel', type: 'wallPanel', x: 603.9, y: -231, z: 76, facing: '-x', params: { w: 228, h: 61, t: 1.5, mat: 'walnut' } },
  { id: 'deskPanelLed', type: 'block', x: 601.5, y: -231, z: 136.4, facing: '-x', params: { w: 224, d: 1, h: 0.6, mat: 'led' } },
  { id: 'vitrineBack', type: 'wallPanel', x: 603.9, y: -231, z: 137, facing: '-x', params: { w: 228, h: 68, t: 1.5, mat: 'walnut' } },
  ...[137, 170].map((z, i): FurnitureItem => ({ id: `vitrineShelf${i}`, type: 'block', x: 588.9, y: -231, z, facing: '-x', params: { w: 228, d: 30, h: 2 } })),
  ...[-288, -231, -174].map((y, i): FurnitureItem => ({ id: `vitrineDivider${i}`, type: 'block', x: 588.9, y, z: 139, facing: '-x', params: { w: 2, d: 30, h: 66 } })),
  ...[168.4, 204.4].map((z, i): FurnitureItem => ({ id: `vitrineLed${i}`, type: 'block', x: 600, y: -231, z, facing: '-x', params: { w: 224, d: 1, h: 0.6, mat: 'led' } })),
  { id: 'graphiteCabinets', type: 'wallCabinet', x: 587.4, y: -231, z: 205, facing: '-x', params: { w: 228, h: 65, doors: 4, front: 'graphite', carcass: 'graphite', underLight: false } },
  { id: 'monitor', type: 'tv', x: 592, y: -250, z: 92, facing: '-x', params: { w: 70, h: 40 } },
  { id: 'monitorStand', type: 'block', x: 595, y: -250, z: 76, facing: '-x', params: { w: 4, d: 12, h: 18, mat: 'blackMatte' } },
  { id: 'pcTower', type: 'block', x: 582, y: -170, z: 76, facing: '-x', params: { w: 20, d: 42, h: 45, mat: 'blackMatte', r: 1 } },
  { id: 'pegboard', type: 'wallPanel', x: 604.2, y: -63, z: 120, facing: '-x', params: { w: 70, h: 90, t: 1, mat: 'blackMatte' } },
  { id: 'deskChair', type: 'diningChair', x: 515, y: -245, facing: '+x', params: { mat: 'blackMatte', seat: 'leather' } },
  { id: 'officeRug', type: 'rug', x: 495, y: -231, facing: '+x', params: { w: 200, d: 150, mat: 'rugDark' } },
  // Leżanka dla gościa: drewniana rama, poduchy bouclé.
  { id: 'daybed', type: 'bed', x: 397.5, y: -202, facing: '+y', params: { w: 90, l: 200, headH: 55, frame: 'walnut', duvet: 'boucle', pillow: 'cushionOat' } },
  { id: 'officeBlind', type: 'wallPanel', x: 462, y: -344, z: 178, facing: '+y', params: { w: 120, h: 57, t: 1, mat: 'curtainTaupe' } },

  // ── Łazienka: wanna w obudowie z ryflowanych płytek ──
  { id: 'tubCasing', type: 'wallPanel', x: 554.6, y: 216.05, facing: '-x', params: { w: 160, h: 55, t: 1, mat: 'clayTiles' } },
];
