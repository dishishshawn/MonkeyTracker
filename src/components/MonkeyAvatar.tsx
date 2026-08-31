import { Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { Accessory, Activity, Mood, Pose } from '../types';
import { defaultSkinForAccent, monkeyFurFor, monkeySkinFor } from '../ui/monkeyColorways';
import { Monkey } from '../illustration/Monkey';

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
  animation?: 'reaction' | 'poke';
  animationKey?: string;
}

export function MonkeyAvatar({ activity, accent, skin, size = 'large', pose = 'Auto', accessory = 'None', mood, unknown, animation, animationKey }: MonkeyAvatarProps) {
  const compact = size === 'small';
  const fur = monkeyFurFor(accent);
  const face = monkeySkinFor(skin ?? defaultSkinForAccent(accent));
  const nudge = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

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
      style={[styles.wrap, compact && styles.wrapSmall, { transform: [{ translateX: nudge }, { translateY: bounce }] }]}
    >
      <Monkey
        accessory={accessory}
        activity={activity}
        crop={compact ? 'bust' : 'full'}
        fur={fur.id}
        ground={!compact}
        mood={mood}
        pose={pose}
        skin={face.id}
        unknown={unknown}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 124, height: 126, alignItems: 'center', justifyContent: 'center' },
  wrapSmall: { width: 54, height: 54 },
});
