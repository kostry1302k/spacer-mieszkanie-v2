// Mieszkanie M21 (Osiedle Sfera II): dane dla silnika – rzut, tryby, podpis na stronie.
import type { Site } from '../../src/site';
import { finishMode, rawMode } from '../../src/data/modes';
import { apartment } from './apartment';
import { styl1Furniture, styl1FurnitureMaterials, styl1Materials } from './style/styl1';
import { styl2Furniture, styl2FurnitureMaterials, styl2Materials } from './style/styl2';

export const site: Site = {
  id: 'm21',
  badge: 'M21 · Sfera II',
  apartment,
  panoramas: [
    // npm run bake -- --scene bake-work/styl1-full.glb --lights bake-work/styl1-day.json --out public/pano/m21/styl1-salon-day --panorama --size 4096 --samples 192 --camera 1.5,1.6,4.7,0 --exposure 4.7
    { id: 'salon', room: 'pokoj', x: 150, y: 470, z: 160, yaw: 0, renders: ['styl1-day'] },
  ],
  modes: [
    rawMode('developer'), // bez przeróbek ścian
    finishMode({ id: 'styl1', name: 'Orzech, trawertyn i zieleń', label: 'Styl 1', surfaces: styl1Materials, palette: styl1FurnitureMaterials, furniture: styl1Furniture }),
    finishMode({ id: 'styl2', name: 'Orzech, trawertyn i zieleń · wariant 2', label: 'Styl 2', surfaces: styl2Materials, palette: styl2FurnitureMaterials, furniture: styl2Furniture }),
  ],
};
