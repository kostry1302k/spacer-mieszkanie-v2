import * as THREE from 'three';
import { m } from '../core/units';
import { resolveCircle, type Rect } from './collisions';

export const EYE_HEIGHT = 165; // cm
export const PLAYER_RADIUS = 22; // cm – ok. szerokość barków
const WALK_SPEED = 140; // cm/s
const RUN_SPEED = 280;
const ACCELERATION = 10; // im większa, tym szybciej rusza i hamuje
const MAX_STEP = 8; // cm na pod-krok, żeby nie przeskoczyć cienkiej ścianki
const PITCH_LIMIT = THREE.MathUtils.degToRad(85);

export interface MoveInput {
  forward: number; // -1..1
  strafe: number; // -1..1, dodatnie w prawo
  run: boolean;
}

/**
 * Gracz w układzie rzutu (cm). Kąt `yaw` jak w danych pokoi: 0 = patrzy w stronę +Y (balkon),
 * 90 = w stronę +X (kuchnia); w radianach.
 */
export class Player {
  x = 0;
  y = 0;
  yaw = 0;
  pitch = 0;
  private vx = 0;
  private vy = 0;

  place(x: number, y: number, yawDeg: number): void {
    this.x = x;
    this.y = y;
    this.yaw = THREE.MathUtils.degToRad(yawDeg);
    this.pitch = 0;
    this.vx = this.vy = 0;
  }

  look(dYaw: number, dPitch: number): void {
    this.yaw += dYaw;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT);
  }

  update(dt: number, input: MoveInput, colliders: readonly Rect[]): void {
    // Kierunki w rzucie (patrząc z góry, Y w dół): przód (sin yaw, cos yaw), prawa ręka (-cos yaw, sin yaw).
    const fx = Math.sin(this.yaw);
    const fy = Math.cos(this.yaw);
    let ix = fx * input.forward - fy * input.strafe;
    let iy = fy * input.forward + fx * input.strafe;
    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    const speed = input.run ? RUN_SPEED : WALK_SPEED;
    const k = 1 - Math.exp(-ACCELERATION * dt);
    this.vx += (ix * speed - this.vx) * k;
    this.vy += (iy * speed - this.vy) * k;

    const dist = Math.hypot(this.vx, this.vy) * dt;
    const steps = Math.max(1, Math.ceil(dist / MAX_STEP));
    for (let i = 0; i < steps; i++) {
      [this.x, this.y] = resolveCircle(this.x + (this.vx * dt) / steps, this.y + (this.vy * dt) / steps, PLAYER_RADIUS, colliders);
    }
  }

  /** Wypchnięcie z przeszkód bez ruchu (np. po zmianie wariantu albo zamknięciu drzwi). */
  settle(colliders: readonly Rect[]): void {
    [this.x, this.y] = resolveCircle(this.x, this.y, PLAYER_RADIUS, colliders);
  }

  applyToCamera(camera: THREE.Camera): void {
    camera.position.set(m(this.x), m(EYE_HEIGHT), m(this.y));
    // Kamera w three patrzy w -z; obrót o π + yaw daje kierunek (sin yaw, cos yaw) w rzucie.
    camera.rotation.set(this.pitch, Math.PI + this.yaw, 0, 'YXZ');
  }
}
