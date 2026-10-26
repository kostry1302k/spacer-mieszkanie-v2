import * as THREE from 'three';
import { TEXTURES, type TextureKey, type TextureRes, type TextureSet } from '../data/materials';

/** Rodzaje powierzchni; tryb (surowy, styl 1, styl 2) przypisuje każdej materiał. */
export type SurfaceKey =
  | 'wall'
  | 'wallBathroom'
  | 'floor'
  | 'floorBathroom'
  | 'ceiling'
  | 'threshold'
  | 'concrete'
  | 'facade'
  | 'ground'
  | 'frame'
  | 'glass'
  | 'doorEntrance'
  | 'doorInterior'
  | 'metal'
  | 'radiator'
  | 'fixture'
  | 'cable'
  | 'bulb';

export interface FlatSpec {
  color: number;
  roughness: number;
  metalness?: number;
  opacity?: number;
  /** Kolor świecenia (żarówka, klosz, LED); świeci, gdy lampy są włączone. */
  emissive?: number;
  /** Jasność świecenia po włączeniu lamp (domyślnie 3). */
  glow?: number;
  /** Świeci także w dzień (łazienka bez okna). */
  alwaysOn?: boolean;
  doubleSided?: boolean;
}

export interface TexturedSpec {
  texture: TextureKey;
  /** Mnożnik koloru tekstury (1 = bez zmian). */
  tint?: number;
  roughness?: number;
  normalScale?: number;
  doubleSided?: boolean;
}

/** Płytki rysowane w programie (równy format, fuga, delikatne przeżylenie) – gdy żadna tekstura CC0 nie ma właściwego formatu. */
export interface TilesSpec {
  tiles: { w: number; h: number }; // format płytki w cm
  color: number;
  grout: number;
  roughness: number;
  /** Delikatne przeżylenie (jasne smugi). */
  veins?: boolean;
}

export type MaterialSpec = FlatSpec | TexturedSpec | TilesSpec;
/** Materiały trybu: powierzchnie architektury (SurfaceKey) i paleta mebli (dowolne nazwy). */
export type MaterialSet = Record<string, THREE.MeshStandardMaterial>;

export interface MaterialOptions {
  maxResolution: TextureRes;
  anisotropy: number;
  manager: THREE.LoadingManager;
  /** Wspólna pamięć tekstur (adres → tekstura), żeby kolejne tryby używały tych samych plików. */
  textures: Map<string, THREE.Texture>;
}

function loadTexture(url: string, color: boolean, repeat: number, opts: MaterialOptions): THREE.Texture {
  const key = `${url}|${repeat}`;
  const cached = opts.textures.get(key);
  if (cached) return cached;
  const tex = new THREE.TextureLoader(opts.manager).load(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.setScalar(1 / repeat);
  tex.anisotropy = opts.anisotropy;
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  opts.textures.set(key, tex);
  return tex;
}

function createTextured(spec: TexturedSpec, opts: MaterialOptions): THREE.MeshStandardMaterial {
  const set: TextureSet = TEXTURES[spec.texture];
  const res: TextureRes = set.resolutions.includes(opts.maxResolution) ? opts.maxResolution : '1k';
  const base = `${import.meta.env.BASE_URL}assets/textures/${set.id}/${res}`;
  const normalScale = spec.normalScale ?? 1;
  return new THREE.MeshStandardMaterial({
    map: loadTexture(`${base}/color.jpg`, true, set.size, opts),
    normalMap: loadTexture(`${base}/normal.jpg`, false, set.size, opts),
    normalScale: new THREE.Vector2(normalScale, normalScale),
    roughnessMap: loadTexture(`${base}/roughness.jpg`, false, set.size, opts),
    roughness: spec.roughness ?? 1,
    color: spec.tint ?? 0xffffff,
    side: spec.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
}

function createFlat(s: FlatSpec): THREE.MeshStandardMaterial {
  const transparent = s.opacity !== undefined && s.opacity < 1;
  const mat = new THREE.MeshStandardMaterial({
    color: s.color,
    roughness: s.roughness,
    metalness: s.metalness ?? 0,
    transparent,
    opacity: s.opacity ?? 1,
    depthWrite: !transparent,
    side: transparent || s.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    emissive: s.emissive ?? 0x000000,
    emissiveIntensity: 0,
  });
  if (s.emissive !== undefined) mat.userData = { glow: s.glow ?? 3, alwaysOn: Boolean(s.alwaysOn) };
  return mat;
}

/** Tekstura płytek na płótnie: dwie kolumny płytek, fugi 2 mm, plamki i smugi; ta sama jako mapa wypukłości. */
function createTiles(spec: TilesSpec, opts: MaterialOptions): THREE.MeshStandardMaterial {
  const size = 1024;
  const widthCm = spec.tiles.w * 2;
  const heightCm = spec.tiles.h;
  const px = size / Math.max(widthCm, heightCm);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthCm * px);
  canvas.height = Math.round(heightCm * px);
  const ctx = canvas.getContext('2d')!;
  const base = new THREE.Color(spec.color);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Deterministyczny pseudolosowy generator – ta sama tekstura przy każdym wczytaniu.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const shade = rand() < 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${0.02 + rand() * 0.03})`;
    ctx.beginPath();
    ctx.arc(rand() * canvas.width, rand() * canvas.height, 10 + rand() * 60, 0, Math.PI * 2);
    ctx.fill();
  }
  if (spec.veins) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = `rgba(255,250,240,${0.05 + rand() * 0.07})`;
      ctx.lineWidth = 2 + rand() * 6;
      ctx.beginPath();
      let x = rand() * canvas.width;
      let y = rand() * canvas.height;
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (rand() - 0.3) * 140;
        y += (rand() - 0.5) * 120;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  // Fugi 2 mm między dwiema kolumnami płytek i na krawędziach (tekstura się powtarza).
  const grout = Math.max(1, Math.round(0.2 * px));
  ctx.fillStyle = `#${new THREE.Color(spec.grout).getHexString()}`;
  for (const x of [0, Math.round(spec.tiles.w * px)]) ctx.fillRect(x, 0, grout, canvas.height);
  ctx.fillRect(0, 0, canvas.width, grout);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(100 / widthCm, 100 / heightCm);
  tex.anisotropy = opts.anisotropy;
  tex.colorSpace = THREE.SRGBColorSpace;
  const bump = tex.clone();
  bump.colorSpace = THREE.NoColorSpace;
  return new THREE.MeshStandardMaterial({ map: tex, bumpMap: bump, bumpScale: 0.6, roughness: spec.roughness });
}

export function createMaterials(specs: Record<string, MaterialSpec>, opts: MaterialOptions): MaterialSet {
  const entries = Object.entries(specs).map(([key, spec]) => {
    const mat = 'tiles' in spec ? createTiles(spec, opts) : 'texture' in spec ? createTextured(spec, opts) : createFlat(spec);
    mat.name = key;
    return [key, mat];
  });
  return Object.fromEntries(entries) as MaterialSet;
}

/** Tekstury używane przez zestaw materiałów. */
export function texturesOf(set: MaterialSet): Set<THREE.Texture> {
  const used = new Set<THREE.Texture>();
  for (const mat of Object.values(set)) {
    for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.bumpMap]) if (tex) used.add(tex);
  }
  return used;
}
