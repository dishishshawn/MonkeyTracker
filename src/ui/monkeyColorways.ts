export interface MonkeyColorChoice {
  id: string;
  label: string;
}

export interface MonkeySkinChoice extends MonkeyColorChoice {
  cheek?: string;
}

export const DEFAULT_MONKEY_FUR = '#996744';
export const DEFAULT_MONKEY_SKIN = '#EBC6A6';
export const BLUE_MONKEY_FUR = '#77B9E8';
export const PINK_MONKEY_FUR = '#F49ABB';
export const PINK_MONKEY_SKIN = '#FFD9E8';
export const LEGACY_BLUE_PINK_COLORWAY = 'blue-pink';

export const monkeyFurColors: readonly MonkeyColorChoice[] = [
  { id: DEFAULT_MONKEY_FUR, label: 'Cocoa' },
  { id: '#7C5540', label: 'Truffle' },
  { id: '#C07A62', label: 'Cinnamon' },
  { id: '#5F7562', label: 'Moss' },
  { id: BLUE_MONKEY_FUR, label: 'Blueberry' },
  { id: PINK_MONKEY_FUR, label: 'Bubblegum' },
] as const;

export const monkeySkinColors: readonly MonkeySkinChoice[] = [
  { id: DEFAULT_MONKEY_SKIN, label: 'Honey', cheek: '#D98E82' },
  { id: '#F2C9A9', label: 'Peach', cheek: '#E99C94' },
  { id: PINK_MONKEY_SKIN, label: 'Rosy', cheek: '#F17EA9' },
  { id: '#C9906F', label: 'Caramel', cheek: '#A96055' },
  { id: '#8C5A45', label: 'Cocoa', cheek: '#704334' },
] as const;

export function monkeyFurFor(accent: string): MonkeyColorChoice {
  const normalized = accent === LEGACY_BLUE_PINK_COLORWAY ? BLUE_MONKEY_FUR : accent;
  return monkeyFurColors.find((color) => color.id === normalized) ?? { id: normalized, label: 'Custom' };
}

export function monkeySkinFor(skin: string): MonkeySkinChoice {
  return monkeySkinColors.find((color) => color.id === skin) ?? { id: skin, label: 'Custom' };
}

export function defaultSkinForAccent(accent: string): string {
  return accent === LEGACY_BLUE_PINK_COLORWAY ? PINK_MONKEY_SKIN : DEFAULT_MONKEY_SKIN;
}
