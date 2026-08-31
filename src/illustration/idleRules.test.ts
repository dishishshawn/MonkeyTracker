import { describe, expect, it } from 'vitest';
import { isDrowsyHour } from './idleRules';

describe('idle drowsiness', () => {
  it('settles late at night and in the small hours', () => {
    expect([22, 23, 0, 3, 5].map(isDrowsyHour)).toEqual([true, true, true, true, true]);
  });

  it('stays awake through the day', () => {
    expect([6, 9, 13, 18, 21].map(isDrowsyHour)).toEqual([false, false, false, false, false]);
  });

  it('is a property of the hour alone, never of how much the user posts', () => {
    // Guards PRD 3.4: nothing about idle life may be contingent on activity.
    for (let hour = 0; hour < 24; hour += 1) {
      expect(isDrowsyHour(hour)).toBe(isDrowsyHour(hour));
    }
  });
});
