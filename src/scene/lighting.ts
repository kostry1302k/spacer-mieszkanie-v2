import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { Apartment } from '../data/types';
import { SKY_HDRI, type TextureRes } from '../data/materials';
import { wallAxis } from '../core/plan';
import { m } from '../core/units';
import type { Lamp } from '../furniture/place';
import type { MaterialSet } from './materials';

export type TimeOfDay = 'day' | 'evening';

/** Ustawienia pory dnia. Natężenia w jednostkach fizycznych three.js (cd, lx, nit). */
const PRESETS: Record<TimeOfDay, {
  exposure: number;
  sun: number;
  sky: number; // światło nieba wpadające przez przeszklenia (RectAreaLight)
  skyColor: number;
  fill: number; // rozproszone odbicia (HemisphereLight)
  environment: number;
  background: number;
  lampsOn: boolean; // lampy sztuczne (poza tymi, które świecą zawsze – np. łazienka bez okna)
}> = {
  day: { exposure: 1.05, sun: 3.2, sky: 7, skyColor: 0xdde8f7, fill: 0.8, environment: 0.35, background: 1, lampsOn: false },
  evening: { exposure: 0.85, sun: 0, sky: 0.35, skyColor: 0x5d6f9c, fill: 0.15, environment: 0.04, background: 0.06, lampsOn: true },
};

/**
 * Światło dzienne i wieczorne:
 * - niebo z HDRI (tło i odbicia), słońce z południa z cieniami,
 * - prostokątne źródła w otworach drzwi balkonowych (światło nieba wpadające do środka),
 * - lampy z danych trybu (żarówki w stanie surowym, oprawy w wykończeniach) – wieczorem;
 *   lampy oznaczone `alwaysOn` (łazienka bez okna) świecą też w dzień.
 */
export class Lighting {
  readonly group = new THREE.Group();
  private readonly sun: THREE.DirectionalLight;
  private readonly fill = new THREE.HemisphereLight(0xe6edf5, 0xb3a898, 1);
  private readonly windows: THREE.RectAreaLight[] = [];
  private lamps: { light: THREE.PointLight; lamp: Lamp }[] = [];
  private readonly lampGroup = new THREE.Group();
  private time: TimeOfDay = 'day';

  constructor(
    ap: Apartment,
    private readonly scene: THREE.Scene,
    private readonly renderer: THREE.WebGLRenderer,
    shadowMapSize: number,
  ) {
    RectAreaLightUniformsLib.init();
    this.group.name = 'lighting';
    this.group.add(this.fill, this.lampGroup);

    // Słońce dla Warszawy w październiku ok. 13:00: wysokość ok. 27°, lekko na zachód od południa.
    const { x0, x1, y0, y1 } = ap.interior;
    const center = new THREE.Vector3(m((x0 + x1) / 2), 0, m((y0 + y1) / 2));
    const elevation = THREE.MathUtils.degToRad(27);
    const azimuth = THREE.MathUtils.degToRad(15);
    const dir = new THREE.Vector3(Math.cos(elevation) * Math.sin(azimuth), Math.sin(elevation), Math.cos(elevation) * Math.cos(azimuth));
    this.sun = new THREE.DirectionalLight(0xfff0dc, 1);
    this.sun.position.copy(center).addScaledVector(dir, 15);
    this.sun.target.position.copy(center);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(shadowMapSize);
    Object.assign(this.sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.02;
    this.group.add(this.sun, this.sun.target);

    // Światło nieba w każdym przeszkleniu ściany zewnętrznej, skierowane do wnętrza.
    for (const o of ap.openings) {
      const wall = ap.walls.find((w) => w.id === o.wallId);
      if (!wall || wall.kind !== 'exterior' || wallAxis(wall) !== 'x') continue;
      const width = m(o.to - o.from);
      const height = m(o.head - o.sill);
      const light = new THREE.RectAreaLight(0xffffff, 1, width, height);
      const inside = wall.y0; // lico wewnętrzne
      light.position.set(m((o.from + o.to) / 2), m((o.sill + o.head) / 2), m(inside) - 0.01);
      light.lookAt(light.position.x, light.position.y, light.position.z - 1);
      this.windows.push(light);
      this.group.add(light);
    }
  }

  /** Wczytuje HDRI nieba (tło + mapa otoczenia do odbić). */
  loadSky(res: TextureRes, manager: THREE.LoadingManager): void {
    const file = SKY_HDRI.resolutions.includes(res) ? res : '1k';
    new RGBELoader(manager).load(`${import.meta.env.BASE_URL}assets/hdri/${SKY_HDRI.id}_${file}.hdr`, (hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromEquirectangular(hdr).texture;
      pmrem.dispose();
      this.scene.background = hdr;
      // Obrót nieba tak, by słońce z HDRI było mniej więcej po stronie balkonu (południe).
      this.scene.backgroundRotation.y = this.scene.environmentRotation.y = Math.PI;
    });
  }

  /** Podmienia źródła światła lamp (po zmianie trybu albo wariantu). */
  setLamps(lamps: Lamp[]): void {
    this.lamps.forEach(({ light }) => light.dispose());
    this.lampGroup.clear();
    this.lamps = lamps.map((lamp) => {
      const light = new THREE.PointLight(lamp.color, 0, 0, 2);
      light.position.set(m(lamp.x), m(lamp.z), m(lamp.y));
      this.lampGroup.add(light);
      return { light, lamp };
    });
    this.apply();
  }

  setTime(time: TimeOfDay, materials?: MaterialSet): void {
    this.time = time;
    this.apply(materials);
  }

  private apply(materials?: MaterialSet): void {
    const p = PRESETS[this.time];
    this.renderer.toneMappingExposure = p.exposure;
    this.sun.intensity = p.sun;
    this.sun.visible = p.sun > 0;
    this.fill.intensity = p.fill;
    for (const w of this.windows) {
      w.intensity = p.sky;
      w.color.set(p.skyColor);
    }
    this.scene.environmentIntensity = p.environment;
    this.scene.backgroundIntensity = p.background;
    for (const { light, lamp } of this.lamps) {
      const on = p.lampsOn || Boolean(lamp.alwaysOn);
      light.intensity = on ? lamp.intensity : 0;
      light.visible = on;
    }
    // Świecące klosze, żarówki i taśmy LED.
    for (const mat of Object.values(materials ?? {})) {
      const glow = mat.userData.glow as number | undefined;
      if (glow !== undefined) mat.emissiveIntensity = p.lampsOn || mat.userData.alwaysOn ? glow : 0;
    }
  }
}
