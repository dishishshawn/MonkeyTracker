import { describe, expect, it } from 'vitest';
import {
  BLUE_MONKEY_FUR,
  defaultSkinForAccent,
  LEGACY_BLUE_PINK_COLORWAY,
  monkeyFurFor,
  monkeySkinFor,
  PINK_MONKEY_FUR,
  PINK_MONKEY_SKIN,
} from './monkeyColorways';

describe('monkey appearance colors', () => {
  it('offers blue and pink as separate fur colors', () => {
    expect(monkeyFurFor(BLUE_MONKEY_FUR).label).toBe('Blueberry');
    expect(monkeyFurFor(PINK_MONKEY_FUR).label).toBe('Bubblegum');
    expect(monkeySkinFor(PINK_MONKEY_SKIN).label).toBe('Rosy');
  });

  it('preserves the brief combined blue-and-pink colorway', () => {
    expect(monkeyFurFor(LEGACY_BLUE_PINK_COLORWAY).id).toBe(BLUE_MONKEY_FUR);
    expect(defaultSkinForAccent(LEGACY_BLUE_PINK_COLORWAY)).toBe(PINK_MONKEY_SKIN);
  });

  it('keeps custom colors usable', () => {
    expect(monkeyFurFor('#123456')).toMatchObject({ id: '#123456', label: 'Custom' });
    expect(monkeySkinFor('#654321')).toMatchObject({ id: '#654321', label: 'Custom' });
  });
});
