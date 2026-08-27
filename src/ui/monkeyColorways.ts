export interface MonkeyColorway {
  id: string;
  label: string;
  fur: string;
  face: string;
  innerEar: string;
  cheek?: string;
}

export const BLUE_PINK_COLORWAY = 'blue-pink';

export const monkeyColorways: readonly MonkeyColorway[] = [
  { id: '#996744', label: 'Cocoa', fur: '#996744', face: '#EBC6A6', innerEar: '#DDAA8F' },
  { id: '#7C5540', label: 'Truffle', fur: '#7C5540', face: '#E7BE9C', innerEar: '#C98E7C' },
  { id: '#C07A62', label: 'Cinnamon', fur: '#C07A62', face: '#F2C9A9', innerEar: '#E7A291' },
  { id: '#5F7562', label: 'Moss', fur: '#5F7562', face: '#DCC5A8', innerEar: '#A6B49D' },
  { id: BLUE_PINK_COLORWAY, label: 'Blueberry blush', fur: '#77B9E8', face: '#FFD9E8', innerEar: '#F49ABB', cheek: '#F17EA9' },
] as const;

export function monkeyColorwayFor(accent: string): MonkeyColorway {
  return monkeyColorways.find((colorway) => colorway.id === accent) ?? {
    id: accent,
    label: 'Custom',
    fur: accent,
    face: '#EBC6A6',
    innerEar: '#DDAA8F',
  };
}
