import { createInitialUpdate } from '../domain/updates';
import { MonkeyUpdate, TimelineEntry } from '../types';
import { RemoteUpdate } from './backend';

export function fromRemoteUpdate(row: RemoteUpdate): MonkeyUpdate {
  return {
    activity: row.activity as MonkeyUpdate['activity'],
    mood: row.mood as MonkeyUpdate['mood'],
    availability: row.availability as MonkeyUpdate['availability'],
    caption: row.caption ?? '',
    locationLevel: row.location_level as MonkeyUpdate['locationLevel'],
    place: row.place ?? '',
    expiration: row.expiration as MonkeyUpdate['expiration'],
    scene: row.scene as MonkeyUpdate['scene'],
    pose: row.pose as MonkeyUpdate['pose'],
    updatedAt: row.updated_at,
  };
}

export function remoteTimeline(rows: RemoteUpdate[]): TimelineEntry[] {
  return rows.map((row) => ({
    id: row.id,
    update: fromRemoteUpdate(row),
    createdAt: row.created_at,
    saved: false,
  }));
}

export function remoteCurrent(rows: RemoteUpdate[]): MonkeyUpdate {
  return rows[0] ? fromRemoteUpdate(rows[0]) : createInitialUpdate(new Date(0));
}
