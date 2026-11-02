// Panoramy 360° mieszkania M21: miejsca kamer do renderu w Blenderze (scripts/panoramas.ts) i przycisków w spacerze.
import type { Panorama } from '../../src/site';

// Ekspozycja dobrana na próbnych renderach (npm run panoramas -- --test): pokoje od północy jaśniej, balkon ciemniej,
// pomieszczenia bez okna – słabsze lampy (inaczej prześwietlone).
export const panoramy: Panorama[] = [
  { id: 'salon', room: 'pokoj', x: 150, y: 470, z: 160, yaw: 0, exposure: 5.3 }, // od jadalni na balkon
  { id: 'kanapa', room: 'pokoj', x: 240, y: 780, z: 160, yaw: 180, exposure: 4.7 }, // od balkonu na kuchnię i jadalnię
  { id: 'sypialnia', room: 'sypialnia', x: 740, y: -60, z: 160, yaw: 100, exposure: 6.5 },
  { id: 'gabinet', room: 'gabinet', x: 480, y: -90, z: 160, yaw: 135, exposure: 6.5 },
  { id: 'lazienka', room: 'lazienka', x: 500, y: 180, z: 160, yaw: 30, exposure: 4.7, lampGain: 0.25 },
  { id: 'wc', room: 'wc', x: 760, y: 170, z: 160, yaw: 0, exposure: 4.7, lampGain: 0.25 },
  { id: 'hol', room: 'hol', x: 700, y: 62, z: 160, yaw: 270, exposure: 5, lamps: 'all', lampGain: 0.25 },
  { id: 'balkon', room: 'balkon', x: 90, y: 960, z: 160, yaw: 0, exposure: 1.5 },
];
