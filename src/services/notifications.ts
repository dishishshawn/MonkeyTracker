import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScheduledNotification } from '../domain/notifications';

/**
 * Native scheduled reminders for status expiration and Trail end. Everything in
 * here is best-effort: the app must keep working when the platform has no
 * scheduler (web) or the user denies the permission.
 */

const ANDROID_CHANNEL_ID = 'monkey-status';
const OWNER_TAG = 'monkey-tracker';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let handlerConfigured = false;
let permissionGranted: boolean | null = null;

export function configureNotificationHandler(): void {
  if (!supported || handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Status and Trail reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    enableVibrate: false,
    showBadge: false,
  });
}

/** Reads the current grant without ever showing a prompt. */
async function hasNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) await ensureAndroidChannel().catch(() => undefined);
    return current.granted;
  } catch {
    return false;
  }
}

/**
 * Asks at most once per app run, and only from an explicit user action such as
 * publishing an update. A denial is remembered so we never nag, which keeps the
 * "graceful degraded experience" requirement intact.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  if (permissionGranted !== null) return permissionGranted;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      permissionGranted = true;
    } else if (current.canAskAgain) {
      const requested = await Notifications.requestPermissionsAsync();
      permissionGranted = requested.granted;
    } else {
      permissionGranted = false;
    }
  } catch {
    permissionGranted = false;
  }
  if (permissionGranted) await ensureAndroidChannel().catch(() => undefined);
  return permissionGranted;
}

async function cancelOwnedNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => (request.content.data as { owner?: string } | null)?.owner === OWNER_TAG)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

/**
 * Serializes scheduling work so a burst of state changes cannot interleave a
 * cancel pass with another plan's scheduling pass.
 */
let queue: Promise<void> = Promise.resolve();

function enqueue(work: () => Promise<void>): Promise<void> {
  queue = queue.then(work, work);
  return queue;
}

/**
 * Replaces every reminder this app owns with `plan`. Never throws, and never
 * shows a permission prompt: scheduling is silently skipped until the user has
 * granted permission through an explicit action.
 */
export function syncScheduledNotifications(plan: ScheduledNotification[]): Promise<void> {
  if (!supported) return Promise.resolve();
  return enqueue(async () => { await runSync(plan); });
}

async function runSync(plan: ScheduledNotification[]): Promise<void> {
  if (plan.length > 0 && !(await hasNotificationPermission())) return;
  try {
    await cancelOwnedNotifications();
    for (const item of plan) {
      const date = new Date(item.fireAt);
      if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          sound: false,
          data: { owner: OWNER_TAG, kind: item.kind },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        },
      });
    }
  } catch {
    // Scheduling is a convenience; in-app expiration handling still runs.
  }
}

/** Used when leaving a troop so no reminder outlives the pairing. */
export function cancelScheduledNotifications(): Promise<void> {
  if (!supported) return Promise.resolve();
  return enqueue(async () => {
    try {
      await cancelOwnedNotifications();
    } catch {
      // Ignored for the same reason as scheduling failures.
    }
  });
}
