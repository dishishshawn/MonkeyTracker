import { MonkeyUpdate, PrivacyPreferences } from '../types';
import { expirationDate } from './updates';

export type MonkeyNotificationKind = 'status-expired' | 'trail-ending' | 'trail-ended';

export interface ScheduledNotification {
  /** Stable per-kind identifier so a replan replaces rather than duplicates. */
  id: MonkeyNotificationKind;
  kind: MonkeyNotificationKind;
  title: string;
  body: string;
  /** ISO timestamp the notification should fire at. */
  fireAt: string;
}

/** How long before a Trail expires the "ending soon" heads-up fires. */
export const TRAIL_WARNING_MS = 5 * 60_000;

/**
 * Notification previews never carry captions, places, photos, or any location
 * value. "Private notifications" additionally hides the activity and mood, so a
 * locked screen shows only that something needs attention.
 */
function statusExpiredBody(update: MonkeyUpdate, notificationsPrivate: boolean): string {
  if (notificationsPrivate) return 'Your current state now shows as unknown.';
  return `Your ${update.activity.toLowerCase()} update is no longer current.`;
}

export function planNotifications(
  update: MonkeyUpdate,
  preferences: PrivacyPreferences,
  now = Date.now(),
): ScheduledNotification[] {
  if (!preferences.statusRemindersEnabled) return [];

  const expiresAt = expirationDate(update).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return [];

  if (update.locationLevel !== 'Trail') {
    return [{
      id: 'status-expired',
      kind: 'status-expired',
      title: 'Your monkey status expired',
      body: statusExpiredBody(update, preferences.notificationsPrivate),
      fireAt: new Date(expiresAt).toISOString(),
    }];
  }

  const planned: ScheduledNotification[] = [];
  const warnAt = expiresAt - TRAIL_WARNING_MS;
  if (warnAt > now) {
    planned.push({
      id: 'trail-ending',
      kind: 'trail-ending',
      title: 'Trail ends in 5 minutes',
      body: 'Live location sharing stops automatically. Nothing to do unless you want to extend it.',
      fireAt: new Date(warnAt).toISOString(),
    });
  }
  planned.push({
    id: 'trail-ended',
    kind: 'trail-ended',
    title: 'Trail ended',
    body: 'Live location sharing has stopped and your current state now shows as unknown.',
    fireAt: new Date(expiresAt).toISOString(),
  });
  return planned;
}
