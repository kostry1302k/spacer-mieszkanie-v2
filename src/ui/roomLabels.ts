import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { Apartment, Variant } from '../data/types';
import { inVariant, polygonArea, polygonCentroid } from '../core/plan';
import { m } from '../core/units';
import { isDebug } from '../core/debug';

const formatArea = (a: number) => `${a.toFixed(2).replace('.', ',')} m²`;

/** Podpisy pokoi z nazwą i metrażem liczonym z obrysu w danych. */
export class RoomLabels {
  readonly renderer = new CSS2DRenderer();
  readonly group = new THREE.Group();

  constructor(container: HTMLElement) {
    this.renderer.domElement.className = 'labels-layer';
    container.appendChild(this.renderer.domElement);
  }

  build(ap: Apartment, variant: Variant): void {
    this.clear();
    for (const room of ap.rooms.filter((r) => inVariant(r, variant))) {
      const el = document.createElement('div');
      el.className = 'room-label';
      // Metraż z rzutu; w trybie ?debug obok pole policzone z obrysu w danych.
      const computed = isDebug ? ` · obrys ${formatArea(polygonArea(room.polygon))}` : '';
      el.innerHTML = `<b>${room.name}</b><span>${formatArea(room.expectedArea)}${computed}</span>`;
      const [x, y] = polygonCentroid(room.polygon);
      const label = new CSS2DObject(el);
      label.position.set(m(x), 0.05, m(y));
      this.group.add(label);
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
    this.renderer.domElement.style.display = visible ? '' : 'none';
  }

  private clear(): void {
    for (const child of [...this.group.children]) {
      (child as CSS2DObject).element.remove();
      this.group.remove(child);
    }
  }
}
