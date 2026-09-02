import { Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Accessory, Activity, Mood, Pose } from '../types';
import { defaultSkinForAccent, monkeyFurFor, monkeySkinFor } from '../ui/monkeyColorways';
import { Monkey } from '../illustration/Monkey';
import { colors } from '../theme';
import { useIdleLife } from '../illustration/useIdleLife';

interface MonkeyAvatarProps {
  activity: Activity;
  accent: string;
  skin?: string;
  size?: 'small' | 'large';
  pose?: Pose;
  accessory?: Accessory;
  mood?: Mood;
  /** Expired status. The figure keeps its full ink line; only the color empties. */
  unknown?: boolean;
  /** Late in this person's own local day. Only set for someone whose clock we know. */
  drowsy?: boolean;
  animation?: 'reaction' | 'poke';
  animationKey?: string;
}

export function MonkeyAvatar({ activity, accent, skin, size = 'large', pose = 'Auto', accessory = 'None', mood, unknown, drowsy, animation, animationKey }: MonkeyAvatarProps) {
  const compact = size === 'small';
  const fur = monkeyFurFor(accent);
  const face = monkeySkinFor(skin ?? defaultSkinForAccent(accent));
  const nudge = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const { breath, blinking } = useIdleLife({ unknown, drowsy });
  const spin = useRef(new Animated.Value(0)).current;
  // Breathing rides the same native-driver transform as the poke and reaction
  // animations, so idle motion never re-renders the SVG underneath it.
  const breathLift = breath.interpolate({ inputRange: [0, 1], outputRange: [0, unknown ? -1 : -1.6] });
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.008] });

  // The pending ring only turns while the status is unknown, so a known monkey
  // runs no timer at all.
  useEffect(() => {
    if (!unknown) return;
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, unknown]);

  useEffect(() => {
    if (!animation || !animationKey) return;
    if (animation === 'poke') {
      Animated.sequence([
        Animated.timing(nudge, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(nudge, { toValue: 8, duration: 100, useNativeDriver: true }),
        Animated.timing(nudge, { toValue: -5, duration: 90, useNativeDriver: true }),
        Animated.spring(nudge, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 150, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [animation, animationKey, bounce, nudge]);

  return (
    <Animated.View
      accessibilityLabel={unknown ? 'Monkey avatar, status unknown' : `Monkey avatar ${activity.toLowerCase()}`}
      style={[styles.wrap, compact && styles.wrapSmall, { transform: [{ translateX: nudge }, { translateY: Animated.add(bounce, breathLift) }, { scale: breathScale }] }]}
    >
      <Monkey
        accessory={accessory}
        activity={activity}
        blink={blinking}
        crop={compact ? 'bust' : 'full'}
        fur={fur.id}
        ground={!compact}
        mood={mood}
        pose={pose}
        skin={face.id}
        unknown={unknown}
      />
      {unknown && (
        <Animated.View
          style={[styles.pending, compact && styles.pendingSmall, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}
        >
          <Svg viewBox="0 0 16 16" width="100%" height="100%">
            <Circle cx={8} cy={8} r={6} fill="none" stroke={colors.line} strokeWidth={2.2} />
            <Circle cx={8} cy={8} r={6} fill="none" stroke={colors.moss} strokeWidth={2.2} strokeLinecap="round" strokeDasharray={`${RING * 0.28} ${RING}`} />
          </Svg>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const RING = 2 * Math.PI * 6;

const styles = StyleSheet.create({
  wrap: { width: 124, height: 126, alignItems: 'center', justifyContent: 'center' },
  wrapSmall: { width: 54, height: 54 },
  pending: { position: 'absolute', top: 2, width: 18, height: 18, pointerEvents: 'none' },
  pendingSmall: { top: 0, width: 12, height: 12 },
});
