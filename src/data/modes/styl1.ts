import type { MaterialSpec, SurfaceKey } from '../../scene/materials';
import type { FurnitureItem } from '../types';
import { COMMON } from './common';

/**
 * Styl „Orzech, trawertyn i zieleń”.
 * Źródło: materialy/style/styl-1/Projekty wnętrz — M12 Skypoint · M21 Sfera II.pdf (paleta, rzut, widoki pomieszczeń).
 */

// Paleta z moodboardu (kolory orientacyjne).
const WAPNO = 0xf4ece0; // tint farby wapiennej → ok. #EEE7DC
const TRAWERTYN = 0xd8c8af;
const ZIELEN = 0x2f4a3a;

const limewash: MaterialSpec = { texture: 'paint', tint: WAPNO, roughness: 0.95, normalScale: 0.35 };
const oakHerringbone: MaterialSpec = { texture: 'oakHerringbone', tint: 0xd0ae8e, roughness: 0.8 }; // dąb jodełka, olej
const terrazzo: MaterialSpec = { tiles: { w: 60, h: 60 }, color: 0xe6ddd0, grout: 0xd6ccbe, roughness: 0.5, speckle: true };

export const styl1Materials: Record<SurfaceKey, MaterialSpec> = {
  ...COMMON,
  wall: limewash,
  wallBathroom: limewash, // płytki w łazienkach to panele w danych mebli (do 120 / do sufitu)
  floor: oakHerringbone,
  floorBathroom: terrazzo,
  ceiling: { ...limewash, normalScale: 0.12 },
  threshold: oakHerringbone, // jedna podłoga, bez progów
  concrete: { texture: 'smokedOak', tint: 0xb08d6c, roughness: 0.8 }, // balkon: deska tarasowa
  doorInterior: { color: 0xece4d8, roughness: 0.6 }, // drzwi bezprzylgowe w kolorze ściany
  doorEntrance: { texture: 'walnut', tint: 0xf5c8a0, roughness: 0.6 }, // od wewnątrz orzech
  bulb: { color: 0xfff6e8, roughness: 0.3 }, // nieużywane – lampy są meblami
};

/** Paleta mebli stylu (nadpisuje FURNITURE_BASE). */
export const styl1FurnitureMaterials: Record<string, MaterialSpec> = {
  walnut: { texture: 'walnut', tint: 0xf5c8a0, roughness: 0.65 }, // orzech #5E3B26, mat
  travertine: { tiles: { w: 150, h: 300 }, color: TRAWERTYN, grout: TRAWERTYN, roughness: 0.55, veins: true },
  travertinePaint: { texture: 'paint', tint: 0xe2d2b8, roughness: 0.95, normalScale: 0.35 }, // ściana akcentowa w gabinecie
  limeFront: { tiles: { w: 8, h: 300 }, color: 0xece4d8, grout: 0xd9d0c2, roughness: 0.7 }, // fronty i panele z pionowym frezem
  greenTiles: { tiles: { w: 7.5, h: 30 }, color: ZIELEN, grout: 0x27392f, roughness: 0.15 }, // glazura 7,5 × 30 pionowo
  clayTiles: { tiles: { w: 3, h: 120 }, color: 0xc9978a, grout: 0xb07f72, roughness: 0.35 }, // ryflowane płytki „glina”
  boucle: { texture: 'fabric', color: 0xe6dccb, roughness: 1, normalScale: 1 }, // len i bouclé #E6DCCB
  upholstery: { texture: 'fabric', color: 0xe6dccb, roughness: 1, normalScale: 1 },
  linenWhite: { color: 0xece5d9, roughness: 0.95 },
  duvet: { texture: 'fabric', color: 0xeae2d4, roughness: 1, normalScale: 0.4 },
  throw: { texture: 'fabric', color: 0x6f7d5e, roughness: 1 }, // pled oliwkowy
  cushionOat: { texture: 'fabric', color: 0xd8c8af, roughness: 1 },
  cushionGreen: { texture: 'fabric', color: 0x4a5e45, roughness: 1 },
  rug: { texture: 'carpet', tint: 0xe2d6c2, roughness: 1 }, // wełna, owsiany
  brass: { color: 0xb8925a, roughness: 0.35, metalness: 1 }, // mosiądz szczotkowany
  curtainLinen: { color: 0xe6dccb, roughness: 1, doubleSided: true },
  curtainSheer: { color: 0xeee6d8, roughness: 1, opacity: 0.75, doubleSided: true },
  shadeLinen: { color: 0xeee4d3, roughness: 0.9, emissive: 0xffd9b0, glow: 1.2, doubleSided: true },
};

const CEIL = 270;

/**
 * Wyposażenie wg rzutu z moodboardu. Współrzędne w cm jak w materialy/wymiary.md, `facing` = kierunek frontu.
 * Pola skrzydeł drzwi balkonowych (X 122–306, do Y ≈ 770) i drzwi wewnętrznych zostają wolne.
 */
export const styl1Furniture: FurnitureItem[] = [
  // ── Kuchnia na prawej ścianie pokoju dziennego: słupek z lodówką, blat 275, góra orzech do sufitu, zielona glazura ──
  { id: 'fridge', type: 'fridgeColumn', x: 297.7, y: 155.6, facing: '-x', params: { h: CEIL } },
  { id: 'dishwasher', type: 'baseCabinet', x: 297.7, y: 215.35, facing: '-x', params: { w: 59.3, doors: 1, top: 'travertine' } },
  { id: 'sinkCabinet', type: 'baseCabinet', x: 297.7, y: 285, facing: '-x', params: { w: 80, doors: 2, appliance: 'sink', top: 'travertine', tap: 'brass' } },
  { id: 'drawerCabinet', type: 'baseCabinet', x: 297.7, y: 349.5, facing: '-x', params: { w: 49, doors: 1, top: 'travertine' } },
  { id: 'hobCabinet', type: 'baseCabinet', x: 297.7, y: 404.5, facing: '-x', params: { w: 61, appliance: 'hob', top: 'travertine' } },
  { id: 'narrowCabinet', type: 'baseCabinet', x: 297.7, y: 447.8, facing: '-x', params: { w: 25.6, doors: 1, top: 'travertine' } },
  { id: 'wallCabinets', type: 'wallCabinet', x: 310.2, y: 323.15, z: 145, facing: '-x', params: { w: 274.9, h: 125, doors: 5, carcass: 'walnut' } },
  { id: 'backsplash', type: 'wallPanel', x: 327.2, y: 323.15, z: 90, facing: '-x', params: { w: 274.9, h: 55, mat: 'greenTiles' } },
  // Półwysep 150 × 60 z blatem z trawertynu i dwa hokery od strony salonu.
  { id: 'peninsula', type: 'baseCabinet', x: 252.7, y: 490.65, facing: '-y', params: { w: 150, doors: 3, top: 'travertine' } },
  { id: 'peninsulaTop', type: 'block', x: 252.7, y: 527, z: 86, facing: '-y', params: { w: 150, d: 13, h: 4, mat: 'travertine' } }, // nawis na kolana
  { id: 'stoolA', type: 'stool', x: 222, y: 553, facing: '-y', params: { seat: 'boucle', legs: 'brass' } },
  { id: 'stoolB', type: 'stool', x: 282, y: 553, facing: '-y', params: { seat: 'boucle', legs: 'brass' } },
  { id: 'kitchenLight1', type: 'downlight', x: 245, y: 230, facing: '+y', params: { cd: 22 } },
  { id: 'kitchenLight2', type: 'downlight', x: 245, y: 400, facing: '+y', params: { noLight: true } },

  // ── Ściana TV: panele z orzecha na całą wysokość, otwarta podświetlana nisza, szafka RTV lewitująca 15 cm ──
  { id: 'tvWall', type: 'wallPanel', x: 326.7, y: 705.3, facing: '-x', params: { w: 330.6, h: CEIL, t: 2, mat: 'walnut' } },
  { id: 'nicheBack', type: 'wallPanel', x: 325.4, y: 572, z: 25, facing: '-x', params: { w: 60, h: 200, t: 0.6, mat: 'travertine' } },
  { id: 'nicheSideN', type: 'block', x: 313.2, y: 541, z: 25, facing: '-x', params: { w: 2, d: 25, h: 200 } },
  { id: 'nicheSideS', type: 'block', x: 313.2, y: 603, z: 25, facing: '-x', params: { w: 2, d: 25, h: 200 } },
  ...[25, 75, 125, 175, 223].map((z, i): FurnitureItem => ({ id: `nicheShelf${i}`, type: 'block', x: 313.2, y: 572, z, facing: '-x', params: { w: 60, d: 25, h: 2 } })),
  { id: 'nicheLed', type: 'block', x: 320, y: 572, z: 222.4, facing: '-x', params: { w: 58, d: 1, h: 0.6, mat: 'led' } },
  { id: 'tv', type: 'tv', x: 322.5, y: 685, z: 69, facing: '-x', params: { w: 146, h: 82 } },
  { id: 'tvCabinet', type: 'tvCabinet', x: 305.7, y: 685, facing: '-x', params: { w: 150, d: 40, h: 40, lift: 15, fronts: 'plain', doors: 3, ledUnder: true } },

  // ── Salon: sofa bouclé pod lewą ścianą, stolik z orzecha, trawertynowy stolik boczny, juta, oliwka ──
  { id: 'sofa', type: 'sofa', x: 47.5, y: 685, facing: '+x', params: { w: 240, d: 95, accentA: 'cushionOat', accentB: 'cushionGreen' } },
  { id: 'coffeeTable', type: 'coffeeTable', x: 185, y: 685, facing: '+x', params: { w: 90, h: 36, shape: 'round', mat: 'walnut' } },
  { id: 'sideTable', type: 'sideTable', x: 60, y: 545, facing: '+x', params: { r: 20, h: 50, mat: 'travertine' } },
  { id: 'floorLamp', type: 'floorLampShade', x: 22, y: 540, facing: '+x', params: { h: 165, cd: 25, stem: 'brass' } },
  { id: 'olive', type: 'model', x: 40, y: 838, facing: '+x', params: { file: 'potted_plant_04.glb', height: 150, w: 50, d: 50 } },
  { id: 'livingRug', type: 'rug', x: 130, y: 685, facing: '+x', params: { w: 280, d: 200, mat: 'rugJute' } },
  { id: 'curtainL', type: 'curtain', x: 39, y: 862, facing: '-y', params: { w: 70, mat: 'curtainLinen', ceiling: CEIL } },
  { id: 'curtainR', type: 'curtain', x: 317, y: 862, facing: '-y', params: { w: 20, mat: 'curtainLinen', ceiling: CEIL } },

  // ── Jadalnia: okrągły stół ø100 na nodze, trzy krzesła bouclé, czarna kopuła nad stołem, komoda z orzecha ──
  { id: 'diningTable', type: 'diningTable', x: 115, y: 245, facing: '+y', params: { r: 50, mat: 'walnut', leg: 'walnut' } },
  { id: 'chairN', type: 'diningChair', x: 115, y: 174, facing: '+y', params: { seat: 'boucle' } },
  { id: 'chairW', type: 'diningChair', x: 40, y: 245, facing: '+x', params: { seat: 'boucle' } },
  { id: 'chairS', type: 'diningChair', x: 115, y: 316, facing: '-y', params: { seat: 'boucle' } },
  { id: 'diningDome', type: 'pendantDome', x: 115, y: 245, facing: '+y', params: { r: 24, bottom: 150, cd: 40 } },
  { id: 'sideboard', type: 'drawers', x: 103.5, y: 20, facing: '+y', params: { w: 180, d: 40, h: 75, n: 2 } },
  { id: 'sideboardArt', type: 'artFrame', x: 103.5, y: 1.5, z: 110, facing: '+y', params: { w: 90, h: 60 } },

  // ── Hol: szafa z orzecha do sufitu na końcu, wisząca konsola z lustrem, półki na obrazy, profil LED ──
  { id: 'hallWardrobe', type: 'wardrobe', x: 1006.9, y: 61.7, facing: '-x', params: { w: 123, d: 58, h: CEIL, doors: 2 } },
  { id: 'hallConsole', type: 'block', x: 917, y: 12.5, z: 80, facing: '+y', params: { w: 105, d: 25, h: 12, r: 0.5 } },
  { id: 'hallMirror', type: 'mirrorRect', x: 917, y: 1, z: 105, facing: '+y', params: { w: 60, h: 90 } },
  { id: 'pictureShelfA', type: 'wallShelf', x: 423, y: 4, z: 150, facing: '+y', params: { w: 140, d: 8, mat: 'walnut' } },
  { id: 'pictureShelfB', type: 'wallShelf', x: 639.5, y: 4, z: 150, facing: '+y', params: { w: 90, d: 8, mat: 'walnut' } },
  { id: 'hallLed', type: 'block', x: 687, y: 12, z: CEIL - 1.2, facing: '+y', params: { w: 690, d: 4, h: 1, mat: 'led' } },
  { id: 'hallLight1', type: 'downlight', x: 600, y: 62, facing: '+y', params: { cd: 22 } },
  { id: 'hallLight2', type: 'downlight', x: 880, y: 62, facing: '+y', params: { cd: 22 } },
  { id: 'hallRunner', type: 'rug', x: 640, y: 62, facing: '+y', params: { w: 420, d: 75, mat: 'rugJute' } },

  // ── Sypialnia: łóżko 160 × 200 przy prawej ścianie, boiserie z orzecha, pas trawertynu, ryflowane panele do sufitu ──
  { id: 'boiserie', type: 'wallPanel', x: 1034.9, y: -178, facing: '-x', params: { w: 308, h: 105, t: 2, mat: 'walnut' } },
  { id: 'bedBand', type: 'wallPanel', x: 1035, y: -178, z: 105, facing: '-x', params: { w: 308, h: 10, t: 1.8, mat: 'travertine' } },
  { id: 'bedPanels', type: 'wallPanel', x: 1035.5, y: -178, z: 115, facing: '-x', params: { w: 308, h: CEIL - 115, t: 0.8, mat: 'limeFront' } },
  { id: 'bedLed', type: 'block', x: 1033.5, y: -178, z: 104.4, facing: '-x', params: { w: 300, d: 1, h: 0.6, mat: 'led' } },
  { id: 'bed', type: 'bed', x: 930.9, y: -182.9, facing: '-x', params: { w: 160, l: 200, headH: 110, frame: 'boucle', upholstered: true, pillow: 'cushionOat' } },
  { id: 'nightstandN', type: 'drawers', x: 1013.9, y: -287.9, facing: '-x', params: { w: 40, d: 40, h: 50, n: 2 } },
  { id: 'nightstandS', type: 'drawers', x: 1013.9, y: -77.9, facing: '-x', params: { w: 40, d: 40, h: 50, n: 2 } },
  { id: 'sconceN', type: 'wallSpot', x: 1033.9, y: -287.9, z: 160, facing: '-x', params: { mat: 'brass' } },
  { id: 'sconceS', type: 'wallSpot', x: 1033.9, y: -77.9, z: 160, facing: '-x', params: { mat: 'brass' } },
  { id: 'bench', type: 'block', x: 803, y: -182.9, facing: '-x', params: { w: 100, d: 40, h: 45, r: 3, mat: 'boucle', collide: true } },
  { id: 'bedRug', type: 'rug', x: 900, y: -182.9, facing: '-x', params: { w: 280, d: 230 } },
  { id: 'bedWardrobe', type: 'wardrobe', x: 644.1, y: -124.1, facing: '+x', params: { w: 230, d: 60, h: CEIL, doors: 4, front: 'limeFront' } },
  { id: 'armchair', type: 'sofa', x: 660, y: -290, facing: '+y', params: { w: 85, d: 80, seats: 1, fabric: 'boucle', accentA: 'cushionOat', accentB: 'boucle' } },
  { id: 'armchairTable', type: 'sideTable', x: 728, y: -305, facing: '+y', params: { r: 20, h: 50, mat: 'travertine' } },
  { id: 'bedLight', type: 'downlight', x: 830, y: -182, facing: '+y', params: { cd: 28 } },
  { id: 'bedCurtainL', type: 'curtain', x: 636, y: -328, facing: '+y', params: { w: 40, mat: 'curtainLinen', ceiling: CEIL } },
  { id: 'bedSheer', type: 'curtain', x: 727, y: -333, facing: '+y', params: { w: 210, mat: 'curtainSheer', ceiling: CEIL, depth: 6, period: 9 } },
  { id: 'bedCurtainR', type: 'curtain', x: 855, y: -328, facing: '+y', params: { w: 50, mat: 'curtainLinen', ceiling: CEIL } },

  // ── Gabinet: biurko pod ścianą akcentową w kolorze trawertynu, półki z orzecha, sofa dzienna, szafa ──
  { id: 'accentWall', type: 'wallPanel', x: 604.7, y: -178.2, facing: '-x', params: { w: 338, h: CEIL, t: 0.4, mat: 'travertinePaint' } },
  { id: 'deskTop', type: 'block', x: 574.9, y: -201.2, z: 72, facing: '-x', params: { w: 140, d: 60, h: 3, collide: true } },
  { id: 'deskDrawers', type: 'drawers', x: 577.4, y: -249.2, facing: '-x', params: { w: 40, d: 55, h: 72, n: 3 } },
  { id: 'deskLeg', type: 'block', x: 575.9, y: -133.7, facing: '-x', params: { w: 3, d: 58, h: 72 } },
  { id: 'deskChair', type: 'diningChair', x: 520, y: -201, facing: '+x', params: { seat: 'boucle' } },
  { id: 'deskShelf1', type: 'wallShelf', x: 593.9, y: -201.2, z: 115, facing: '-x', params: { w: 120, d: 22, mat: 'walnut', decor: false } },
  { id: 'deskShelf2', type: 'wallShelf', x: 593.9, y: -201.2, z: 150, facing: '-x', params: { w: 120, d: 22, mat: 'walnut' } },
  { id: 'deskShelf3', type: 'wallShelf', x: 593.9, y: -201.2, z: 185, facing: '-x', params: { w: 120, d: 22, mat: 'walnut', decor: false } },
  { id: 'deskLed', type: 'block', x: 590, y: -201.2, z: 114.4, facing: '-x', params: { w: 116, d: 1, h: 0.6, mat: 'led' } },
  { id: 'daybed', type: 'bed', x: 397.5, y: -222, facing: '+y', params: { w: 90, l: 190, headH: 70, frame: 'boucle', upholstered: true, pillow: 'cushionGreen' } },
  { id: 'officeWardrobe', type: 'wardrobe', x: 410.5, y: -41.7, facing: '-y', params: { w: 122, d: 65, h: CEIL, doors: 2 } },
  { id: 'rollerBlind', type: 'wallPanel', x: 462, y: -344, z: 178, facing: '+y', params: { w: 120, h: 57, t: 1, mat: 'curtainLinen' } },
  { id: 'officeLight', type: 'downlight', x: 477, y: -178, facing: '+y', params: { cd: 25 } },

  // ── Łazienka: ryflowane płytki „glina” do 120 (nad wanną do sufitu), wanna z szybą, blat z trawertynu nad pralką ──
  { id: 'clayL', type: 'wallPanel', x: 339.5, y: 182.2, facing: '+x', params: { w: 92.4, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayShaftN', type: 'wallPanel', x: 360.7, y: 228.7, facing: '+y', params: { w: 43, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayShaftE', type: 'wallPanel', x: 382.5, y: 262.25, facing: '+x', params: { w: 67.7, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayBottom', type: 'wallPanel', x: 468.6, y: 295.8, facing: '-y', params: { w: 172.8, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayTopL', type: 'wallPanel', x: 391.7, y: 136.3, facing: '+y', params: { w: 105, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayTopR', type: 'wallPanel', x: 544.65, y: 136.3, facing: '+y', params: { w: 20.7, h: 120, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayTubE', type: 'wallPanel', x: 624.7, y: 216.05, facing: '-x', params: { w: 160.1, h: CEIL, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayTubS', type: 'wallPanel', x: 590, y: 295.8, facing: '-y', params: { w: 70, h: CEIL, t: 0.6, mat: 'clayTiles' } },
  { id: 'clayTubN', type: 'wallPanel', x: 590, y: 136.3, facing: '+y', params: { w: 70, h: CEIL, t: 0.6, mat: 'clayTiles' } },
  { id: 'bathtub', type: 'bathtub', x: 590, y: 216.05, facing: '-x', params: { w: 160, d: 70 } },
  { id: 'tubScreen', type: 'showerGlass', x: 556, y: 176, facing: '-x', params: { len: 80, h: 200, depth: 70, side: 'left', head: 'brass' } },
  { id: 'tubNiche', type: 'block', x: 624, y: 250, z: 100, facing: '-x', params: { w: 60, d: 1, h: 30, mat: 'travertine' } },
  { id: 'tubNicheLed', type: 'block', x: 623.3, y: 250, z: 129, facing: '-x', params: { w: 58, d: 0.6, h: 0.8, mat: 'ledAlways' } },
  { id: 'wcFrame', type: 'block', x: 349.2, y: 182, facing: '+x', params: { w: 82, d: 20, h: 110, mat: 'clayTiles', collide: true } },
  { id: 'wc', type: 'wcWallHung', x: 386.2, y: 182, facing: '+x', params: { mat: 'ceramicWhite', plate: 'brass', plateZ: 86 } },
  { id: 'towelRail', type: 'towelRadiator', x: 415, y: 141, z: 60, facing: '+y', params: { w: 50, h: 100, mat: 'brass' } },
  { id: 'washer', type: 'washer', x: 415, y: 268.6, facing: '-y' },
  { id: 'bathCounter', type: 'block', x: 461.2, y: 270.1, z: 86, facing: '-y', params: { w: 158, d: 52, h: 4, mat: 'travertine' } },
  { id: 'basinCabinet', type: 'drawers', x: 495, y: 271.1, z: 52, facing: '-y', params: { w: 80, d: 50, h: 34, n: 1 } },
  { id: 'basin', type: 'block', x: 495, y: 266, z: 90, facing: '-y', params: { w: 45, d: 35, h: 12, mat: 'ceramicWhite', r: 5 } },
  { id: 'bathTap', type: 'wallTap', x: 495, y: 295.5, z: 112, facing: '-y', params: { mat: 'brass' } },
  { id: 'bathMirror', type: 'mirrorRound', x: 495, y: 295.5, z: 118, facing: '-y', params: { r: 30 } },
  { id: 'bathLight', type: 'downlight', x: 482, y: 200, facing: '+y', params: { cd: 26, alwaysOn: true } },

  // ── WC: zielona glazura na całej ścianie z umywalką, szafka z orzecha, lustro z podświetleniem ──
  { id: 'greenWall', type: 'wallPanel', x: 746.35, y: 295.8, facing: '-y', params: { w: 150.9, h: CEIL, t: 0.6, mat: 'greenTiles' } },
  { id: 'wcVanity', type: 'vanity', x: 746, y: 275.5, facing: '-y', params: { w: 55, d: 40, top: 'travertine', basin: 'ceramicWhite', tap: 'brass' } },
  { id: 'wcMirror', type: 'mirrorBacklit', x: 746, y: 295.3, z: 118, facing: '-y', params: { w: 42, h: 70 } },
  { id: 'wcFrame2', type: 'block', x: 645.9, y: 184.8, facing: '+x', params: { w: 80, d: 20, h: 110, mat: 'wallBathroom', collide: true } },
  { id: 'wc2', type: 'wcWallHung', x: 682.9, y: 184.8, facing: '+x', params: { mat: 'ceramicWhite', plate: 'brass', plateZ: 86 } },
  { id: 'wcLight', type: 'downlight', x: 746, y: 200, facing: '+y', params: { cd: 22, alwaysOn: true } },

  // ── Balkon: stolik z dwoma krzesłami ──
  { id: 'balconyTable', type: 'diningTable', x: 220, y: 985, facing: '+y', params: { r: 30, h: 72, mat: 'blackMatte' } },
  { id: 'balconyChairW', type: 'diningChair', x: 168, y: 985, facing: '+x', params: { mat: 'blackMatte' } },
  { id: 'balconyChairE', type: 'diningChair', x: 272, y: 985, facing: '-x', params: { mat: 'blackMatte' } },
];
