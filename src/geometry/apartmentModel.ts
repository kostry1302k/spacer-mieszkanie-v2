import * as THREE from 'three';
import type { Apartment, Variant } from '../data/types';
import type { MaterialSet, SurfaceKey } from '../scene/materials';
import { mergeStatic } from './box';
import { wallFaces } from './walls';
import { ceilingGeometries, floorGeometries, thresholdGeometries } from './floors';
import { buildOpenings, type DoorLeaf } from './openings';
import { buildBalcony } from './balcony';
import { buildFixtures, type CeilingFixture } from './fixtures';

export interface ApartmentModelOptions {
  variant: Variant;
  /** Drzwi wewnętrzne są tylko w wykończeniach; w stanie surowym same ościeża. */
  interiorDoors: boolean;
  ceilingFixture: CeilingFixture;
}

export interface ApartmentModel {
  root: THREE.Group;
  ceilings: THREE.Object3D;
  /** Bryły zasłaniające (do sprawdzania, czy drzwi są widoczne). */
  occluders: THREE.Object3D[];
  leaves: DoorLeaf[];
  dispose(): void;
}

/** Łączy geometrie w jedną siatkę na każdą powierzchnię (jeden draw call na materiał). */
function meshesBySurface(
  parts: { surface: SurfaceKey; geometry: THREE.BufferGeometry }[],
  mats: MaterialSet,
  name: string,
  cast: boolean,
): THREE.Group {
  const group = new THREE.Group();
  group.name = name;
  for (const surface of new Set(parts.map((p) => p.surface))) {
    const mesh = new THREE.Mesh(mergeStatic(parts.filter((p) => p.surface === surface).map((p) => p.geometry)), mats[surface]);
    mesh.name = `${name}:${surface}`;
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

/** Buduje całą bryłę mieszkania z danych dla wybranego wariantu i zestawu materiałów. */
export function buildApartmentModel(ap: Apartment, opts: ApartmentModelOptions, mats: MaterialSet): ApartmentModel {
  const root = new THREE.Group();
  root.name = 'apartment';

  const walls = meshesBySurface(wallFaces(ap, opts.variant), mats, 'walls', true);
  root.add(walls);
  root.add(meshesBySurface(floorGeometries(ap, opts.variant), mats, 'floors', false));
  root.add(meshesBySurface(thresholdGeometries(ap, opts.variant).map((geometry) => ({ surface: 'threshold', geometry })), mats, 'thresholds', false));
  const ceilings = meshesBySurface(ceilingGeometries(ap, opts.variant).map((geometry) => ({ surface: 'ceiling', geometry })), mats, 'ceilings', true);
  root.add(ceilings);

  const openings = buildOpenings(ap, opts, mats);
  root.add(openings.group);
  root.add(buildBalcony(ap, mats));
  root.add(buildFixtures(ap, opts.variant, opts.ceilingFixture, mats));

  return {
    root,
    ceilings,
    occluders: [walls],
    leaves: openings.leaves,
    dispose() {
      root.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
  };
}
