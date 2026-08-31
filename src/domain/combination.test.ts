import { describe, expect, it } from 'vitest';
import { combinationState } from './combination';
import { createInitialUpdate } from './updates';
import { MonkeyUpdate } from '../types';

const base = (over: Partial<MonkeyUpdate> = {}): MonkeyUpdate => ({ ...createInitialUpdate(), ...over });

describe('combination states', () => {
  it('pairs a shared scene and a shared activity', () => {
    const a = base({ scene: 'Café', activity: 'Studying' });
    const b = base({ scene: 'Café', activity: 'Studying' });
    expect(combinationState(a, b, false, false)).toEqual({
      sharedScene: true, sharedActivity: true, bothUnknown: false,
    });
  });

  it('pairs each axis independently', () => {
    const a = base({ scene: 'Café', activity: 'Studying' });
    const b = base({ scene: 'Café', activity: 'Gaming' });
    const state = combinationState(a, b, false, false);
    expect(state.sharedScene).toBe(true);
    expect(state.sharedActivity).toBe(false);
  });

  it('ends the moment either status expires', () => {
    // PRD 5.7: a pair state that outlives a participant implies presence the
    // product knows is gone.
    const a = base({ scene: 'Café', activity: 'Studying' });
    const b = base({ scene: 'Café', activity: 'Studying' });
    expect(combinationState(a, b, false, true).sharedScene).toBe(false);
    expect(combinationState(a, b, true, false).sharedScene).toBe(false);
    expect(combinationState(a, b, false, true).sharedActivity).toBe(false);
    expect(combinationState(a, b, true, false).sharedActivity).toBe(false);
  });

  it('reports both-unknown only when neither status is current', () => {
    const a = base();
    const b = base();
    expect(combinationState(a, b, true, true).bothUnknown).toBe(true);
    expect(combinationState(a, b, true, false).bothUnknown).toBe(false);
    expect(combinationState(a, b, false, false).bothUnknown).toBe(false);
  });

  it('never pairs on anything but scene and activity', () => {
    // Guards 5.6: mood or accessory pairings would give users something to
    // match against, and matching on purpose is pressure.
    const a = base({ scene: 'Café', activity: 'Studying', mood: 'Cozy', accessory: 'Crown' });
    const b = base({ scene: 'Outdoors', activity: 'Gaming', mood: 'Cozy', accessory: 'Crown' });
    const state = combinationState(a, b, false, false);
    expect(state.sharedScene).toBe(false);
    expect(state.sharedActivity).toBe(false);
  });
});
