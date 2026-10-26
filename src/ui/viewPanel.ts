import { MODES, type ModeId } from '../data/modes';
import type { AppState, AppView, Store } from '../core/state';
import type { TimeOfDay } from '../scene/lighting';

type ToggleKey = 'rebuild' | 'ceiling' | 'labels';

const VIEW_LABELS: Record<AppView, string> = { walk: 'Spacer', orbit: 'Makieta', top: 'Z góry' };

/**
 * Panel: tryb (surowy / styl 1 / styl 2), widok (spacer / makieta / z góry), pora dnia,
 * nowa ścianka (tylko w stanie surowym) i opcje makiety.
 * Na telefonie zwinięty pod przyciskiem „Menu”, żeby nie zasłaniał joysticka.
 */
export function createViewPanel(store: Store<AppState>, views: AppView[], collapsed: boolean): HTMLElement {
  const panel = document.createElement('details');
  panel.className = 'panel';
  panel.open = !collapsed;
  panel.innerHTML = `
    <summary>Menu</summary>
    <div class="segmented" role="group" aria-label="Tryb">
      ${Object.values(MODES).map((m) => `<button type="button" data-mode="${m.id}" title="${m.name}">${m.label}</button>`).join('')}
    </div>
    <div class="segmented" role="group" aria-label="Widok">
      ${views.map((v) => `<button type="button" data-view="${v}">${VIEW_LABELS[v]}</button>`).join('')}
    </div>
    <div class="segmented" role="group" aria-label="Pora dnia">
      <button type="button" data-time="day">☀ Dzień</button>
      <button type="button" data-time="evening">☾ Wieczór</button>
    </div>
    <label class="raw-only"><input type="checkbox" data-key="rebuild"> Nowa ścianka (przebudowa)</label>
    <label class="mockup-only"><input type="checkbox" data-key="ceiling"> Sufit</label>
    <label class="mockup-only"><input type="checkbox" data-key="labels"> Nazwy i metraże</label>
  `;

  const sync = (s: AppState) => {
    const mark = (attr: string, value: string) =>
      panel.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach((b) => b.classList.toggle('active', b.dataset[attr] === value));
    mark('mode', s.mode);
    mark('view', s.view);
    mark('time', s.time);
    panel.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => (input.checked = s[input.dataset.key as ToggleKey]));
    panel.querySelectorAll<HTMLElement>('.mockup-only').forEach((el) => (el.hidden = s.view === 'walk'));
    panel.querySelectorAll<HTMLElement>('.raw-only').forEach((el) => (el.hidden = MODES[s.mode].variant !== null));
  };

  panel.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button) return;
    button.blur(); // żeby spacja/strzałki nie „klikały” przycisku podczas spaceru
    const { mode, view, time } = button.dataset;
    if (mode) store.set({ mode: mode as ModeId });
    if (view) store.set({ view: view as AppView });
    if (time) store.set({ time: time as TimeOfDay });
  });
  panel.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    input.blur();
    store.set({ [input.dataset.key as ToggleKey]: input.checked });
  });

  store.subscribe(sync);
  sync(store.get());
  return panel;
}
