import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface PrivacyModalProps {
  open: boolean;
  locationEnabled: boolean;
  notificationsPrivate: boolean;
  onLocationChange: (value: boolean) => void;
  onNotificationsChange: (value: boolean) => void;
  onLeave: () => void;
  onClose: () => void;
}

export function PrivacyModal({ open, locationEnabled, notificationsPrivate, onLocationChange, onNotificationsChange, onLeave, onClose }: PrivacyModalProps) {
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><View style={styles.spacer} /><Text style={styles.headerTitle}>Privacy</Text><Pressable onPress={onClose}><Text style={styles.done}>Done</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.hero}><Text style={styles.emoji}>🙈</Text><Text style={styles.title}>You control the view</Text><Text style={styles.body}>Your partner can only see what you choose to share. They cannot change these settings.</Text></View>
          <View style={styles.settingsCard}>
            <SettingRow title="Location sharing" body={locationEnabled ? 'On — controlled per update' : 'Off everywhere'} value={locationEnabled} onChange={onLocationChange} />
            <View style={styles.divider} />
            <SettingRow title="Private notifications" body="Hide captions and places in previews" value={notificationsPrivate} onChange={onNotificationsChange} />
          </View>
          <View style={styles.visibilityCard}><Text style={styles.visibilityLabel}>WHAT YOUR PARTNER CAN SEE RIGHT NOW</Text><Text style={styles.visibilityValue}>{locationEnabled ? 'Your chosen precision, activity, mood, and availability' : 'Your activity, mood, and availability — no location'}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Leave this troop?', 'Your former partner will immediately lose access. Local history for this troop will be removed from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Leave troop', style: 'destructive', onPress: onLeave }])} style={styles.unpair}><Text style={styles.unpairText}>Block or leave this troop</Text></Pressable>
          <Text style={styles.safetyCopy}>Monkey Tracker is not an emergency service. Shared location may be delayed, inaccurate, or unavailable.</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SettingRow({ title, body, value, onChange }: { title: string; body: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingBody}>{body}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: colors.line, true: colors.moss }} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.line },
  spacer: { width: 44 }, headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, done: { color: colors.moss, fontWeight: '800', fontSize: 15 },
  page: { padding: 20, paddingBottom: 50 }, hero: { alignItems: 'center', padding: 20 }, emoji: { fontSize: 50 }, title: { color: colors.ink, fontSize: 23, fontWeight: '800', marginTop: 8 }, body: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7, maxWidth: 310 },
  settingsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 16, marginTop: 14 }, settingRow: { flexDirection: 'row', alignItems: 'center' }, settingCopy: { flex: 1, paddingRight: 12 }, settingTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, settingBody: { color: colors.muted, fontSize: 11, marginTop: 4 }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 16 },
  visibilityCard: { backgroundColor: colors.lime, borderRadius: 18, padding: 17, marginTop: 15 }, visibilityLabel: { color: colors.mossDark, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, visibilityValue: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '700', marginTop: 7 },
  unpair: { alignItems: 'center', marginTop: 28, padding: 13 }, unpairText: { color: colors.danger, fontSize: 13, fontWeight: '800' }, safetyCopy: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 15, paddingHorizontal: 20 },
});
