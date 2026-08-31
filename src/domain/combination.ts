import { MonkeyUpdate } from '../types';

/**
 * Combination states: what the two panels do together. See PRD-NEXT.txt
 * section 5.
 *
 * Three rules from that section are load-bearing here:
 *
 * - 5.6 Emergent only. Nothing may hint that a particular pairing produces a
 *   particular result, or the mechanic becomes pressure to match.
 * - 5.7 A combination requires both statuses to be current. When one expires
 *   the combination ends immediately, because a pair state that outlives one
 *   of its participants implies presence the product knows is gone.
 * - 5.5 No state may dramatise absence. `bothUnknown` exists so the stage can
 *   be checked for quietness, never so it can look lonely.
 */
export interface CombinationState {
  /** Both chose the same scene: one continuous world rather than two pictures. */
  sharedScene: boolean;
  /** Both chose the same activity: they are doing it together. */
  sharedActivity: boolean;
  /** Neither status is current. The stage is quiet, and says nothing about it. */
  bothUnknown: boolean;
}

export function combinationState(
  own: MonkeyUpdate,
  partner: MonkeyUpdate,
  ownExpired: boolean,
  partnerExpired: boolean,
): CombinationState {
  const bothCurrent = !ownExpired && !partnerExpired;
  return {
    sharedScene: bothCurrent && own.scene === partner.scene,
    sharedActivity: bothCurrent && own.activity === partner.activity,
    bothUnknown: ownExpired && partnerExpired,
  };
}
