// Typy danych mieszkania. Wszystkie wymiary w centymetrach, w układzie z materialy/wymiary.md:
// X w prawo wzdłuż ściany wejściowej, Y w głąb w stronę balkonu, Z (wysokość) od podłogi.

/** Wariant układu: stan deweloperski albo po przebudowie (nowa ścianka i sypialnia). */
export type Variant = 'developer' | 'rebuild';

export type Point = readonly [x: number, y: number];

export type WallKind =
  | 'corridor' // ściana wejściowa od korytarza klatki, 21
  | 'party' // ściana do sąsiedniego mieszkania, 21
  | 'exterior' // ściana balkonowa z ociepleniem, 39,5
  | 'partition' // ścianka działowa 8–10
  | 'shaft' // szacht instalacyjny (bryła pełna)
  | 'newPartition'; // ścianka z przebudowy

/** Ściana jako prostokąt w rzucie (wszystkie ściany są równoległe do osi). */
export interface Wall {
  id: string;
  kind: WallKind;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Brak = ściana w obu wariantach. */
  variants?: Variant[];
}

/** Otwór w ścianie, mierzony wzdłuż dłuższej osi ściany, we współrzędnych bezwzględnych. */
export interface Opening {
  id: string;
  wallId: string;
  from: number;
  to: number;
  /** Wysokość dolnej krawędzi nad podłogą (0 = do podłogi). */
  sill: number;
  /** Wysokość górnej krawędzi nad podłogą. */
  head: number;
}

export type DoorKind = 'entrance' | 'interior' | 'balcony';

export interface Door {
  id: string;
  openingId: string;
  kind: DoorKind;
  /** Zakres skrzydła otwieranego wzdłuż ściany; reszta otworu (jeśli jest) to stałe przeszklenie. */
  leafFrom: number;
  leafTo: number;
  /** Po której stronie skrzydła są zawiasy: 'from' = mniejsza współrzędna. */
  hinge: 'from' | 'to';
  /** Kierunek otwierania wzdłuż normalnej ściany: +1 w stronę większej współrzędnej, -1 mniejszej. */
  swing: 1 | -1;
  /** Odsunięcie płaszczyzny ościeżnicy od lica ściany po stronie otwierania. */
  frameInset: number;
}

export type RoomKind = 'hall' | 'bathroom' | 'living' | 'bedroom' | 'balcony';

export interface Room {
  id: string;
  name: string;
  /** Rodzaj pomieszczenia – decyduje o wykończeniu (np. płytki w łazience). */
  kind: RoomKind;
  polygon: Point[];
  /** Powierzchnia z rzutu / wymiary.md, m² – walidator porównuje ją z obrysem. */
  expectedArea: number;
  /** Punkt startowy spaceru i kierunek patrzenia (stopnie, 0 = w stronę +Y, czyli balkonu). */
  spawn: { x: number; y: number; yaw: number };
  outdoor?: boolean;
  variants?: Variant[];
}

export interface Radiator {
  id: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  bottom: number;
  top: number;
}

export type FixtureType = 'socket' | 'socketDouble' | 'switch' | 'intercom' | 'panel' | 'wallOutlet' | 'ceilingOutlet';

/** Kierunek, w który patrzy lico osprzętu (normalna), w osiach rzutu. */
export type Facing = '+x' | '-x' | '+y' | '-y' | 'down';

/** Osprzęt elektryczny. Brak rzutu instalacji – układ orientacyjny (wymiary.md, „Elektryka”). */
export interface Fixture {
  id: string;
  type: FixtureType;
  x: number;
  y: number;
  z: number;
  facing: Facing;
  approximate: true;
  variants?: Variant[];
}

/** Mebel / element wyposażenia z danych trybu. Builder wg `type` (src/furniture/builders). */
export interface FurnitureItem {
  id: string;
  type: string;
  /** Środek obrysu w rzucie (cm). */
  x: number;
  y: number;
  /** Kierunek, w który zwrócony jest front mebla. */
  facing: '+x' | '-x' | '+y' | '-y';
  /** Wysokość podstawy nad podłogą (np. szafki wiszące, telewizor). */
  z?: number;
  params?: Record<string, number | string | boolean>;
}

export interface Balcony {
  slab: { x0: number; y0: number; x1: number; y1: number; thickness: number };
  railing: { inset: number; height: number };
}

/** Budynek wokół mieszkania – tylko do otoczenia za oknami (założenia, nie z rzutu). */
export interface Building {
  /** Wysokość kondygnacji (od podłogi do podłogi). */
  storeyHeight: number;
  /** Numer piętra mieszkania (0 = parter). */
  floor: number;
}

export interface Apartment {
  name: string;
  height: number;
  building: Building;
  /** Wnętrze w świetle tynku. */
  interior: { x0: number; y0: number; x1: number; y1: number };
  walls: Wall[];
  openings: Opening[];
  doors: Door[];
  rooms: Room[];
  radiators: Radiator[];
  fixtures: Fixture[];
  balcony: Balcony;
}
