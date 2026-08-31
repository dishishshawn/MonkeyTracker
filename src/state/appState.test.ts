import { describe, expect, it } from 'vitest';
import { createInitialUpdate } from '../domain/updates';
import { appReducer, createInitialAppState } from './appState';

describe('pairing consent', () => {
  it('does not pair without explicit accepted consent', () => {
    const state = createInitialAppState();
    const next = appReducer(state, { type: 'completePairing', profile: { name: 'Alex', accent: '#123456', skin: '#EBC6A6' }, consentAccepted: false });
    expect(next.paired).toBe(false);
  });

  it('pairs only after consent with a non-empty profile', () => {
    const state = createInitialAppState();
    const next = appReducer(state, { type: 'completePairing', profile: { name: 'Alex', accent: '#123456', skin: '#EBC6A6' }, consentAccepted: true });
    expect(next.paired).toBe(true);
    expect(next.profile.name).toBe('Alex');
  });
});

describe('state privacy', () => {
  it('hides current location immediately when the global switch turns off', () => {
    const state = {
      ...createInitialAppState(),
      currentUpdate: { ...createInitialUpdate(), locationLevel: 'Trail' as const },
      preferences: { locationEnabled: true, notificationsPrivate: true, statusRemindersEnabled: true },
    };
    const next = appReducer(state, { type: 'setLocationEnabled', enabled: false });
    expect(next.currentUpdate.locationLevel).toBe('Hidden');
    expect(next.preferences.locationEnabled).toBe(false);
  });

  it('cannot publish location while the global switch is off', () => {
    const state = createInitialAppState();
    const update = { ...createInitialUpdate(), locationLevel: 'Nearby' as const };
    const entry = { id: 'one', update, createdAt: update.updatedAt, saved: false, mine: true };
    const next = appReducer(state, { type: 'publish', update, entry });
    expect(next.currentUpdate.locationLevel).toBe('Hidden');
    expect(next.timeline[0]?.update.locationLevel).toBe('Hidden');
  });
});

describe('quick scenes', () => {
  it('saves a reusable status setup', () => {
    const state = createInitialAppState();
    const next = appReducer(state, { type: 'saveQuickPreset', preset: { id: 'coffee', name: 'Coffee break', activity: 'Eating', mood: 'Cozy', availability: 'Free', scene: 'Café', pose: 'Waving' } });
    expect(next.quickPresets[0]?.name).toBe('Coffee break');
  });
});
