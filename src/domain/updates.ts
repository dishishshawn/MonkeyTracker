import {
  Activity,
  Accessory,
  Availability,
  Expiration,
  LocationLevel,
  MonkeyUpdate,
  Mood,
  Pose,
  RoomDecor,
  Scene,
  TimelineEntry,
} from '../types';

export const activities: Activity[] = ['Studying', 'Working', 'Eating', 'Chilling', 'Sleeping', 'Commuting', 'At the gym', 'Cooking', 'Gaming', 'Out & about'];
export const moods: Mood[] = ['Crispy', 'Cozy', 'Focused', 'Wobbly', 'Happy', 'Tender', 'Sleepy', 'Frazzled', 'Social', 'Quiet'];
export const availabilities: Availability[] = ['Free', 'Text only', 'Busy', 'Asleep'];
export const locationLevels: LocationLevel[] = ['Hidden', 'Perch', 'Nearby', 'Trail'];
export const scenes: Scene[] = ['Auto', 'Desk nest', 'Couch mode', 'Outdoors', 'Café', 'Blanket fort'];
export const poses: Pose[] = ['Auto', 'Waving', 'Locked in', 'Flopped', 'Victory'];
export const accessories: Accessory[] = ['None', 'Glasses', 'Beanie', 'Crown', 'Flower'];
export const roomDecorations: RoomDecor[] = ['None', 'Plant', 'String lights', 'Poster', 'Plushie'];

export const expirationOptions: Array<{ label: Expiration; minutes: number | 'day' }> = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '4 hours', minutes: 240 },
  { label: '8 hours', minutes: 480 },
  { label: 'End of day', minutes: 'day' },
];

const trailExpirations: Expiration[] = ['15 min', '30 min', '1 hour'];

export function expirationOptionsFor(locationLevel: LocationLevel) {
  return locationLevel === 'Trail'
    ? expirationOptions.filter((option) => trailExpirations.includes(option.label))
    : expirationOptions;
}

export function enforceTrailExpiration(update: MonkeyUpdate): MonkeyUpdate {
  if (update.locationLevel !== 'Trail' || trailExpirations.includes(update.expiration)) return update;
  return { ...update, expiration: '1 hour' };
}

export const TIMELINE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export function createInitialUpdate(now = new Date()): MonkeyUpdate {
  return {
    activity: 'Chilling',
    mood: 'Quiet',
    availability: 'Free',
    caption: '',
    locationLevel: 'Hidden',
    place: '',
    expiration: '2 hours',
    scene: 'Auto',
    pose: 'Auto',
    accessory: 'None',
    roomDecor: 'None',
    photoUri: '',
    photoPath: '',
    updatedAt: now.toISOString(),
  };
}

export function expirationDate(update: MonkeyUpdate): Date {
  const start = new Date(update.updatedAt);
  const option = expirationOptions.find((item) => item.label === update.expiration) ?? { label: '2 hours' as const, minutes: 120 };
  if (option.minutes === 'day') {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  return new Date(start.getTime() + option.minutes * 60_000);
}

export function isUpdateExpired(update: MonkeyUpdate, now = Date.now()): boolean {
  return expirationDate(update).getTime() <= now;
}

export function enforceLocationPreference(update: MonkeyUpdate, locationEnabled: boolean): MonkeyUpdate {
  return enforceTrailExpiration(locationEnabled ? update : { ...update, locationLevel: 'Hidden' });
}

export function placeLabel(update: MonkeyUpdate): string {
  if (update.locationLevel === 'Hidden') return 'Location hidden';
  if (update.locationLevel === 'Nearby') return `Near ${update.place}`;
  if (update.locationLevel === 'Trail') return `Live near ${update.place}`;
  return update.place;
}

export function pruneTimeline(entries: TimelineEntry[], now = Date.now()): TimelineEntry[] {
  return entries.filter((entry) => {
    const createdAt = new Date(entry.createdAt).getTime();
    return Number.isFinite(createdAt) && now - createdAt <= TIMELINE_RETENTION_MS;
  });
}

export function timelineId(now = Date.now()): string {
  return `update-${now}-${Math.random().toString(36).slice(2, 8)}`;
}
