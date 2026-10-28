// Panorama 360° (render z Blendera): pełny ekran, rozglądanie przeciąganiem, przybliżanie kółkiem / dwoma palcami.
import * as THREE from 'three';

export class PanoramaViewer {
  readonly element = document.createElement('div');
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  private readonly material = new THREE.MeshBasicMaterial({ toneMapped: false }); // obraz z Blendera ma już AgX i ekspozycję
  private readonly caption = document.createElement('p');
  private texture: THREE.Texture | null = null;
  private lon = Math.PI; // środek panoramy (kierunek kamery w Blenderze) – patrz geometria kuli niżej
  private lat = 0;
  private drag: { x: number; y: number } | null = null;
  private pinch = 0;
  private request = 0;

  constructor(private readonly onClose: () => void) {
    // Kula oglądana od środka; odbicie w x, żeby obraz nie był lustrzany. Środek tekstury wypada wtedy na −x.
    const sphere = new THREE.SphereGeometry(50, 96, 48);
    sphere.scale(-1, 1, 1);
    this.scene.add(new THREE.Mesh(sphere, this.material));

    this.element.className = 'pano';
    this.element.hidden = true;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pano-close';
    close.textContent = '✕ Wróć do spaceru';
    close.addEventListener('click', () => this.close());
    this.caption.className = 'pano-caption';
    this.element.append(close, this.caption);

    const canvas = this.element; // nakładka przechwytuje gesty nad płótnem
    canvas.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      this.drag = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const k = THREE.MathUtils.degToRad(this.camera.fov) / window.innerHeight;
      this.lon -= (e.clientX - this.drag.x) * k;
      this.lat = THREE.MathUtils.clamp(this.lat + (e.clientY - this.drag.y) * k, -1.45, 1.45);
      this.drag = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('pointerup', () => (this.drag = null));
    canvas.addEventListener('wheel', (e) => this.zoom(e.deltaY * 0.05), { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2) return;
      this.drag = null;
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (this.pinch) this.zoom((this.pinch - d) * 0.15);
      this.pinch = d;
    });
    canvas.addEventListener('touchend', () => (this.pinch = 0));
    window.addEventListener('keydown', (e) => e.key === 'Escape' && this.active && this.close());
  }

  get active(): boolean {
    return !this.element.hidden;
  }

  async open(url: string, caption: string): Promise<void> {
    const request = ++this.request;
    this.element.hidden = false;
    document.body.classList.add('pano-on');
    this.caption.textContent = `${caption} · wczytywanie…`;
    this.lon = Math.PI;
    this.lat = 0;
    this.camera.fov = 75;
    const texture = await new THREE.TextureLoader().loadAsync(url);
    if (request !== this.request || !this.active) return texture.dispose();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    this.texture?.dispose();
    this.texture = texture;
    this.material.map = texture;
    this.material.needsUpdate = true;
    this.caption.textContent = `${caption} · przeciągnij, aby się rozejrzeć`;
  }

  close(): void {
    this.request++;
    this.element.hidden = true;
    document.body.classList.remove('pano-on');
    this.material.map = null;
    this.texture?.dispose();
    this.texture = null;
    this.onClose();
  }

  render(renderer: THREE.WebGLRenderer): void {
    const { innerWidth: w, innerHeight: h } = window;
    if (this.camera.aspect !== w / h) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    const c = Math.cos(this.lat);
    this.camera.lookAt(c * Math.cos(this.lon), Math.sin(this.lat), c * Math.sin(this.lon));
    renderer.render(this.scene, this.camera);
  }

  private zoom(delta: number): void {
    this.camera.fov = THREE.MathUtils.clamp(this.camera.fov + delta, 30, 90);
    this.camera.updateProjectionMatrix();
  }
}
