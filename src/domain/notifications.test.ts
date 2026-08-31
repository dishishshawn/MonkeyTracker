import { describe, expect, it } from 'vitest';
import { ScheduledNotification, TRAIL_WARNING_MS, planNotifications } from './notifications';
import { createInitialUpdate } from './updates';
import { MonkeyUpdate, PrivacyPreferences } from '../types';

const NOW = new Date('2026-08-31T09:00:00.000Z');

function preferences(overrides: Partial<PrivacyPreferences> = {}): PrivacyPreferences {
  return { locationEnabled: true, notificationsPrivate: true, statusRemindersEnabled: true, ...overrides };
}

function at(plan: ScheduledNotification[], index: number): ScheduledNotification {
  const item = plan[index];
  if (!item) throw new Error(`Expected a notification at index ${index}`);
  return item;
}

function update(overrides: Partial<MonkeyUpdate> = {}): MonkeyUpdate {
  return { ...createInitialUpdate(NOW), caption: 'Crying in the stairwell', place: '221B Baker Street', ...overrides };
}

describe('scheduled notification plans', () => {
  it('schedules a single expiration reminder for a non-Trail update', () => {
    const plan = planNotifications(update({ expiration: '2 hours' }), preferences(), NOW.getTime());
    expect(plan.map((item) => item.kind)).toEqual(['status-expired']);
    expect(at(plan, 0).fireAt).toBe('2026-08-31T11:00:00.000Z');
  });

  it('warns before a Trail ends and again when it has ended', () => {
    const trail = update({ locationLevel: 'Trail', expiration: '1 hour' });
    const plan = planNotifications(trail, preferences(), NOW.getTime());
    expect(plan.map((item) => item.kind)).toEqual(['trail-ending', 'trail-ended']);
    expect(new Date(at(plan, 0).fireAt).getTime()).toBe(new Date(at(plan, 1).fireAt).getTime() - TRAIL_WARNING_MS);
  });

  it('drops the Trail warning when the Trail ends sooner than the warning window', () => {
    const trail = update({ locationLevel: 'Trail', expiration: '15 min' });
    const almostOver = NOW.getTime() + 12 * 60_000;
    const plan = planNotifications(trail, preferences(), almostOver);
    expect(plan.map((item) => item.kind)).toEqual(['trail-ended']);
  });

  it('never puts a caption or a place into a preview', () => {
    const plans = [
      planNotifications(update({ expiration: '2 hours' }), preferences({ notificationsPrivate: false }), NOW.getTime()),
      planNotifications(update({ locationLevel: 'Trail', expiration: '1 hour' }), preferences({ notificationsPrivate: false }), NOW.getTime()),
    ].flat();
    expect(plans.length).toBeGreaterThan(0);
    for (const item of plans) {
      const preview = `${item.title} ${item.body}`;
      expect(preview).not.toContain('Crying in the stairwell');
      expect(preview).not.toContain('221B Baker Street');
    }
  });

  it('hides the activity while private previews are on', () => {
    const privatePlan = planNotifications(update({ activity: 'Working' }), preferences(), NOW.getTime());
    expect(at(privatePlan, 0).body).not.toMatch(/working/i);
    const detailedPlan = planNotifications(update({ activity: 'Working' }), preferences({ notificationsPrivate: false }), NOW.getTime());
    expect(at(detailedPlan, 0).body).toMatch(/working/i);
  });

  it('schedules nothing when reminders are off or the update already expired', () => {
    expect(planNotifications(update(), preferences({ statusRemindersEnabled: false }), NOW.getTime())).toEqual([]);
    const wayLater = NOW.getTime() + 5 * 60 * 60_000;
    expect(planNotifications(update({ expiration: '2 hours' }), preferences(), wayLater)).toEqual([]);
  });
});
