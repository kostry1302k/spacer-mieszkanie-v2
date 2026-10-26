import * as THREE from 'three';
import { apartment } from './data/apartment';
import { MODES, type ModeId } from './data/modes';
import type { Room, Variant } from './data/types';
import { buildApartmentModel, type ApartmentModel } from './geometry/apartmentModel';
import { createRenderer, bindResize } from './scene/renderer';
import type { MaterialSet } from './scene/materials';
import { Lighting } from './scene/lighting';
import { buildEnvironment } from './scene/environment';
import { MockupViews } from './scene/views';
import { Player } from './controls/player';
import { DesktopControls } from './controls/desktop';
import { TouchControls } from './controls/touch';
import { staticColliders, type Rect } from './controls/collisions';
import { DoorController } from './interaction/doors';
import { placeFurniture, type PlacedFurniture } from './furniture/place';
import { ModelCache } from './furniture/gltf';
import { bulbLamps } from './geometry/fixtures';
import { RoomLabels } from './ui/roomLabels';
import { RoomList } from './ui/roomList';
import { Minimap } from './ui/minimap';
import { WalkHud } from './ui/hud';
import { createViewPanel } from './ui/viewPanel';
import { Store, type AppState, type AppView } from './core/state';
import { MaterialLibrary } from './core/assets';
import { createFpsMeter, isDebug } from './core/debug';
import { AdaptiveQuality, isTouchDevice as isTouch, qualityProfile } from './core/quality';
import './styles/main.css';

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const hudRoot = document.querySelector<HTMLElement>('#hud')!;
const renderer = createRenderer({ canvas, maxPixelRatio: qualityProfile.maxPixelRatio });
const textureRes = qualityProfile.textureSize === 2048 ? '2k' : '1k';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e2ea);
const lighting = new Lighting(apartment, scene, renderer, qualityProfile.shadowMapSize);
scene.add(lighting.group);

const availableViews: AppView[] = ['walk', 'orbit', 'top'];
const store = new Store<AppState>({ mode: 'raw', view: 'walk', time: 'day', rebuild: false, ceiling: false, labels: true });
const variantOf = (s: AppState): Variant => MODES[s.mode].variant ?? (s.rebuild ? 'rebuild' : 'developer');

// Widoki: spacer (kamera na wysokości oczu) i makieta (orbita / z góry).
const walkCamera = new THREE.PerspectiveCamera(70, 1, 0.05, 100);
const views = new MockupViews(apartment, canvas);
const labels = new RoomLabels(document.querySelector('#app')!);
scene.add(labels.group);

const player = new Player();
const doors = new DoorController();
const hud = new WalkHud(hudRoot, isTouch, () => startWalk());
const MINIMAP_SIZES = isTouch ? [120, 240] : [170, 300];
let minimapBig = false;
const minimap = new Minimap(apartment, MINIMAP_SIZES[0]);
minimap.element.title = 'Powiększ / zmniejsz mapę';
minimap.element.addEventListener('click', () => {
  minimapBig = !minimapBig;
  minimap.resize(MINIMAP_SIZES[+minimapBig]);
  minimap.build(variantOf(store.get()));
});
const roomList = new RoomList(apartment, (room) => goToRoom(room));
const desktop = new DesktopControls(canvas, player, {
  onInteract: () => hoveredDoor && doors.toggle(hoveredDoor),
  onLockChange: (locked) => {
    if (store.get().view !== 'walk') return;
    hud.setActive(locked);
    if (!locked) hud.setPaused();
  },
});
// Na ekranie dotykowym spacer startuje bez blokady kursora i trwa do zmiany widoku.
let touchWalking = false;
const touch = new TouchControls(canvas, player, {
  onTap: (x, y) => {
    if (store.get().view !== 'walk' || !model) return;
    const ndc = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    const id = doors.pick(walkCamera, model.occluders, ndc);
    if (id) doors.toggle(id);
  },
});

function startWalk(): void {
  if (isTouch) {
    touchWalking = true;
    hud.setActive(true);
  } else {
    desktop.lock();
  }
}

const walkActive = () => desktop.locked || touchWalking;

const sidebar = document.createElement('div');
sidebar.className = 'sidebar';
sidebar.append(roomList.element, minimap.element);
hudRoot.appendChild(sidebar);

bindResize(renderer, (w, h) => {
  walkCamera.aspect = w / h;
  // Na pionowym ekranie szerszy kąt w pionie, żeby w poziomie nie widzieć „przez dziurkę od klucza”.
  walkCamera.fov = w < h ? Math.min(90, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(35)) / (w / h)))) : 70;
  walkCamera.updateProjectionMatrix();
  views.resize(w, h);
  labels.renderer.setSize(w, h);
});

// Materiały trybów (ładowane przy pierwszym użyciu) i niebo.
const library = new MaterialLibrary({ maxResolution: textureRes, anisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()) });
const skyLoading = new THREE.LoadingManager();
lighting.loadSky(textureRes, skyLoading);

let materials: MaterialSet | null = null;
let loadedMode: ModeId | null = null;
let environment: THREE.Group | null = null;
let model: ApartmentModel | null = null;
let furniture: PlacedFurniture | null = null;
const models = new ModelCache();
let colliders: Rect[] = [];
let hoveredDoor: string | null = null;
let modeRequest = 0;

/** Przełącza tryb: wczytuje jego materiały, przebudowuje scenę i zwalnia poprzedni zestaw. */
async function loadMode(mode: ModeId): Promise<void> {
  const request = ++modeRequest;
  const def = MODES[mode];
  const show = (p: number) => {
    const text = p < 1 ? `Wczytywanie: ${def.name}… ${Math.round(p * 100)}%` : null;
    hud.setLoading(text);
    hud.setStatus(text);
  };
  show(0);
  const next = await library.load(def, show);
  if (request !== modeRequest) {
    library.release(next, materials ?? next);
    return; // w międzyczasie wybrano inny tryb
  }
  const previous = materials;
  materials = next;
  loadedMode = mode;
  if (environment) {
    scene.remove(environment);
    environment.traverse((o) => o instanceof THREE.Mesh && o.geometry.dispose());
  }
  environment = buildEnvironment(apartment, materials);
  scene.add(environment);
  rebuild();
  if (previous) library.release(previous, materials);
  show(1);
  hud.setSubtitle(`${def.name} · M12, Skypoint 57`);
}

function rebuild(): void {
  if (!materials || !loadedMode) return;
  if (model) {
    scene.remove(model.root);
    model.dispose();
  }
  if (furniture) {
    scene.remove(furniture.group);
    furniture.dispose();
    furniture = null;
  }
  const s = store.get();
  const def = MODES[loadedMode];
  const variant = variantOf(s);
  model = buildApartmentModel(apartment, { variant, interiorDoors: def.interiorDoors, ceilingFixture: def.ceilingFixture }, materials);
  scene.add(model.root);
  doors.setLeaves(model.leaves);
  colliders = staticColliders(apartment, variant);
  if (def.furniture.length) {
    furniture = placeFurniture(def.furniture, materials, models);
    scene.add(furniture.group);
    colliders.push(...furniture.colliders);
  }
  labels.build(apartment, variant);
  lighting.setLamps(furniture ? furniture.lamps : def.ceilingFixture === 'bulb' ? bulbLamps(apartment, variant) : []);
  minimap.build(variant);
  roomList.build(variant);
  // Gracz mógł stać w miejscu nowej ścianki – wypychamy go do najbliższego wolnego miejsca.
  player.settle([...colliders, ...doors.colliders()]);
  applyView();
}

function applyView(): void {
  const s = store.get();
  const walk = s.view === 'walk';
  if (materials) lighting.setTime(s.time, materials);
  if (environment) environment.visible = walk; // elewacja zasłaniałaby makietę
  if (model) model.ceilings.visible = walk || (s.ceiling && s.view === 'orbit');
  labels.setVisible(!walk && s.labels);
  views.setMode(walk ? 'off' : s.view === 'top' ? 'top' : 'orbit');
  desktop.enabled = walk;
  touch.enabled = walk;
  sidebar.hidden = !walk;
  if (walk) hud.setActive(walkActive());
  else {
    desktop.unlock();
    touch.reset();
    touchWalking = false;
    hud.hideAll();
  }
}

function goToRoom(room: Room): void {
  void hud.transition(() => {
    player.place(room.spawn.x, room.spawn.y, room.spawn.yaw);
    player.settle([...colliders, ...doors.colliders()]);
  });
}

store.subscribe((next, prev) => {
  if (next.mode !== prev.mode) void loadMode(next.mode);
  else if (variantOf(next) !== variantOf(prev)) rebuild();
  else applyView();
});

hudRoot.appendChild(createViewPanel(store, availableViews, isTouch));

const start = apartment.rooms.find((r) => r.id === 'hol')!.spawn;
player.place(start.x, start.y, start.yaw);
applyView();
void loadMode(store.get().mode);

const adaptive = new AdaptiveQuality(renderer, () => materials && Object.values(materials).forEach((mat) => (mat.needsUpdate = true)));
const tickFps = isDebug ? createFpsMeter() : null;
if (isDebug) {
  // Pomoc do testów w konsoli: app.walk({ forward: 1, strafe: 0, run: false }, 2) symuluje 2 s chodu.
  const walk = (input: { forward: number; strafe: number; run: boolean }, seconds: number) => {
    for (let t = 0; t < seconds; t += 1 / 60) player.update(1 / 60, input, [...colliders, ...doors.colliders()]);
    return [Math.round(player.x * 10) / 10, Math.round(player.y * 10) / 10];
  };
  const pick = () => {
    player.applyToCamera(walkCamera);
    scene.updateMatrixWorld(); // gdy karta jest w tle, pętla renderowania nie biegnie
    walkCamera.updateMatrixWorld();
    return model ? doors.pick(walkCamera, model.occluders) : null;
  };
  const memory = () => ({ ...renderer.info.memory, textures: renderer.info.memory.textures, library: library.textureCount });
  const stats = () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lights: scene.children.length });
  Object.assign(window, { app: { player, doors, desktop, touch, apartment, store, walk, pick, adaptive, memory, stats, renderer } });
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const frameTime = clock.getDelta();
  const dt = Math.min(frameTime, 0.05);
  doors.update(dt);

  let camera: THREE.Camera;
  if (store.get().view === 'walk') {
    player.update(dt, touch.active ? touch.input : desktop.input, [...colliders, ...doors.colliders()]);
    player.applyToCamera(walkCamera);
    camera = walkCamera;
    hoveredDoor = model && (walkActive() || isDebug) ? doors.pick(walkCamera, model.occluders) : null;
    const action = hoveredDoor && (doors.isOpen(hoveredDoor) ? 'zamknij' : 'otwórz');
    hud.setHint(action && walkActive() ? (isTouch ? `Dotknij drzwi – ${action}` : `E / klik – ${action} drzwi`) : null);
    minimap.draw(player, doors.outlines());
  } else {
    views.update();
    camera = views.camera;
  }

  renderer.render(scene, camera);
  if (labels.group.visible) labels.renderer.render(scene, camera);
  tickFps?.();
  adaptive.tick(frameTime);
});
