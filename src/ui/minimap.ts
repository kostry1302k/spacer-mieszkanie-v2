import type { Apartment, Variant } from '../data/types';
import { inVariant } from '../core/plan';
import { wallBoxes } from '../geometry/walls';

const MARGIN = 12; // cm wokół obrysu
const FOV_CONE = 0.62; // rad – połowa kąta stożka widzenia na mapie
const CONE_LENGTH = 130; // cm

const COLORS = {
  room: 'rgba(236, 229, 219, 0.95)',
  outdoor: 'rgba(214, 222, 228, 0.9)',
  wall: '#3a352f',
  door: '#c9814a',
  doorOpen: '#7fae6b',
  player: '#d9574a',
  cone: 'rgba(217, 87, 74, 0.25)',
};

/** Minimapa rzutu (północ u góry, jak na rzucie dewelopera) z pozycją i kierunkiem patrzenia. */
export class Minimap {
  readonly element: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly staticLayer = document.createElement('canvas');
  private readonly bounds: { x0: number; y0: number; x1: number; y1: number };
  private scale = 1;
  private dpr = 1;

  constructor(private readonly ap: Apartment, cssWidth: number) {
    const xs = ap.walls.flatMap((w) => [w.x0, w.x1]);
    const ys = [...ap.walls.flatMap((w) => [w.y0, w.y1]), ap.balcony.slab.y1];
    this.bounds = { x0: Math.min(...xs) - MARGIN, y0: Math.min(...ys) - MARGIN, x1: Math.max(...xs) + MARGIN, y1: Math.max(...ys) + MARGIN };

    this.element = document.createElement('canvas');
    this.element.className = 'minimap';
    this.ctx = this.element.getContext('2d')!;
    this.resize(cssWidth);
  }

  resize(cssWidth: number): void {
    this.dpr = Math.min(window.devicePixelRatio, 2);
    const w = this.bounds.x1 - this.bounds.x0;
    const h = this.bounds.y1 - this.bounds.y0;
    const cssHeight = Math.round((cssWidth * h) / w);
    this.element.style.width = `${cssWidth}px`;
    this.element.style.height = `${cssHeight}px`;
    for (const c of [this.element, this.staticLayer]) {
      c.width = Math.round(cssWidth * this.dpr);
      c.height = Math.round(cssHeight * this.dpr);
    }
    this.scale = (cssWidth * this.dpr) / w;
  }

  /** Rysuje warstwę stałą (pokoje, ściany) dla wariantu. */
  build(variant: Variant): void {
    const ctx = this.staticLayer.getContext('2d')!;
    ctx.clearRect(0, 0, this.staticLayer.width, this.staticLayer.height);
    ctx.save();
    this.applyTransform(ctx);
    for (const room of this.ap.rooms.filter((r) => inVariant(r, variant))) {
      ctx.beginPath();
      room.polygon.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = room.outdoor ? COLORS.outdoor : COLORS.room;
      ctx.fill();
    }
    // Próg pod otworami ma kolor pokoju, ściany rysujemy bez nadproży – widać przejścia.
    ctx.fillStyle = COLORS.wall;
    for (const b of wallBoxes(this.ap, variant).filter((box) => box.z0 === 0)) ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    ctx.restore();
  }

  draw(player: { x: number; y: number; yaw: number }, doors: { corners: [number, number][]; open: boolean }[]): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.element.width, this.element.height);
    ctx.drawImage(this.staticLayer, 0, 0);
    ctx.save();
    this.applyTransform(ctx);

    for (const d of doors) {
      ctx.beginPath();
      d.corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = d.open ? COLORS.doorOpen : COLORS.door;
      ctx.fill();
    }

    const { x, y, yaw } = player;
    const dir = (a: number): [number, number] => [x + Math.sin(a) * CONE_LENGTH, y + Math.cos(a) * CONE_LENGTH];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(...dir(yaw - FOV_CONE));
    // Kąt na płótnie dla kierunku (sin a, cos a) to π/2 − a.
    ctx.arc(x, y, CONE_LENGTH, Math.PI / 2 - yaw + FOV_CONE, Math.PI / 2 - yaw - FOV_CONE, true);
    ctx.closePath();
    ctx.fillStyle = COLORS.cone;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.player;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();
  }

  private applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.scale, 0, 0, this.scale, -this.bounds.x0 * this.scale, -this.bounds.y0 * this.scale);
  }
}
