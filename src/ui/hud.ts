const DESKTOP_KEYS = `
  <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> lub strzałki – chodzenie</li>
  <li>Mysz – rozglądanie się</li>
  <li><kbd>Shift</kbd> – szybszy krok</li>
  <li><kbd>E</kbd> lub klik – otwieranie drzwi</li>
  <li><kbd>Esc</kbd> – pauza i menu</li>`;

const TOUCH_KEYS = `
  <li><span class="key-icon">◎</span> Lewy kciuk na dole ekranu – chodzenie</li>
  <li><span class="key-icon">↔</span> Przeciąganie w innym miejscu – rozglądanie się</li>
  <li><span class="key-icon">☝</span> Dotknięcie drzwi – otwieranie</li>`;

/** Elementy HUD spaceru: celownik, podpowiedź, ekran startowy/pauzy i przyciemnienie przy przejściu. */
export class WalkHud {
  private readonly crosshair = div('crosshair');
  private readonly hint = div('hint');
  private readonly overlay = div('overlay');
  private readonly fade = div('fade');
  private readonly loading = div('loading-pill');
  private subtitle = 'Stan surowy · M12, Skypoint 57';

  constructor(container: HTMLElement, private readonly touch: boolean, onStart: () => void) {
    this.overlay.innerHTML = `
      <div class="overlay-card">
        <h1>Spacer po mieszkaniu</h1>
        <p class="overlay-status">Stan surowy · M12, Skypoint 57</p>
        <ul class="keys">${touch ? TOUCH_KEYS : DESKTOP_KEYS}</ul>
        <button type="button" class="primary">${touch ? 'Dotknij, aby zacząć' : 'Kliknij, aby zacząć'}</button>
      </div>`;
    this.overlay.querySelector('button')!.addEventListener('click', onStart);
    this.loading.hidden = true;
    container.append(this.crosshair, this.hint, this.overlay, this.fade, this.loading);
    this.setActive(false);
  }

  /** Spacer trwa – celownik (na komputerze) zamiast ekranu startowego. */
  setActive(active: boolean): void {
    this.crosshair.hidden = !active || this.touch;
    this.overlay.hidden = active;
    if (!active) this.setHint(null);
  }

  /** Komunikat pod tytułem ekranu startowego (np. postęp ładowania); null przywraca opis. */
  setStatus(text: string | null): void {
    this.overlay.querySelector('.overlay-status')!.textContent = text ?? this.subtitle;
  }

  /** Opis pod tytułem ekranu startowego (bieżący tryb). */
  setSubtitle(text: string): void {
    this.subtitle = text;
    this.setStatus(null);
  }

  /** Pasek „Wczytywanie…” u góry ekranu przy zmianie trybu; null ukrywa. */
  setLoading(text: string | null): void {
    this.loading.hidden = !text;
    if (text) this.loading.textContent = text;
  }

  setPaused(): void {
    this.overlay.querySelector('button')!.textContent = 'Kliknij, aby kontynuować';
  }

  hideAll(): void {
    this.crosshair.hidden = true;
    this.overlay.hidden = true;
    this.setHint(null);
  }

  setHint(text: string | null): void {
    this.hint.hidden = !text;
    if (text && this.hint.textContent !== text) this.hint.textContent = text;
  }

  /** Krótkie przyciemnienie ekranu na czas przeniesienia gracza. */
  async transition(action: () => void): Promise<void> {
    this.fade.classList.add('on');
    await new Promise((r) => setTimeout(r, 180));
    action();
    this.fade.classList.remove('on');
  }
}

function div(className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}
