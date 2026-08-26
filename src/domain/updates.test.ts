import { describe, expect, it } from 'vitest';
import { createInitialUpdate, enforceLocationPreference, enforceTrailExpiration, expirationDate, expirationOptionsFor, isUpdateExpired, pruneTimeline, TIMELINE_RETENTION_MS } from './updates';

describe('update expiration', () => {
  it('stays current immediately before its boundary and expires at the boundary', () => {
    const update = { ...createInitialUpdate(new Date('2026-08-26T10:00:00.000Z')), expiration: '30 min' as const };
    expect(isUpdateExpired(update, new Date('2026-08-26T10:29:59.999Z').getTime())).toBe(false);
    expect(isUpdateExpired(update, new Date('2026-08-26T10:30:00.000Z').getTime())).toBe(true);
  });

  it('sets end-of-day expiration in the publisher local day', () => {
    const start = new Date(2026, 7, 26, 20, 30, 0, 0);
    const update = { ...createInitialUpdate(start), expiration: 'End of day' as const };
    const end = expirationDate(update);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(7);
    expect(end.getDate()).toBe(26);
    expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([23, 59, 59, 999]);
  });
});

describe('privacy and retention', () => {
  it('forces location to Hidden while the global switch is off', () => {
    const update = { ...createInitialUpdate(), locationLevel: 'Trail' as const };
    expect(enforceLocationPreference(update, false).locationLevel).toBe('Hidden');
    expect(enforceLocationPreference(update, true).locationLevel).toBe('Trail');
  });

  it('limits precise Trail sharing to one hour', () => {
    const update = { ...createInitialUpdate(), locationLevel: 'Trail' as const, expiration: '8 hours' as const };
    expect(enforceTrailExpiration(update).expiration).toBe('1 hour');
    expect(expirationOptionsFor('Trail').map((option) => option.label)).toEqual(['15 min', '30 min', '1 hour']);
  });

  it('removes entries older than 30 days', () => {
    const now = Date.now();
    const update = createInitialUpdate(new Date(now));
    const recent = { id: 'recent', update, createdAt: new Date(now - TIMELINE_RETENTION_MS).toISOString(), saved: false };
    const old = { id: 'old', update, createdAt: new Date(now - TIMELINE_RETENTION_MS - 1).toISOString(), saved: true };
    expect(pruneTimeline([old, recent], now).map((entry) => entry.id)).toEqual(['recent']);
  });
});
