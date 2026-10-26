import type { MoveInput, Player } from './player';

const JOYSTICK_RADIUS = 56; // px – wychylenie gałki dające pełną prędkość
const LOOK_SENSITIVITY = 0.0055; // rad na piksel przeciągnięcia
const TAP_MAX_MOVE = 10; // px
const TAP_MAX_TIME = 350; // ms
/** Strefa joysticka: lewa dolna część ekranu (ułamki szerokości i wysokości). */
const ZONE = { maxX: 0.5, minY: 0.4 };

export interface TouchControlsEvents {
  /** Krótkie dotknięcie poza joystickiem – współrzędne w px ekranu. */
  onTap: (x: number, y: number) => void;
}

interface Tracked {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * Sterowanie dotykiem: joystick pojawia się pod lewym kciukiem (lewa dolna część ekranu),
 * przeciąganie w pozostałej części obraca widok, krótkie dotknięcie to akcja (np. drzwi).
 * Obsługuje oba palce jednocześnie.
 */
export class TouchControls {
  enabled = false;
  private stick: Tracked | null = null;
  private look: Tracked | null = null;
  private readonly base = document.createElement('div');
  private readonly knob = document.createElement('div');
  private move = { forward: 0, strafe: 0 };

  constructor(
    dom: HTMLElement,
    private readonly player: Player,
    private readonly events: TouchControlsEvents,
  ) {
    this.base.className = 'joystick';
    this.knob.className = 'joystick-knob';
    this.base.appendChild(this.knob);
    this.base.hidden = true;
    document.body.appendChild(this.base);

    dom.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('pointercancel', (e) => this.onUp(e, true));
    // Safari: blokada powiększania gestem szczypania.
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  get input(): MoveInput {
    return { forward: this.move.forward, strafe: this.move.strafe, run: false };
  }

  /** Ruch z joysticka trwa – do łączenia z klawiaturą. */
  get active(): boolean {
    return this.stick !== null;
  }

  reset(): void {
    this.stick = this.look = null;
    this.move = { forward: 0, strafe: 0 };
    this.base.hidden = true;
  }

  private onDown(e: PointerEvent): void {
    if (!this.enabled || e.pointerType !== 'touch') return;
    e.preventDefault();
    const t: Tracked = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, startTime: performance.now() };
    const inZone = e.clientX < window.innerWidth * ZONE.maxX && e.clientY > window.innerHeight * ZONE.minY;
    if (inZone && !this.stick) {
      this.stick = t;
      this.base.hidden = false;
      this.base.style.transform = `translate(${t.x}px, ${t.y}px)`;
      this.knob.style.transform = 'translate(0px, 0px)';
    } else if (!this.look) {
      this.look = t;
    }
  }

  private onMove(e: PointerEvent): void {
    if (this.stick?.id === e.pointerId) {
      let dx = e.clientX - this.stick.startX;
      let dy = e.clientY - this.stick.startY;
      const len = Math.hypot(dx, dy);
      if (len > JOYSTICK_RADIUS) {
        dx *= JOYSTICK_RADIUS / len;
        dy *= JOYSTICK_RADIUS / len;
      }
      this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.move = { forward: -dy / JOYSTICK_RADIUS, strafe: dx / JOYSTICK_RADIUS };
    } else if (this.look?.id === e.pointerId) {
      const dx = e.clientX - this.look.x;
      const dy = e.clientY - this.look.y;
      this.look.x = e.clientX;
      this.look.y = e.clientY;
      // Przeciągnięcie w prawo obraca w prawo, w górę – patrzy w górę.
      this.player.look(-dx * LOOK_SENSITIVITY, -dy * LOOK_SENSITIVITY);
    }
  }

  private onUp(e: PointerEvent, cancelled = false): void {
    let t: Tracked | null = null;
    if (this.stick?.id === e.pointerId) {
      t = this.stick;
      this.stick = null;
      this.move = { forward: 0, strafe: 0 };
      this.base.hidden = true;
    } else if (this.look?.id === e.pointerId) {
      t = this.look;
      this.look = null;
    }
    // Krótkie dotknięcie bez przesunięcia – także w strefie joysticka (drzwi bywają w lewym dolnym rogu).
    if (t && !cancelled && Math.hypot(e.clientX - t.startX, e.clientY - t.startY) < TAP_MAX_MOVE && performance.now() - t.startTime < TAP_MAX_TIME) {
      this.events.onTap(e.clientX, e.clientY);
    }
  }
}
