import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Apartment } from '../data/types';
import { m } from '../core/units';

export type ViewMode = 'orbit' | 'top' | 'off';

/** Widoki makiety: kamera orbitalna 3D i rzut z góry (ortogonalny, północ u góry jak na rzucie). */
export class MockupViews {
  readonly perspective = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
  readonly top = new THREE.OrthographicCamera();
  private readonly orbit: OrbitControls;
  private readonly pan: OrbitControls;
  private mode: ViewMode = 'orbit';
  private readonly bounds: { x0: number; x1: number; z0: number; z1: number };
  private readonly startOffset = new THREE.Vector3(5.5, 8.5, 7.5);
  private userMoved = false;

  constructor(ap: Apartment, dom: HTMLElement) {
    const xs = ap.walls.flatMap((w) => [w.x0, w.x1]);
    const ys = [...ap.walls.flatMap((w) => [w.y0, w.y1]), ap.balcony.slab.y1];
    this.bounds = { x0: m(Math.min(...xs)), x1: m(Math.max(...xs)), z0: m(Math.min(...ys)), z1: m(Math.max(...ys)) };
    const center = new THREE.Vector3((this.bounds.x0 + this.bounds.x1) / 2, 0, (this.bounds.z0 + this.bounds.z1) / 2);

    this.orbit = new OrbitControls(this.perspective, dom);
    this.orbit.target.copy(center);
    this.orbit.addEventListener('start', () => (this.userMoved = true));
    this.orbit.enableDamping = true;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.05;
    this.orbit.minDistance = 2;
    this.orbit.maxDistance = 25;

    this.top.position.set(center.x, 20, center.z);
    this.top.up.set(0, 0, -1);
    this.top.lookAt(center);
    this.top.near = 0.1;
    this.top.far = 50;
    this.pan = new OrbitControls(this.top, dom);
    this.pan.target.copy(center);
    this.pan.enableRotate = false;
    this.pan.screenSpacePanning = true;
    this.pan.enabled = false;
  }

  get camera(): THREE.Camera {
    return this.mode === 'orbit' ? this.perspective : this.top;
  }

  setMode(mode: ViewMode): void {
    this.mode = mode;
    this.orbit.enabled = mode === 'orbit';
    this.pan.enabled = mode === 'top';
  }

  resize(width: number, height: number): void {
    const aspect = width / height;
    this.perspective.aspect = aspect;
    this.perspective.updateProjectionMatrix();
    // Na wąskim (pionowym) ekranie kamera startowa odsuwa się, żeby objąć całe mieszkanie.
    if (!this.userMoved) {
      const fit = Math.min(Math.max(1, 0.85 / aspect), 2);
      this.perspective.position.copy(this.orbit.target).addScaledVector(this.startOffset, fit);
    }

    // Ortogonalna: cały rzut z marginesem, niezależnie od proporcji ekranu.
    const margin = 0.6;
    const w = this.bounds.x1 - this.bounds.x0 + margin * 2;
    const h = this.bounds.z1 - this.bounds.z0 + margin * 2;
    const halfH = Math.max(h, w / aspect) / 2;
    this.top.left = -halfH * aspect;
    this.top.right = halfH * aspect;
    this.top.top = halfH;
    this.top.bottom = -halfH;
    this.top.updateProjectionMatrix();
  }

  update(): void {
    if (this.mode !== 'off') (this.mode === 'orbit' ? this.orbit : this.pan).update();
  }
}
