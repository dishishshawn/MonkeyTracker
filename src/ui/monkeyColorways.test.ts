import { describe, expect, it } from 'vitest';
import { BLUE_PINK_COLORWAY, monkeyColorwayFor } from './monkeyColorways';

describe('monkey colorways', () => {
  it('resolves the blue and pink palette', () => {
    expect(monkeyColorwayFor(BLUE_PINK_COLORWAY)).toMatchObject({
      label: 'Blueberry blush',
      fur: '#77B9E8',
      innerEar: '#F49ABB',
      face: '#FFD9E8',
    });
  });

  it('keeps legacy custom accent values usable', () => {
    expect(monkeyColorwayFor('#123456')).toMatchObject({ id: '#123456', fur: '#123456', label: 'Custom' });
  });
});
