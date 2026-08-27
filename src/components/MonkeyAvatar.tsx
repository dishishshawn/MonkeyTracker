import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Activity, Pose } from '../types';
import { monkeyColorwayFor } from '../ui/monkeyColorways';

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
  size?: 'small' | 'large';
  pose?: Pose;
}

const poseMarks: Record<Pose, string> = {
  Auto: '',
  Waving: '👋',
  'Locked in': '😤',
  Flopped: '🫠',
  Victory: '🏆',
};

export function MonkeyAvatar({ activity, accent, size = 'large', pose = 'Auto' }: MonkeyAvatarProps) {
  const compact = size === 'small';
  const colorway = monkeyColorwayFor(accent);
  return (
    <View accessibilityLabel={`Monkey avatar ${activity.toLowerCase()}`} style={[styles.wrap, compact && styles.wrapSmall]}>
      <View style={[styles.ear, styles.leftEar, { backgroundColor: colorway.fur }]}><View style={[styles.innerEar, { backgroundColor: colorway.innerEar }]} /></View>
      <View style={[styles.ear, styles.rightEar, { backgroundColor: colorway.fur }]}><View style={[styles.innerEar, { backgroundColor: colorway.innerEar }]} /></View>
      <View style={[styles.head, { backgroundColor: colorway.fur }]}>
        <View style={[styles.face, { backgroundColor: colorway.face }]}>
          {colorway.cheek && <><View style={[styles.cheek, styles.leftCheek, compact && styles.cheekSmall, { backgroundColor: colorway.cheek }]} /><View style={[styles.cheek, styles.rightCheek, compact && styles.cheekSmall, { backgroundColor: colorway.cheek }]} /></>}
          <Text style={[styles.eyes, compact && styles.eyesSmall]}>•  •</Text>
          <Text style={[styles.mouth, compact && styles.mouthSmall]}>ᴗ</Text>
        </View>
      </View>
      {!compact && <Text style={styles.prop}>{props[activity]}</Text>}
      {!compact && pose !== 'Auto' && <Text style={styles.pose}>{poseMarks[pose]}</Text>}
    </View>
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
});
