import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Activity } from '../types';

const props: Record<Activity, string> = {
  Studying: '📚',
  Working: '💻',
  Eating: '🍜',
  Chilling: '🎧',
  Sleeping: '💤',
};

interface MonkeyAvatarProps {
  activity: Activity;
  accent: string;
  size?: 'small' | 'large';
}

export function MonkeyAvatar({ activity, accent, size = 'large' }: MonkeyAvatarProps) {
  const compact = size === 'small';
  return (
    <View accessibilityLabel={`Monkey avatar ${activity.toLowerCase()}`} style={[styles.wrap, compact && styles.wrapSmall]}>
      <View style={[styles.ear, styles.leftEar, { backgroundColor: accent }]} />
      <View style={[styles.ear, styles.rightEar, { backgroundColor: accent }]} />
      <View style={[styles.head, { backgroundColor: accent }]}>
        <View style={styles.face}>
          <Text style={[styles.eyes, compact && styles.eyesSmall]}>•  •</Text>
          <Text style={[styles.mouth, compact && styles.mouthSmall]}>ᴗ</Text>
        </View>
      </View>
      {!compact && <Text style={styles.prop}>{props[activity]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 124, height: 126, alignItems: 'center', justifyContent: 'center' },
  wrapSmall: { width: 54, height: 54 },
  head: { width: '76%', aspectRatio: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  ear: { position: 'absolute', width: '32%', aspectRatio: 1, borderRadius: 999, top: '20%' },
  leftEar: { left: 0 },
  rightEar: { right: 0 },
  face: { width: '70%', height: '62%', borderRadius: 999, backgroundColor: '#EBC6A6', alignItems: 'center', justifyContent: 'center' },
  eyes: { color: colors.ink, fontSize: 25, lineHeight: 28, letterSpacing: 3 },
  eyesSmall: { fontSize: 13, lineHeight: 14 },
  mouth: { color: colors.ink, fontSize: 24, lineHeight: 24, marginTop: -3 },
  mouthSmall: { fontSize: 13, lineHeight: 13 },
  prop: { position: 'absolute', zIndex: 3, right: -3, bottom: 2, fontSize: 35, transform: [{ rotate: '7deg' }] },
});
