// Efekty na obrazie w spacerze (tylko komputer): cienie kontaktowe w kątach i przy meblach (GTAO, w połowie rozdzielczości).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostFx {
  enabled = true;
  private readonly composer: EffectComposer;
  private readonly renderPass: RenderPass;
  readonly ao: GTAOPass;

  constructor(private readonly renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // Bufor HDR z MSAA – krawędzie gładkie jak przy zwykłym renderowaniu.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(renderer, target);
    this.renderPass = new RenderPass(scene, camera);
    // Promień w metrach: kąty ścian, styk mebli z podłogą i ścianą (dobrane na oko w ?debug: app.postfx.ao).
    this.ao = new GTAOPass(scene, camera, 1, 1);
    this.ao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1, thickness: 3, scale: 1.7, samples: 8 });
    this.ao.updatePdMaterial({ radius: 6, samples: 8 });
    this.ao.blendIntensity = 0.95;
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.ao);
    this.composer.addPass(new OutputPass()); // tone mapping AgX i sRGB na końcu
  }

  setSize(width: number, height: number): void {
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(width, height);
    // Cienie kontaktowe są miękkie – połowa rozdzielczości wygląda tak samo, a kosztuje ~4× mniej.
    const ratio = this.renderer.getPixelRatio() / 2;
    this.ao.setSize(Math.round(width * ratio), Math.round(height * ratio));
  }

  render(camera: THREE.PerspectiveCamera): void {
    this.renderPass.camera = camera;
    this.ao.camera = camera;
    this.composer.render();
  }
}
