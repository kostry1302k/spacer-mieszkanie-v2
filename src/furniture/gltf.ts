import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** Wczytuje modele GLB z public/assets/models (Meshopt, WebP) i oddaje kopie gotowe do wstawienia. */
export class ModelCache {
  private readonly loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  private readonly cache = new Map<string, Promise<THREE.Object3D>>();

  /**
   * Kopia modelu przeskalowana do wysokości `height` (cm), z podstawą na y = 0 i środkiem
   * obrysu w (0, 0) – w metrach sceny.
   */
  async instance(file: string, height: number): Promise<THREE.Object3D> {
    let source = this.cache.get(file);
    if (!source) {
      source = this.loader.loadAsync(`${import.meta.env.BASE_URL}assets/models/${file}`).then((gltf) => gltf.scene);
      this.cache.set(file, source);
    }
    const copy = (await source).clone(true);
    const bounds = new THREE.Box3().setFromObject(copy);
    const size = bounds.getSize(new THREE.Vector3());
    const scale = height / 100 / size.y;
    const center = bounds.getCenter(new THREE.Vector3());
    const wrapper = new THREE.Group();
    copy.position.set(-center.x, -bounds.min.y, -center.z);
    wrapper.add(copy);
    wrapper.scale.setScalar(scale);
    copy.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return wrapper;
  }
}
