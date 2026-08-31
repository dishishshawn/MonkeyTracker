import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { monkeyFurColors, monkeyFurFor, monkeySkinColors, monkeySkinFor } from '../ui/monkeyColorways';

interface MonkeyAppearancePickerProps {
  compact?: boolean;
  fur: string;
  onFurChange: (fur: string) => void;
  onSkinChange: (skin: string) => void;
  skin: string;
}

export function MonkeyAppearancePicker({ compact = false, fur, onFurChange, onSkinChange, skin }: MonkeyAppearancePickerProps) {
  return (
    <View style={styles.picker}>
      <ColorRow compact={compact} label="Fur" onChange={onFurChange} options={monkeyFurColors} value={fur} />
      <ColorRow compact={compact} label="Face" onChange={onSkinChange} options={monkeySkinColors} value={skin} />
    </View>
  );
}

function ColorRow({ compact, label, onChange, options, value }: { compact: boolean; label: 'Fur' | 'Face'; onChange: (color: string) => void; options: readonly { id: string; label: string }[]; value: string }) {
  const selected = label === 'Fur' ? monkeyFurFor(value) : monkeySkinFor(value);
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label} · <Text style={styles.selection}>{selected.label}</Text></Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Pressable
            accessibilityLabel={`Choose ${option.label} monkey ${label.toLowerCase()} color`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.id }}
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.choice, compact && styles.choiceCompact, value === option.id && styles.selected]}
          >
            <View style={[styles.swatch, { backgroundColor: option.id }]} />
            {label === 'Fur' && ['#77B9E8', '#F49ABB'].includes(option.id) && <Text style={styles.heart}>♥</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { gap: 13 },
  group: { gap: 7 },
  groupLabel: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '700', textAlign: 'center' },
  selection: { color: colors.ink, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  choice: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: colors.paper, padding: 3 },
  choiceCompact: { width: 34, height: 34, borderRadius: 17 },
  selected: { borderColor: colors.ink, transform: [{ scale: 1.08 }] },
  swatch: { flex: 1, borderRadius: 999 },
  heart: { position: 'absolute', alignSelf: 'center', top: 7, color: colors.white, fontSize: 15, fontWeight: '900', textShadowColor: 'rgba(66, 75, 96, 0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});
