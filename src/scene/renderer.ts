import * as THREE from 'three';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  maxPixelRatio: number;
}

export function createRenderer({ canvas, maxPixelRatio }: RendererOptions): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  return renderer;
}

/** Dopasowuje rozmiar renderera (i przekazanych odbiorców, np. kamer) do okna, także po obrocie telefonu. */
export function bindResize(renderer: THREE.WebGLRenderer, onResize: (width: number, height: number) => void): void {
  const resize = () => {
    const { innerWidth: w, innerHeight: h } = window;
    renderer.setSize(w, h, false);
    onResize(w, h);
  };
  window.addEventListener('resize', resize);
  resize();
}
