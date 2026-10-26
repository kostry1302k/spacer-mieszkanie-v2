import * as THREE from 'three';
import type { ModeDefinition } from '../data/modes';
import type { TextureRes } from '../data/materials';
import { createMaterials, texturesOf, type MaterialSet } from '../scene/materials';

/**
 * Materiały trybów ładowane przy pierwszym użyciu. Tekstury wspólne dla kolejnych trybów
 * są używane ponownie; po przełączeniu zwalniamy z pamięci GPU to, czego nowy tryb nie używa.
 */
export class MaterialLibrary {
  private readonly textures = new Map<string, THREE.Texture>();

  constructor(private readonly opts: { maxResolution: TextureRes; anisotropy: number }) {}

  /** Tworzy zestaw materiałów trybu i czeka na wczytanie jego tekstur (postęp 0–1). */
  load(mode: ModeDefinition, onProgress: (progress: number) => void): Promise<MaterialSet> {
    return new Promise((resolve) => {
      const manager = new THREE.LoadingManager();
      const before = this.textures.size;
      let set: MaterialSet | null = null;
      manager.onProgress = (_url, loaded, total) => onProgress(loaded / total);
      manager.onLoad = () => set && resolve(set);
      set = createMaterials(mode.materials, { ...this.opts, manager, textures: this.textures });
      // Wszystkie tekstury były już w pamięci – menedżer nic nie wczytuje i nie zgłosi końca.
      if (this.textures.size === before) {
        onProgress(1);
        resolve(set);
      }
    });
  }

  /** Zwalnia stary zestaw materiałów i tekstury, których nie używa zestaw `keep`. */
  release(old: MaterialSet, keep: MaterialSet): void {
    const kept = texturesOf(keep);
    for (const tex of texturesOf(old)) {
      if (kept.has(tex)) continue;
      tex.dispose();
      for (const [key, value] of this.textures) if (value === tex) this.textures.delete(key);
    }
    for (const mat of Object.values(old)) if (!Object.values(keep).includes(mat)) mat.dispose();
  }

  get textureCount(): number {
    return this.textures.size;
  }
}
