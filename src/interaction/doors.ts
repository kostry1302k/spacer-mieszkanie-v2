import * as THREE from 'three';
import { leafCorners, type DoorLeaf } from '../geometry/openings';
import { rectFromPoints, type Rect } from '../controls/collisions';

const OPEN_ANGLE = Math.PI / 2;
const SPEED = 2.6; // rad/s
const REACH = 2.2; // m – z jakiej odległości można otworzyć drzwi
/** W trakcie ruchu skrzydło nie blokuje (między tymi kątami); zamknięte i otwarte – blokuje. */
const BLOCK_CLOSED_BELOW = 0.25;
const BLOCK_OPEN_ABOVE = OPEN_ANGLE - 0.1;

interface DoorState {
  leaf: DoorLeaf;
  angle: number;
  target: number;
}

/** Stan i animacja skrzydeł drzwi, wybór drzwi pod celownikiem, kolizje skrzydeł. */
export class DoorController {
  private doors: DoorState[] = [];
  private readonly raycaster = new THREE.Raycaster();
  private readonly center = new THREE.Vector2(0, 0);

  constructor() {
    this.raycaster.far = REACH;
  }

  /** Podmienia skrzydła po przebudowie modelu, zachowując stan otwarcia drzwi o tym samym id. */
  setLeaves(leaves: DoorLeaf[]): void {
    const previous = new Map(this.doors.map((d) => [d.leaf.door.id, d]));
    this.doors = leaves.map((leaf) => {
      const old = previous.get(leaf.door.id);
      return { leaf, angle: old?.angle ?? 0, target: old?.target ?? 0 };
    });
    this.doors.forEach((d) => this.applyRotation(d));
  }

  toggle(doorId: string): void {
    const d = this.doors.find((s) => s.leaf.door.id === doorId);
    if (d) d.target = d.target > 0 ? 0 : OPEN_ANGLE;
  }

  /**
   * Drzwi w danym punkcie ekranu (domyślnie środek – celownik), jeśli nic ich nie zasłania
   * i są w zasięgu ręki. `ndc` to współrzędne -1..1.
   */
  pick(camera: THREE.Camera, occluders: THREE.Object3D[], ndc: THREE.Vector2 = this.center): string | null {
    this.raycaster.setFromCamera(ndc, camera);
    const targets = [...occluders, ...this.doors.map((d) => d.leaf.pivot)];
    const hit = this.raycaster.intersectObjects(targets, true)[0];
    if (!hit) return null;
    for (let o: THREE.Object3D | null = hit.object; o; o = o.parent) {
      const door = this.doors.find((d) => d.leaf.pivot === o);
      if (door) return door.leaf.door.id;
    }
    return null;
  }

  isOpen(doorId: string): boolean {
    return (this.doors.find((d) => d.leaf.door.id === doorId)?.target ?? 0) > 0;
  }

  update(dt: number): void {
    for (const d of this.doors) {
      if (d.angle === d.target) continue;
      const step = SPEED * dt;
      d.angle = d.target > d.angle ? Math.min(d.target, d.angle + step) : Math.max(d.target, d.angle - step);
      this.applyRotation(d);
    }
  }

  colliders(): Rect[] {
    return this.doors
      .filter((d) => d.angle < BLOCK_CLOSED_BELOW || d.angle > BLOCK_OPEN_ABOVE)
      .map((d) => rectFromPoints(leafCorners(d.leaf.plan, d.angle)));
  }

  /** Skrzydła w rzucie (cm) do narysowania na minimapie. */
  outlines(): { corners: [number, number][]; open: boolean }[] {
    return this.doors.map((d) => ({ corners: leafCorners(d.leaf.plan, d.angle), open: d.target > 0 }));
  }

  private applyRotation(d: DoorState): void {
    d.leaf.pivot.rotation.y = d.leaf.openSign * d.angle;
  }
}
