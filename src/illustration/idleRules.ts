/**
 * Pure rules behind idle life. See PRD-NEXT.txt section 3.
 */

/**
 * Late enough in someone's own local day that their monkey settles.
 *
 * Only ever applied to a clock we actually know. Until partner timezone
 * sharing exists (PRD 4.4 Tier 1), that means the viewer's own monkey and
 * nobody else's: a partner's monkey settling on OUR clock would be a claim
 * about their night that we cannot substantiate, which is the same category
 * of lie as showing a stale status.
 */
export function isDrowsyHour(hour: number): boolean {
  return hour >= 22 || hour < 6;
}
