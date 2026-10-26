import type * as THREE from 'three';

export interface QualityProfile {
  name: 'mobile' | 'desktop';
  maxPixelRatio: number;
  shadowMapSize: number;
  /** Docelowa rozdzielczość tekstur PBR (Etap 4). */
  textureSize: 1024 | 2048;
}

export const isTouchDevice = matchMedia('(pointer: coarse)').matches;

export const qualityProfile: QualityProfile = isTouchDevice
  ? { name: 'mobile', maxPixelRatio: 1.5, shadowMapSize: 1024, textureSize: 1024 }
  : { name: 'desktop', maxPixelRatio: 2, shadowMapSize: 2048, textureSize: 2048 };

const TARGET_FPS = 30;
const SAMPLE_SECONDS = 3;
const WARMUP_SECONDS = 2;

/**
 * Automatyczne obniżanie jakości, gdy średni FPS spada poniżej 30:
 * najpierw rozdzielczość renderowania (DPR), na końcu cienie. Jakości nie podnosi z powrotem.
 */
export class AdaptiveQuality {
  private elapsed = 0;
  private frames = 0;
  private warm = 0;
  private level = 0;
  private readonly steps: (() => void)[];

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly onShadowsOff: () => void) {
    const start = renderer.getPixelRatio();
    const ratios = [1.25, 1].filter((r) => r < start);
    this.steps = [
      ...ratios.map((r) => () => renderer.setPixelRatio(r)),
      () => {
        renderer.shadowMap.enabled = false;
        this.onShadowsOff();
      },
    ];
  }

  get description(): string {
    return `DPR ${this.renderer.getPixelRatio().toFixed(2)}, cienie ${this.renderer.shadowMap.enabled ? 'tak' : 'nie'}`;
  }

  /** Wywoływane co klatkę z czasem klatki (s). Karta w tle i długie przerwy są pomijane. */
  tick(dt: number): void {
    if (dt > 0.25 || this.level >= this.steps.length) return;
    if (this.warm < WARMUP_SECONDS) {
      this.warm += dt;
      return;
    }
    this.elapsed += dt;
    this.frames++;
    if (this.elapsed < SAMPLE_SECONDS) return;
    const fps = this.frames / this.elapsed;
    this.elapsed = this.frames = 0;
    if (fps < TARGET_FPS) {
      this.steps[this.level++]();
      this.warm = 0;
    }
  }
}
