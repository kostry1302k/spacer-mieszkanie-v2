import type { MoveInput, Player } from './player';

const MOUSE_SENSITIVITY = 0.0022; // rad na piksel przy zablokowanym kursorze
const DRAG_SENSITIVITY = 0.004; // rad na piksel przy przeciąganiu
const CLICK_TOLERANCE = 4; // px – mniejszy ruch to kliknięcie, nie przeciąganie

const KEYS: Record<string, keyof Omit<KeyState, 'run'>> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export interface DesktopControlsEvents {
  /** Kliknięcie przy zablokowanym kursorze albo klawisz E – akcja na obiekcie pod celownikiem. */
  onInteract: () => void;
  onLockChange: (locked: boolean) => void;
}

/**
 * Sterowanie na komputerze: WASD/strzałki + mysz (pointer lock po kliknięciu), Shift = szybciej.
 * Gdy blokada kursora jest niedostępna, można rozglądać się przeciągając myszą.
 */
export class DesktopControls {
  enabled = false;
  private keys: KeyState = { up: false, down: false, left: false, right: false, run: false };
  private drag: { x: number; y: number; moved: number } | null = null;

  constructor(
    private readonly dom: HTMLElement,
    private readonly player: Player,
    private readonly events: DesktopControlsEvents,
  ) {
    document.addEventListener('keydown', (e) => this.onKey(e, true));
    document.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => this.resetKeys());
    document.addEventListener('pointerlockchange', () => {
      if (!this.locked) this.resetKeys();
      this.events.onLockChange(this.locked);
    });
    dom.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  get locked(): boolean {
    return document.pointerLockElement === this.dom;
  }

  get input(): MoveInput {
    const k = this.keys;
    return { forward: +k.up - +k.down, strafe: +k.right - +k.left, run: k.run };
  }

  lock(): void {
    // requestPointerLock może zwrócić Promise odrzucony np. w ramce bez uprawnień – wtedy zostaje przeciąganie.
    const result = this.dom.requestPointerLock() as unknown as Promise<void> | undefined;
    result?.catch?.(() => undefined);
  }

  unlock(): void {
    if (this.locked) document.exitPointerLock();
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (!this.enabled || (e.target as HTMLElement).closest?.('input, textarea, select')) return;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.run = down;
    const key = KEYS[e.code];
    if (key) {
      this.keys[key] = down;
      e.preventDefault();
    }
    if (down && e.code === 'KeyE' && !e.repeat) this.events.onInteract();
  }

  private onMouseDown(e: MouseEvent): void {
    if (!this.enabled || e.button !== 0) return;
    if (this.locked) {
      this.events.onInteract();
      return;
    }
    this.drag = { x: e.clientX, y: e.clientY, moved: 0 };
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.enabled) return;
    if (this.locked) {
      this.player.look(-e.movementX * MOUSE_SENSITIVITY, -e.movementY * MOUSE_SENSITIVITY);
    } else if (this.drag) {
      const dx = e.clientX - this.drag.x;
      const dy = e.clientY - this.drag.y;
      this.drag = { x: e.clientX, y: e.clientY, moved: this.drag.moved + Math.abs(dx) + Math.abs(dy) };
      this.player.look(dx * DRAG_SENSITIVITY, dy * DRAG_SENSITIVITY);
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.drag || e.button !== 0) return;
    const wasClick = this.drag.moved < CLICK_TOLERANCE;
    this.drag = null;
    if (wasClick && this.enabled) this.lock();
  }

  private resetKeys(): void {
    this.keys = { up: false, down: false, left: false, right: false, run: false };
  }
}
