/** Tryb deweloperski włączany parametrem `?debug` w adresie strony. */
export const isDebug = new URLSearchParams(window.location.search).has('debug');

/** Prosty licznik FPS w rogu ekranu; zwraca funkcję wywoływaną co klatkę. */
export function createFpsMeter(): () => void {
  const el = document.createElement('div');
  el.className = 'fps';
  document.body.appendChild(el);

  let frames = 0;
  let last = performance.now();
  return () => {
    frames++;
    const now = performance.now();
    if (now - last >= 500) {
      el.textContent = `${Math.round((frames * 1000) / (now - last))} fps`;
      frames = 0;
      last = now;
    }
  };
}
