import type { Apartment, Room, Variant } from '../data/types';
import { inVariant } from '../core/plan';

/** Rozwijana lista pokoi; wybór przenosi gracza do punktu startowego pokoju. */
export class RoomList {
  readonly element = document.createElement('details');
  private readonly list = document.createElement('div');

  constructor(private readonly ap: Apartment, private readonly onSelect: (room: Room) => void) {
    this.element.className = 'rooms';
    this.element.innerHTML = '<summary>Przejdź do pokoju</summary>';
    this.list.className = 'rooms-list';
    this.element.appendChild(this.list);
  }

  build(variant: Variant): void {
    this.list.replaceChildren(
      ...this.ap.rooms
        .filter((r) => inVariant(r, variant))
        .map((room) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = room.name;
          button.addEventListener('click', () => {
            this.element.open = false;
            this.onSelect(room);
          });
          return button;
        }),
    );
  }
}
