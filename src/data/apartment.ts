// JEDYNE źródło geometrii mieszkania. Liczby przepisane z materialy/wymiary.md (cm).
// Zmiana wymiaru: najpierw wymiary.md, potem ten plik, potem `npm run check:data`.
import type { Apartment } from './types';

const H = 270;

export const apartment: Apartment = {
  name: 'M21, Sfera II',
  height: H,
  usableArea: 67.24,
  // Lokal na 1. piętrze z 3; wysokość kondygnacji przyjęta: 270 + strop ok. 30.
  building: { storeyHeight: 300, floor: 1 },
  interior: { x0: 0, y0: -347.2, x1: 1035.9, y1: 870.6 },

  walls: [
    // Obwód. Północ (okna) 40, balkon 30, od klatki 25, do sąsiadów 20 – wartości typowe (wymiary.md).
    { id: 'west', kind: 'party', x0: -20, y0: 0, x1: 0, y1: 870.6 },
    { id: 'northLiving', kind: 'exterior', x0: -20, y0: -40, x1: 309.5, y1: 0 },
    { id: 'westRooms', kind: 'exterior', x0: 309.5, y0: -387.2, x1: 349.5, y1: 0 },
    { id: 'northRooms', kind: 'exterior', x0: 349.5, y0: -387.2, x1: 1055.9, y1: -347.2 },
    { id: 'east', kind: 'party', x0: 1035.9, y0: -347.2, x1: 1055.9, y1: 123.4 },
    { id: 'entrance', kind: 'corridor', x0: 832.7, y0: 123.4, x1: 1055.9, y1: 148.4 },
    { id: 'eastLiving', kind: 'party', x0: 327.7, y0: 316.1, x1: 347.7, y1: 870.6 },
    { id: 'blockSouth', kind: 'party', x0: 339.2, y0: 296.1, x1: 832.7, y1: 316.1 },
    { id: 'balcony', kind: 'exterior', x0: -20, y0: 870.6, x1: 347.7, y1: 900.6 },

    // Szachty w łazience i WC.
    { id: 'shaftBath', kind: 'shaft', x0: 339.2, y0: 228.4, x1: 382.2, y1: 296.1 },
    { id: 'shaftWc', kind: 'shaft', x0: 635.9, y0: 233.6, x1: 670.9, y1: 296.1 },

    // Ścianki działowe.
    { id: 'livingHall', kind: 'partition', x0: 327.7, y0: 0, x1: 338.6, y1: 136 },
    { id: 'livingBath', kind: 'partition', x0: 327.7, y0: 136, x1: 339.2, y1: 316.1 },
    { id: 'roomsHall', kind: 'partition', x0: 349.5, y0: -9.2, x1: 1035.9, y1: 0 },
    { id: 'room4Room5', kind: 'partition', x0: 604.9, y0: -347.2, x1: 614.1, y1: -9.2 },
    { id: 'hallBath', kind: 'partition', x0: 338.6, y0: 123.4, x1: 832.7, y1: 136 },
    { id: 'bathWc', kind: 'partition', x0: 625, y0: 136, x1: 635.9, y1: 296.1 },
    { id: 'wcEast', kind: 'partition', x0: 821.8, y0: 136, x1: 832.7, y1: 296.1 },
  ],

  openings: [
    { id: 'entranceDoor', wallId: 'entrance', from: 866, to: 968.2, sill: 0, head: 210 },
    { id: 'livingDoor', wallId: 'livingHall', from: 14.3, to: 104.4, sill: 0, head: 205 },
    { id: 'room4Door', wallId: 'roomsHall', from: 498.7, to: 588.3, sill: 0, head: 205 },
    { id: 'room5Door', wallId: 'roomsHall', from: 690.4, to: 779.9, sill: 0, head: 205 },
    { id: 'bathDoor', wallId: 'hallBath', from: 444.2, to: 534.3, sill: 0, head: 205 },
    { id: 'wcDoor', wallId: 'hallBath', from: 710.5, to: 800.6, sill: 0, head: 205 },
    { id: 'livingWindow', wallId: 'northLiving', from: 206.6, to: 307.6, sill: 85, head: 235 },
    { id: 'room4Window', wallId: 'northRooms', from: 406.9, to: 517.1, sill: 85, head: 235 },
    { id: 'room5WindowL', wallId: 'northRooms', from: 621.5, to: 726.9, sill: 85, head: 235 },
    { id: 'room5WindowR', wallId: 'northRooms', from: 726.9, to: 832.2, sill: 85, head: 235 },
    // Przeszklenie balkonowe: stała część + drzwi (lewe), drugie drzwi (prawe).
    { id: 'balconyLeft', wallId: 'balcony', from: 9.8, to: 212, sill: 0, head: 235 },
    { id: 'balconyRight', wallId: 'balcony', from: 212, to: 316.8, sill: 0, head: 235 },
  ],

  doors: [
    { id: 'entrance', openingId: 'entranceDoor', kind: 'entrance', leafFrom: 866, leafTo: 968.2, hinge: 'to', swing: -1, frameInset: 0 },
    { id: 'room4', openingId: 'room4Door', kind: 'interior', leafFrom: 498.7, leafTo: 588.3, hinge: 'to', swing: -1, frameInset: 0 },
    { id: 'room5', openingId: 'room5Door', kind: 'interior', leafFrom: 690.4, leafTo: 779.9, hinge: 'from', swing: -1, frameInset: 0 },
    { id: 'bath', openingId: 'bathDoor', kind: 'interior', leafFrom: 444.2, leafTo: 534.3, hinge: 'to', swing: -1, frameInset: 0 },
    { id: 'wc', openingId: 'wcDoor', kind: 'interior', leafFrom: 710.5, leafTo: 800.6, hinge: 'to', swing: -1, frameInset: 0 },
    // Okna rozwierne do środka (północ – pokój po stronie większego Y).
    { id: 'livingWindow', openingId: 'livingWindow', kind: 'window', leafFrom: 206.6, leafTo: 307.6, hinge: 'from', swing: 1, frameInset: 10 },
    { id: 'room4Window', openingId: 'room4Window', kind: 'window', leafFrom: 406.9, leafTo: 517.1, hinge: 'from', swing: 1, frameInset: 10 },
    { id: 'room5WindowL', openingId: 'room5WindowL', kind: 'window', leafFrom: 621.5, leafTo: 726.9, hinge: 'from', swing: 1, frameInset: 10 },
    { id: 'room5WindowR', openingId: 'room5WindowR', kind: 'window', leafFrom: 726.9, leafTo: 832.2, hinge: 'to', swing: 1, frameInset: 10 },
    { id: 'balconyLeft', openingId: 'balconyLeft', kind: 'balcony', leafFrom: 122, leafTo: 212, hinge: 'from', swing: -1, frameInset: 10 },
    { id: 'balconyRight', openingId: 'balconyRight', kind: 'balcony', leafFrom: 216, leafTo: 306, hinge: 'to', swing: -1, frameInset: 10 },
  ],

  rooms: [
    { id: 'pokoj', name: 'Pokój dzienny z aneksem', kind: 'living', polygon: [[0, 0], [327.7, 0], [327.7, 870.6], [0, 870.6]], expectedArea: 28.48, spawn: { x: 270, y: 60, yaw: 0 } },
    { id: 'hol', name: 'Hol', kind: 'hall', polygon: [[338.6, 0], [1035.9, 0], [1035.9, 123.4], [338.6, 123.4]], expectedArea: 8.69, spawn: { x: 915, y: 95, yaw: 270 } },
    { id: 'lazienka', name: 'Łazienka', kind: 'bathroom', polygon: [[339.2, 136], [625, 136], [625, 296.1], [382.2, 296.1], [382.2, 228.4], [339.2, 228.4]], expectedArea: 4.33, spawn: { x: 490, y: 170, yaw: 0 } },
    { id: 'gabinet', name: 'Gabinet', kind: 'bedroom', polygon: [[349.5, -347.2], [604.9, -347.2], [604.9, -9.2], [349.5, -9.2]], expectedArea: 8.67, spawn: { x: 540, y: -60, yaw: 180 } },
    { id: 'sypialnia', name: 'Sypialnia', kind: 'bedroom', polygon: [[614.1, -347.2], [1035.9, -347.2], [1035.9, -9.2], [614.1, -9.2]], expectedArea: 14.27, spawn: { x: 735, y: -60, yaw: 150 } },
    { id: 'wc', name: 'WC', kind: 'bathroom', polygon: [[635.9, 136], [821.8, 136], [821.8, 296.1], [670.9, 296.1], [670.9, 233.6], [635.9, 233.6]], expectedArea: 2.8, spawn: { x: 755, y: 165, yaw: 0 } },
    { id: 'balkon', name: 'Balkon', kind: 'balcony', polygon: [[2.3, 900.6], [315.6, 900.6], [315.6, 1065.3], [2.3, 1065.3]], expectedArea: 5.15, spawn: { x: 160, y: 960, yaw: 180 }, outdoor: true },
  ],

  // Orientacyjnie: grzejnik pod każdym oknem.
  radiators: [
    { id: 'radLiving', x0: 222, y0: 5, x1: 292, y1: 15, bottom: 15, top: 75 },
    { id: 'radRoom4', x0: 422, y0: -342, x1: 502, y1: -332, bottom: 15, top: 75 },
    { id: 'radRoom5', x0: 660, y0: -342, x1: 790, y1: -332, bottom: 15, top: 75 },
  ],

  // Elektryka orientacyjna: gniazdka 30, włączniki 110, nad blatem 110.
  fixtures: [
    { id: 'hallSwitch', type: 'switch', x: 1035.9, y: 105, z: 110, facing: '-x', approximate: true },
    { id: 'intercom', type: 'intercom', x: 1035.9, y: 85, z: 150, facing: '-x', approximate: true },
    { id: 'panel', type: 'panel', x: 640, y: 0, z: 170, facing: '+y', approximate: true },
    { id: 'hallCeilingA', type: 'ceilingOutlet', x: 500, y: 61.7, z: H, facing: 'down', approximate: true },
    { id: 'hallCeilingB', type: 'ceilingOutlet', x: 870, y: 61.7, z: H, facing: 'down', approximate: true },
    { id: 'livingSwitch', type: 'switch', x: 327.7, y: 118, z: 110, facing: '-x', approximate: true },
    { id: 'kitchenCounter1', type: 'socketDouble', x: 327.7, y: 230, z: 110, facing: '-x', approximate: true },
    { id: 'kitchenCounter2', type: 'socketDouble', x: 327.7, y: 420, z: 110, facing: '-x', approximate: true },
    { id: 'tvSocket', type: 'socketDouble', x: 327.7, y: 730, z: 30, facing: '-x', approximate: true },
    { id: 'livingSofa', type: 'socket', x: 0, y: 520, z: 30, facing: '+x', approximate: true },
    { id: 'livingCeilingA', type: 'ceilingOutlet', x: 163.8, y: 250, z: H, facing: 'down', approximate: true },
    { id: 'livingCeilingB', type: 'ceilingOutlet', x: 163.8, y: 650, z: H, facing: 'down', approximate: true },
    { id: 'room4Switch', type: 'switch', x: 488, y: -9.2, z: 110, facing: '-y', approximate: true },
    { id: 'room4Desk', type: 'socketDouble', x: 604.9, y: -200, z: 30, facing: '-x', approximate: true },
    { id: 'room4Ceiling', type: 'ceilingOutlet', x: 477.2, y: -178.2, z: H, facing: 'down', approximate: true },
    { id: 'room5Switch', type: 'switch', x: 790, y: -9.2, z: 110, facing: '-y', approximate: true },
    { id: 'room5BedA', type: 'socket', x: 1035.9, y: -282, z: 60, facing: '-x', approximate: true },
    { id: 'room5BedB', type: 'socket', x: 1035.9, y: -78, z: 60, facing: '-x', approximate: true },
    { id: 'room5Ceiling', type: 'ceilingOutlet', x: 825, y: -178.2, z: H, facing: 'down', approximate: true },
    { id: 'bathSwitch', type: 'switch', x: 434, y: 123.4, z: 110, facing: '-y', approximate: true },
    { id: 'bathWasher', type: 'socket', x: 412, y: 296.1, z: 110, facing: '-y', approximate: true },
    { id: 'bathCeiling', type: 'ceilingOutlet', x: 482, y: 216, z: H, facing: 'down', approximate: true },
    { id: 'wcSwitch', type: 'switch', x: 700, y: 123.4, z: 110, facing: '-y', approximate: true },
    { id: 'wcCeiling', type: 'ceilingOutlet', x: 746, y: 216, z: H, facing: 'down', approximate: true },
  ],

  balcony: {
    slab: { x0: 2.3, y0: 900.6, x1: 315.6, y1: 1065.3, thickness: 20 },
    railing: { inset: 3, height: 110 },
  },
};
