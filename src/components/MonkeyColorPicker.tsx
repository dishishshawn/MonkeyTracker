import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { BLUE_PINK_COLORWAY, monkeyColorwayFor, monkeyColorways } from '../ui/monkeyColorways';

interface MonkeyColorPickerProps {
  compact?: boolean;
  onChange: (colorway: string) => void;
  value: string;
}

export function MonkeyColorPicker({ compact = false, onChange, value }: MonkeyColorPickerProps) {
  return (
    <View>
      <View style={styles.row}>
        {monkeyColorways.map((colorway) => (
          <Pressable
            accessibilityLabel={`Choose ${colorway.label} monkey colorway`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === colorway.id }}
            key={colorway.id}
            onPress={() => onChange(colorway.id)}
            style={[styles.choice, compact && styles.choiceCompact, value === colorway.id && styles.selected]}
          >
            <View style={styles.swatch}>
              <View style={[styles.swatchHalf, { backgroundColor: colorway.fur }]} />
              <View style={[styles.swatchHalf, { backgroundColor: colorway.id === BLUE_PINK_COLORWAY ? colorway.innerEar : colorway.fur }]} />
            </View>
            {colorway.id === BLUE_PINK_COLORWAY && <Text style={styles.heart}>♥</Text>}
          </Pressable>
        ))}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.label}>{monkeyColorwayFor(value).label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 11 },
  choice: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: colors.paper, padding: 3 },
  choiceCompact: { width: 38, height: 38, borderRadius: 19 },
  selected: { borderColor: colors.ink, transform: [{ scale: 1.08 }] },
  swatch: { flex: 1, flexDirection: 'row', borderRadius: 999, overflow: 'hidden' },
  swatchHalf: { flex: 1 },
  heart: { position: 'absolute', alignSelf: 'center', top: 8, color: colors.white, fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(66, 75, 96, 0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  label: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '800', textAlign: 'center', marginTop: 7 },
});
