// JEDYNE źródło geometrii mieszkania. Liczby przepisane 1:1 z materialy/wymiary.md (cm).
// Zmiana wymiaru: najpierw wymiary.md, potem ten plik, potem `npm run check:data`.
import type { Apartment } from './types';

const H = 270;

export const apartment: Apartment = {
  name: 'Mieszkanie M12, Skypoint 57',
  height: H,
  // Lokal na 1. piętrze (karta lokalu); wysokość kondygnacji przyjęta: 270 + strop ok. 30.
  building: { storeyHeight: 300, floor: 1 },
  interior: { x0: 0, y0: 0, x1: 539, y1: 579.5 },

  walls: [
    // Obwód. Ściany wejściowa i balkonowa obejmują narożniki, boczne leżą między nimi.
    { id: 'entrance', kind: 'corridor', x0: -21, y0: -21, x1: 560, y1: 0 },
    { id: 'left', kind: 'party', x0: -21, y0: 0, x1: 0, y1: 579.5 },
    { id: 'right', kind: 'party', x0: 539, y0: 0, x1: 560, y1: 579.5 },
    { id: 'balcony', kind: 'exterior', x0: -21, y0: 579.5, x1: 560, y1: 619 },

    // Szachty instalacyjne (pełne bryły ze ściankami 8).
    { id: 'shaftBath', kind: 'shaft', x0: 0, y0: 0, x1: 30, y1: 60 },
    { id: 'shaftKitchen', kind: 'shaft', x0: 479, y0: 0, x1: 539, y1: 60 },

    // Ścianki działowe stanu deweloperskiego.
    { id: 'bathHall', kind: 'partition', x0: 150, y0: 0, x1: 160, y1: 232 },
    { id: 'bathLiving', kind: 'partition', x0: 0, y0: 222, x1: 150, y1: 232 },
    { id: 'hallKitchen', kind: 'partition', x0: 350, y0: 0, x1: 358, y1: 185 },

    // Przebudowa: ścianka z drzwiami sypialni i ścianka wzdłużna na osi filara.
    { id: 'bedroomFront', kind: 'newPartition', x0: 160, y0: 222, x1: 264.5, y1: 232, variants: ['rebuild'] },
    { id: 'bedroomSide', kind: 'newPartition', x0: 264.5, y0: 222, x1: 274.5, y1: 579.5, variants: ['rebuild'] },
  ],

  openings: [
    { id: 'entranceDoor', wallId: 'entrance', from: 240, to: 345, sill: 0, head: 210 },
    { id: 'bathDoor', wallId: 'bathHall', from: 50, to: 140, sill: 0, head: 207 },
    { id: 'balconyLeft', wallId: 'balcony', from: 69.5, to: 249.5, sill: 0, head: 235 },
    { id: 'balconyRight', wallId: 'balcony', from: 289.5, to: 469.5, sill: 0, head: 235 },
    { id: 'bedroomDoor', wallId: 'bedroomFront', from: 167, to: 257, sill: 0, head: 207 },
  ],

  doors: [
    // Drzwi wejściowe EI 30: do środka, zawiasy po stronie kuchni.
    { id: 'entrance', openingId: 'entranceDoor', kind: 'entrance', leafFrom: 240, leafTo: 345, hinge: 'to', swing: 1, frameInset: 0 },
    // Łazienka: na hol, zawiasy od strony ściany wejściowej.
    { id: 'bath', openingId: 'bathDoor', kind: 'interior', leafFrom: 50, leafTo: 140, hinge: 'from', swing: 1, frameInset: 0 },
    // Sypialnia: do środka, zawiasy przy nowej ściance.
    { id: 'bedroom', openingId: 'bedroomDoor', kind: 'interior', leafFrom: 167, leafTo: 257, hinge: 'to', swing: 1, frameInset: 0 },
    // Drzwi balkonowe: skrzydło przy zewnętrznym ościeżu, rozwierne do środka; przy filarze część stała.
    { id: 'balconyLeft', openingId: 'balconyLeft', kind: 'balcony', leafFrom: 69.5, leafTo: 159.5, hinge: 'from', swing: -1, frameInset: 10 },
    { id: 'balconyRight', openingId: 'balconyRight', kind: 'balcony', leafFrom: 379.5, leafTo: 469.5, hinge: 'to', swing: -1, frameInset: 10 },
  ],

  rooms: [
    {
      id: 'hol',
      kind: 'hall',
      name: 'Hol',
      polygon: [[160, 0], [350, 0], [350, 185], [160, 185]],
      expectedArea: 3.51,
      spawn: { x: 290, y: 40, yaw: 0 },
    },
    {
      id: 'lazienka',
      kind: 'bathroom',
      name: 'Łazienka',
      polygon: [[30, 0], [150, 0], [150, 222], [0, 222], [0, 60], [30, 60]],
      expectedArea: 3.14,
      spawn: { x: 120, y: 120, yaw: 270 },
    },
    {
      id: 'pokoj',
      kind: 'living',
      name: 'Pokój dzienny z aneksem',
      polygon: [[358, 0], [479, 0], [479, 60], [539, 60], [539, 579.5], [0, 579.5], [0, 232], [160, 232], [160, 185], [358, 185]],
      expectedArea: 23.47,
      spawn: { x: 255, y: 215, yaw: 0 },
      variants: ['developer'],
    },
    {
      id: 'salon',
      kind: 'living',
      name: 'Salon z aneksem',
      polygon: [[358, 0], [479, 0], [479, 60], [539, 60], [539, 579.5], [274.5, 579.5], [274.5, 222], [160, 222], [160, 185], [358, 185]],
      expectedArea: 13.82,
      spawn: { x: 330, y: 240, yaw: 10 },
      variants: ['rebuild'],
    },
    {
      id: 'sypialnia',
      kind: 'bedroom',
      name: 'Sypialnia',
      polygon: [[0, 232], [264.5, 232], [264.5, 579.5], [0, 579.5]],
      expectedArea: 9.19,
      spawn: { x: 210, y: 290, yaw: 0 },
      variants: ['rebuild'],
    },
    {
      id: 'balkon',
      kind: 'balcony',
      name: 'Balkon',
      polygon: [[69.5, 619], [469.5, 619], [469.5, 763], [69.5, 763]],
      expectedArea: 5.76,
      spawn: { x: 270, y: 690, yaw: 180 },
      outdoor: true,
    },
  ],

  // Po jednym grzejniku na filarku 69,5 obok skrzydła drzwi balkonowych.
  radiators: [
    { id: 'radLeft', x0: 5, y0: 565, x1: 65, y1: 575, bottom: 15, top: 75 },
    { id: 'radRight', x0: 474, y0: 565, x1: 534, y1: 575, bottom: 15, top: 75 },
  ],

  // Elektryka orientacyjna: gniazdka 30, włączniki 110, nad blatem 110.
  fixtures: [
    // Hol
    // Włącznik i domofon na ściance od kuchni, za zasięgiem otwartych drzwi wejściowych (przy ścianie wejściowej stoi szafa).
    { id: 'hallSwitch', type: 'switch', x: 350, y: 108, z: 105, facing: '-x', approximate: true },
    { id: 'intercom', type: 'intercom', x: 350, y: 108, z: 145, facing: '-x', approximate: true },
    { id: 'panel', type: 'panel', x: 160, y: 168, z: 170, facing: '+x', approximate: true },
    { id: 'bathSwitch', type: 'switch', x: 160, y: 155, z: 110, facing: '+x', approximate: true },
    { id: 'hallCeiling', type: 'ceilingOutlet', x: 255, y: 92.5, z: H, facing: 'down', approximate: true },
    // Łazienka
    { id: 'bathWasher', type: 'socket', x: 62, y: 0, z: 110, facing: '+y', approximate: true },
    { id: 'bathBasin', type: 'socket', x: 140, y: 0, z: 120, facing: '+y', approximate: true },
    { id: 'bathMirror', type: 'wallOutlet', x: 121, y: 0, z: 200, facing: '+y', approximate: true },
    { id: 'bathCeiling', type: 'ceilingOutlet', x: 75, y: 111, z: H, facing: 'down', approximate: true },
    // Kuchnia
    { id: 'fridge', type: 'socket', x: 388, y: 0, z: 30, facing: '+y', approximate: true },
    { id: 'hob', type: 'socket', x: 448, y: 0, z: 30, facing: '+y', approximate: true },
    { id: 'counter1', type: 'socketDouble', x: 539, y: 145, z: 110, facing: '-x', approximate: true },
    { id: 'counter2', type: 'socketDouble', x: 539, y: 172, z: 110, facing: '-x', approximate: true },
    { id: 'kitchenCeiling', type: 'ceilingOutlet', x: 448, y: 122, z: H, facing: 'down', approximate: true },
    // Pokój dzienny
    { id: 'livingSwitch', type: 'switch', x: 160, y: 212, z: 110, facing: '+x', approximate: true },
    { id: 'rightWall1', type: 'socketDouble', x: 539, y: 300, z: 30, facing: '-x', approximate: true },
    { id: 'rightWall2', type: 'socket', x: 539, y: 500, z: 30, facing: '-x', approximate: true },
    { id: 'leftWall1', type: 'socket', x: 0, y: 285, z: 30, facing: '+x', approximate: true },
    { id: 'leftWall2', type: 'socket', x: 0, y: 475, z: 30, facing: '+x', approximate: true },
    { id: 'livingCeiling', type: 'ceilingOutlet', x: 400, y: 400, z: H, facing: 'down', approximate: true },
    { id: 'leftCeiling', type: 'ceilingOutlet', x: 132, y: 405, z: H, facing: 'down', approximate: true },
    // Po przebudowie
    { id: 'tvSocket', type: 'socketDouble', x: 274.5, y: 400, z: 30, facing: '+x', approximate: true, variants: ['rebuild'] },
    { id: 'bedroomSwitch', type: 'switch', x: 150, y: 232, z: 110, facing: '+y', approximate: true, variants: ['rebuild'] },
  ],

  balcony: {
    slab: { x0: 69.5, y0: 619, x1: 469.5, y1: 763, thickness: 20 },
    railing: { inset: 6.5, height: 110 },
  },
};
