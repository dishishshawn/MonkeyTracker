import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing } from 'react-native';

/**
 * Idle life: small continuous motion driven only by inputs that change without
 * anyone acting. See PRD-NEXT.txt section 3.
 *
 * Two rules from that section are load-bearing here:
 *
 * - Nothing may be contingent on posting frequency, recency of the viewer's own
 *   activity, or anything a user could increase by opening the app more. An
 *   avatar that gets livelier the more you post is a streak with fur on it.
 * - Animation runs only while the app is foregrounded (3.7). This is the main
 *   always-on cost in the product, and the closest prior art in the category
 *   reported battery drain worse than TikTok.
 */

interface IdleOptions {
  /** Expired status. Motion slows; the figure stays on the blank-page treatment. */
  unknown?: boolean;
  /** Late in this person's own local day. Only ever set for someone whose clock we actually know. */
  drowsy?: boolean;
}

export interface IdleLife {
  /** 0..1 breathing cycle. Native-driver only — never triggers an SVG re-render. */
  breath: Animated.Value;
  blinking: boolean;
}

const BREATH_CYCLE_MS = { normal: 3600, drowsy: 4600, unknown: 5200 };
const BLINK_CLOSED_MS = { normal: 120, drowsy: 220 };

export function useIdleLife({ unknown = false, drowsy = false }: IdleOptions = {}): IdleLife {
  const breath = useRef(new Animated.Value(0)).current;
  const [blinking, setBlinking] = useState(false);
  // Both gates fail open. Motion is the default state; only a positive signal
  // suppresses it. 'inactive' is a transitional iOS state and 'unknown' means
  // the platform did not say, so neither should freeze the stage.
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => setForeground(next !== 'background'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Reduce-motion support varies by platform; a missing or throwing
    // implementation must not be read as "the user asked for stillness".
    try {
      void AccessibilityInfo.isReduceMotionEnabled()
        .then((reduce) => { if (!cancelled) setMotionAllowed(!reduce); })
        .catch(() => undefined);
    } catch {
      // keep the default
    }
    let subscription: { remove: () => void } | undefined;
    try {
      subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduce) => setMotionAllowed(!reduce));
    } catch {
      subscription = undefined;
    }
    return () => { cancelled = true; subscription?.remove?.(); };
  }, []);

  const active = foreground && motionAllowed;

  useEffect(() => {
    if (!active) {
      breath.stopAnimation();
      breath.setValue(0);
      return;
    }
    const cycle = unknown ? BREATH_CYCLE_MS.unknown : drowsy ? BREATH_CYCLE_MS.drowsy : BREATH_CYCLE_MS.normal;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: cycle / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: cycle / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, breath, drowsy, unknown]);

  useEffect(() => {
    if (!active) {
      setBlinking(false);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const closedFor = drowsy ? BLINK_CLOSED_MS.drowsy : BLINK_CLOSED_MS.normal;
    const schedule = () => {
      // Randomised so two monkeys on one stage never blink in lockstep.
      const gap = 2600 + Math.random() * 4200 + (unknown ? 2200 : 0);
      timer = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        timer = setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          schedule();
        }, closedFor);
      }, gap);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [active, drowsy, unknown]);

  return { breath, blinking: blinking && active };
}
