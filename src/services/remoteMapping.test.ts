import { describe, expect, it } from 'vitest';
import { isUpdateExpired } from '../domain/updates';
import { RemoteUpdate } from './backend';
import { remoteCurrent, remoteTimeline } from './remoteMapping';

const row: RemoteUpdate = {
  id: 'update-one',
  troop_id: 'troop-one',
  user_id: 'user-one',
  activity: 'Studying',
  mood: 'Cozy',
  availability: 'Free',
  caption: 'Tiny cloud monkey',
  location_level: 'Hidden',
  place: null,
  expiration: '1 hour',
  scene: 'Desk nest',
  pose: 'Locked in',
  updated_at: '2026-08-26T12:00:00.000Z',
  expires_at: '2026-08-26T13:00:00.000Z',
  created_at: '2026-08-26T12:00:00.000Z',
};

describe('remote update mapping', () => {
  it('preserves server IDs and timestamps in local history', () => {
    const [entry] = remoteTimeline([row]);
    expect(entry?.id).toBe('update-one');
    expect(entry?.update.updatedAt).toBe(row.updated_at);
    expect(entry?.update.locationLevel).toBe('Hidden');
  });

  it('uses an expired unknown state when the server has no active update', () => {
    expect(isUpdateExpired(remoteCurrent([]), Date.now())).toBe(true);
  });
});
