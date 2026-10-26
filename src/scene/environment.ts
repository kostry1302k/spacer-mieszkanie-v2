import * as THREE from 'three';
import type { Apartment } from '../data/types';
import { m } from '../core/units';
import { boxGeometry, mergeStatic, type PlanBox } from '../geometry/box';
import type { MaterialSet } from './materials';

const FACADE_REACH = 1000; // cm elewacji po bokach mieszkania
const STOREYS_ABOVE = 3;
const GROUND_SIZE = 80; // m

/**
 * Otoczenie widoczne z balkonu i przez okna: elewacja budynku po bokach, nad i pod mieszkaniem,
 * płyty balkonów wyższych pięter i trawa pod budynkiem. Dalej widać już tylko niebo (HDRI).
 */
export function buildEnvironment(ap: Apartment, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group();
  group.name = 'environment';
  const facadeWall = ap.walls.find((w) => w.kind === 'exterior')!;
  const { storeyHeight, floor } = ap.building;
  const groundZ = -storeyHeight * floor;
  const topZ = ap.height + storeyHeight * STOREYS_ABOVE;
  const { y0, y1, x0, x1 } = facadeWall;

  const facade: PlanBox[] = [
    { x0: x0 - FACADE_REACH, x1: x0, y0, y1, z0: groundZ, z1: topZ },
    { x0: x1, x1: x1 + FACADE_REACH, y0, y1, z0: groundZ, z1: topZ },
    { x0, x1, y0, y1, z0: groundZ, z1: 0 },
    { x0, x1, y0, y1, z0: ap.height, z1: topZ },
  ];
  // Balkony wyższych pięter (ten sam obrys co nasz) – rzucają cień na balkon.
  const { slab } = ap.balcony;
  for (let i = 1; i <= STOREYS_ABOVE; i++) {
    const top = storeyHeight * i;
    facade.push({ x0: slab.x0, x1: slab.x1, y0: slab.y0, y1: slab.y1, z0: top - slab.thickness, z1: top });
  }
  const facadeMesh = new THREE.Mesh(mergeStatic(facade.map(boxGeometry)), mats.facade);
  facadeMesh.castShadow = true;
  facadeMesh.receiveShadow = true;
  group.add(facadeMesh);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE), mats.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(m((x0 + x1) / 2), m(groundZ), m(y1) + GROUND_SIZE / 2 - 2);
  ground.receiveShadow = true;
  group.add(ground);

  return group;
}
