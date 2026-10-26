import type * as THREE from 'three';

/** Parametry mebla z danych trybu (wymiary w cm, nazwy materiałów, przełączniki). */
export type Params = Record<string, number | string | boolean | undefined>;

/** Fragment mebla: geometria w lokalnym układzie mebla (cm) i nazwa materiału z palety trybu. */
export interface Part {
  mat: string;
  geo: THREE.BufferGeometry;
}

/** Źródło światła w lampie, w lokalnym układzie mebla (cm). */
export interface LocalLight {
  x: number;
  y: number; // wysokość
  z: number;
  intensity: number; // cd
  color: number;
  /** Świeci także w dzień (pomieszczenia bez okna). */
  alwaysOn?: boolean;
}

/**
 * Wynik buildera. Układ lokalny: początek na podłodze w środku obrysu, x w prawo, y w górę,
 * z do przodu (front mebla). Obrys: szerokość `w` (x) × głębokość `d` (z), wysokość `h`.
 */
export interface Built {
  parts: Part[];
  size: { w: number; d: number; h: number };
  lights?: LocalLight[];
  /** Czy mebel blokuje przejście (dywany, zasłony, lampy wiszące – nie). */
  collide: boolean;
  /** Modele GLB do wstawienia (adres pliku, docelowa wysokość w cm, obrót wokół pionu w stopniach). */
  models?: { file: string; height: number; rotate?: number }[];
}

export type Builder = (p: Params) => Built;
