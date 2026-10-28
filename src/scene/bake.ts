// Wypalone światło (lightmapy z Blendera): eksport sceny do wypalenia i wczytanie wyniku.
// Proces: ?debug → app.exportBake() → scripts/bake.py (Blender, Cycles) → public/bake/<mieszkanie>/<tryb>-<pora>.{glb,png,json}.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { Lamp } from '../furniture/place';
import type { MaterialSet } from './materials';

/** Czy bryła dostaje wypalone światło: stała (bez skrzydeł drzwi), nieprzezroczysta, z materiałem PBR, nie model GLB. */
export function isBakeable(o: THREE.Object3D): o is THREE.Mesh {
  if (!(o instanceof THREE.Mesh) || !(o.material instanceof THREE.MeshStandardMaterial) || o.material.transparent || o.userData.baked) return false;
  if (o.name.startsWith('furniture:')) return true; // scalone bryły mebli; modele GLB (rośliny) zostają na żywo
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.name.startsWith('door:') || p.name === 'furniture') return false;
  return true;
}

/** Scena do Blendera: bryły do wypalenia + otoczenie (`env:*`) tylko jako przesłona nieba. */
export async function exportBakeScene(roots: THREE.Object3D[], environment: THREE.Object3D): Promise<ArrayBuffer> {
  const out = new THREE.Scene();
  const add = (o: THREE.Mesh, prefix: string) => {
    const copy = new THREE.Mesh(o.geometry, o.material);
    copy.name = prefix + o.name;
    o.updateWorldMatrix(true, false);
    copy.applyMatrix4(o.matrixWorld);
    out.add(copy);
  };
  for (const root of roots) root.traverse((o) => isBakeable(o) && add(o, ''));
  environment.traverse((o) => o instanceof THREE.Mesh && add(o, 'env:'));
  return (await new GLTFExporter().parseAsync(out, { binary: true })) as ArrayBuffer;
}

/** Opis świateł dla Blendera (metry, układ three.js: y w górę). */
export function bakeLights(lamps: Lamp[], time: 'day' | 'evening', hdri: string, sunDirection: THREE.Vector3) {
  return {
    time,
    hdri,
    hdriStrength: time === 'day' ? 1 : 0.06,
    // Słońce jak w spacerze (nisko, od południa – wpada przez balkon); natężenie w W/m² Cyclesa, dobrane na oko.
    sun: time === 'day' ? { direction: sunDirection.toArray(), strength: 4 } : null,
    lamps: lamps
      .filter((l) => time === 'evening' || l.alwaysOn)
      .map((l) => ({ position: [l.x / 100, l.z / 100, l.y / 100], candela: l.intensity, color: l.color })),
  };
}

export interface BakeInfo {
  /** Mnożnik jasności lightmapy RGBM: natężenie = rgb × a × scale. */
  scale: number;
  /** Ekspozycja wnętrza w EV – fizycznie wnętrze jest kilkanaście razy ciemniejsze niż niebo za oknem (jak na zdjęciu). */
  exposure?: number;
  /** Typowe natężenie we wnętrzu (mediana lightmapy) – równe oświetlenie brył ruchomych (drzwi, zasłony, rośliny). */
  ambient?: number;
}

/** Dekodowanie RGBM w shaderze: alfa lightmapy to mnożnik jasności. */
function decodeRgbm(shader: THREE.WebGLProgramParametersWithUniforms): void {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <lights_fragment_maps>',
    THREE.ShaderChunk.lights_fragment_maps.replace('lightMapTexel.rgb * lightMapIntensity', 'lightMapTexel.rgb * lightMapTexel.a * lightMapIntensity'),
  );
}

/** Wczytuje wypaloną scenę: geometria z drugim UV z Blendera, materiały silnika z lightmapą. */
export async function loadBake(base: string, mats: MaterialSet): Promise<{ group: THREE.Group; ceilings: THREE.Mesh[]; ambient: number; dispose(): void }> {
  const [gltf, lightMap, info] = await Promise.all([
    new GLTFLoader().loadAsync(`${base}.glb`),
    new THREE.TextureLoader().loadAsync(`${base}.png`),
    fetch(`${base}.json`).then((r) => r.json() as Promise<BakeInfo>),
  ]);
  lightMap.flipY = false;
  lightMap.channel = 1;
  lightMap.colorSpace = THREE.NoColorSpace; // RGBM – dane, nie kolor
  lightMap.generateMipmaps = false; // mipmapy mieszałyby sąsiednie wyspy UV (ciemne szwy w oddali)
  lightMap.minFilter = THREE.LinearFilter;
  const group = new THREE.Group();
  group.name = 'baked';
  const ceilings: THREE.Mesh[] = [];
  const own: THREE.Material[] = [];
  const meshes: THREE.Mesh[] = [];
  gltf.scene.traverse((o) => o instanceof THREE.Mesh && meshes.push(o));
  for (const mesh of meshes) {
    const source = mats[(mesh.material as THREE.Material).name];
    if (!source) continue;
    const mat = source.clone();
    // Światło rozproszone jest już w lightmapie (×π: three dzieli natężenie przez π w modelu Lamberta).
    mat.lightMap = lightMap;
    mat.lightMapIntensity = info.scale * Math.PI * 2 ** (info.exposure ?? 0);
    mat.onBeforeCompile = decodeRgbm;
    mat.customProgramCacheKey = () => 'rgbm';
    mat.envMapIntensity = 0.3; // niebo z HDRI zostaje głównie w odbiciach – rozproszone jest już wypalone
    mat.userData = source.userData; // świecenie lamp sterowane jak w oryginale
    own.push(mat);
    (mesh.material as THREE.Material).dispose();
    mesh.material = mat;
    mesh.castShadow = mesh.receiveShadow = false;
    mesh.userData.baked = true;
    if (source.name === 'ceiling') ceilings.push(mesh); // sufit chowany w widoku z góry – trafia do grupy sufitów modelu
    else group.add(mesh);
  }
  return {
    group,
    ceilings,
    ambient: (info.ambient ?? 0) * Math.PI * 2 ** (info.exposure ?? 0),
    dispose() {
      meshes.forEach((m) => m.geometry.dispose());
      own.forEach((m) => m.dispose());
      lightMap.dispose();
    },
  };
}

const flat = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
flat.needsUpdate = true;

/**
 * Bryły bez lightmapy (skrzydła drzwi, zasłony, rośliny) dostają równe światło o natężeniu typowym dla wnętrza –
 * inaczej przy wypalonym otoczeniu wyglądałyby na ciemne i sine. `intensity: 0` przywraca stan bez wypalania.
 */
export function setAmbientLight(roots: THREE.Object3D[], intensity: number): void {
  const seen = new Set<THREE.Material>();
  for (const root of roots)
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || o.userData.baked || isBakeable(o)) return;
      const mat = o.material;
      if (!(mat instanceof THREE.MeshStandardMaterial) || seen.has(mat)) return;
      seen.add(mat);
      const next = intensity > 0 ? flat : null;
      if (mat.lightMap !== next) mat.needsUpdate = true;
      mat.lightMap = next;
      mat.lightMapIntensity = intensity;
    });
}
