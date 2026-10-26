// Katalog tekstur PBR (CC0) pobranych przez `npm run assets` – pliki w public/assets/textures/<id>/<res>/.
// `size` to rzeczywisty rozmiar jednego kafla tekstury w metrach (UV w scenie: 1 jednostka = 1 m).

export type TextureRes = '1k' | '2k';

export interface TextureSet {
  id: string;
  size: number;
  resolutions: TextureRes[];
}

export const TEXTURES = {
  screed: { id: 'concrete_floor_worn_001', size: 3, resolutions: ['1k', '2k'] },
  greyPlaster: { id: 'Concrete024', size: 2, resolutions: ['1k'] },
  ceilingPlaster: { id: 'Concrete034', size: 2.5, resolutions: ['1k'] },
  concrete: { id: 'Concrete020', size: 2, resolutions: ['1k'] },
  smokedOak: { id: 'wood_floor', size: 1.7, resolutions: ['1k', '2k'] },
  oakHerringbone: { id: 'herringbone_parquet', size: 3.4, resolutions: ['1k', '2k'] },
  paint: { id: 'PaintedPlaster017', size: 2, resolutions: ['1k'] },
  concreteTiles: { id: 'PavingStones136', size: 2.4, resolutions: ['1k'] },
  marbleTiles: { id: 'Tiles078', size: 1.2, resolutions: ['1k'] },
  walnut: { id: 'Wood051', size: 1.2, resolutions: ['1k'] },
  oak: { id: 'Wood049', size: 1.2, resolutions: ['1k'] },
  fabric: { id: 'Fabric030', size: 0.6, resolutions: ['1k'] },
  carpet: { id: 'Carpet016', size: 1, resolutions: ['1k'] },
  wicker: { id: 'Wicker008A', size: 0.35, resolutions: ['1k'] },
} satisfies Record<string, TextureSet>;

export type TextureKey = keyof typeof TEXTURES;

/** HDRI nieba i otoczenia (public/assets/hdri/<id>_<res>.hdr). */
export const SKY_HDRI = { id: 'noon_grass', resolutions: ['1k', '2k'] as TextureRes[] };
