import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';

export function BottomNavigation({ active, onHome, onUpdate, onHistory }: { active: 'home' | 'history'; onHome: () => void; onUpdate: () => void; onHistory: () => void }) {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" onPress={onHome} style={styles.navItem}><Text style={styles.icon}>⌂</Text><Text style={active === 'home' ? styles.active : styles.text}>Home</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onUpdate} style={styles.updateButton}><Text style={styles.plus}>＋</Text><Text style={styles.updateText}>Update</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onHistory} style={styles.navItem}><Text style={styles.icon}>◷</Text><Text style={active === 'history' ? styles.active : styles.text}>History</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 89, paddingBottom: 18, backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  navItem: { width: 72, alignItems: 'center', gap: 3 }, icon: { fontSize: 22, color: colors.mossDark }, active: { fontSize: 10, color: colors.mossDark, fontWeight: '800' }, text: { fontSize: 10, color: colors.muted, fontWeight: '700' },
  updateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mossDark, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 21, gap: 5, marginTop: -23, ...shadow }, plus: { color: colors.white, fontSize: 20 }, updateText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
