import type { ModeId } from '../data/modes';
import type { TimeOfDay } from '../scene/lighting';

export type AppView = 'walk' | 'orbit' | 'top';

/** Stan aplikacji wybierany w interfejsie. */
export interface AppState {
  mode: ModeId;
  view: AppView;
  time: TimeOfDay;
  /** Nowa ścianka w stanie surowym (w wykończeniach zawsze jest). */
  rebuild: boolean;
  ceiling: boolean;
  labels: boolean;
}

type Listener<T> = (next: T, prev: T) => void;

/** Minimalny magazyn stanu: odczyt, zmiana fragmentu i powiadamianie odbiorców. */
export class Store<T extends object> {
  private listeners: Listener<T>[] = [];

  constructor(private state: T) {}

  get(): T {
    return this.state;
  }

  set(patch: Partial<T>): void {
    const prev = this.state;
    const next = { ...prev, ...patch };
    if (Object.keys(patch).every((k) => prev[k as keyof T] === next[k as keyof T])) return;
    this.state = next;
    this.listeners.forEach((fn) => fn(next, prev));
  }

  subscribe(fn: Listener<T>): void {
    this.listeners.push(fn);
  }
}
