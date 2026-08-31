import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../theme';
import { Accessory, Activity, Pose } from '../types';
import { defaultSkinForAccent, monkeyFurFor, monkeySkinFor } from '../ui/monkeyColorways';

const props: Record<Activity, string> = {
  Studying: '📚',
  Working: '💻',
  Eating: '🍜',
  Chilling: '🎧',
  Sleeping: '💤',
  Commuting: '🚌',
  'At the gym': '🏋️',
  Cooking: '🍳',
  Gaming: '🎮',
  'Out & about': '✨',
};

interface MonkeyAvatarProps {
  activity: Activity;
  accent: string;
  skin?: string;
  size?: 'small' | 'large';
  pose?: Pose;
  accessory?: Accessory;
  animation?: 'reaction' | 'poke';
  animationKey?: string;
}

const poseMarks: Record<Pose, string> = {
  Auto: '',
  Waving: '👋',
  'Locked in': '😤',
  Flopped: '🫠',
  Victory: '🏆',
};

const accessoryMarks: Record<Accessory, string> = {
  None: '',
  Glasses: '👓',
  Beanie: '🧢',
  Crown: '👑',
  Flower: '🌸',
};

export function MonkeyAvatar({ activity, accent, skin, size = 'large', pose = 'Auto', accessory = 'None', animation, animationKey }: MonkeyAvatarProps) {
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
    <Animated.View accessibilityLabel={`Monkey avatar ${activity.toLowerCase()}`} style={[styles.wrap, compact && styles.wrapSmall, { transform: [{ translateX: nudge }, { translateY: bounce }] }]}>
      <View style={[styles.ear, styles.leftEar, { backgroundColor: fur.id }]}><View style={[styles.innerEar, { backgroundColor: face.id }]} /></View>
      <View style={[styles.ear, styles.rightEar, { backgroundColor: fur.id }]}><View style={[styles.innerEar, { backgroundColor: face.id }]} /></View>
      <View style={[styles.head, { backgroundColor: fur.id }]}>
        <View style={[styles.face, { backgroundColor: face.id }]}>
          {face.cheek && <><View style={[styles.cheek, styles.leftCheek, compact && styles.cheekSmall, { backgroundColor: face.cheek }]} /><View style={[styles.cheek, styles.rightCheek, compact && styles.cheekSmall, { backgroundColor: face.cheek }]} /></>}
          <Text style={[styles.eyes, compact && styles.eyesSmall]}>•  •</Text>
          <Text style={[styles.mouth, compact && styles.mouthSmall]}>ᴗ</Text>
        </View>
      </View>
      {!compact && <Text style={styles.prop}>{props[activity]}</Text>}
      {!compact && pose !== 'Auto' && <Text style={styles.pose}>{poseMarks[pose]}</Text>}
      {!compact && accessory !== 'None' && <Text style={styles.accessory}>{accessoryMarks[accessory]}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 124, height: 126, alignItems: 'center', justifyContent: 'center' },
  wrapSmall: { width: 54, height: 54 },
  head: { width: '76%', aspectRatio: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  ear: { position: 'absolute', width: '32%', aspectRatio: 1, borderRadius: 999, top: '20%' },
  innerEar: { width: '56%', height: '56%', borderRadius: 999, alignSelf: 'center', marginTop: '22%' },
  leftEar: { left: 0 },
  rightEar: { right: 0 },
  face: { width: '70%', height: '62%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  cheek: { position: 'absolute', width: 11, height: 7, borderRadius: 999, top: '56%', opacity: 0.72 },
  cheekSmall: { width: 5, height: 3 },
  leftCheek: { left: '12%' },
  rightCheek: { right: '12%' },
  eyes: { color: colors.ink, fontSize: 25, lineHeight: 28, letterSpacing: 3 },
  eyesSmall: { fontSize: 13, lineHeight: 14 },
  mouth: { color: colors.ink, fontSize: 24, lineHeight: 24, marginTop: -3 },
  mouthSmall: { fontSize: 13, lineHeight: 13 },
  prop: { position: 'absolute', zIndex: 3, right: -3, bottom: 2, fontSize: 35, transform: [{ rotate: '7deg' }] },
  pose: { position: 'absolute', zIndex: 4, left: -4, bottom: 4, fontSize: 30, transform: [{ rotate: '-8deg' }] },
  accessory: { position: 'absolute', zIndex: 5, top: -8, fontSize: 34 },
});
