import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: colors.card },
  selected: { backgroundColor: colors.mossDark, borderColor: colors.mossDark },
  pressed: { opacity: 0.75 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  selectedLabel: { color: colors.white },
});
