import { useState } from 'react';
import Slider from '@react-native-community/slider';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activities, availabilities, expirationOptionsFor, locationLevels, moods, poses, scenes } from '../domain/updates';
import { colors } from '../theme';
import { Activity, Availability, LocationLevel, MonkeyUpdate, Mood, Pose, Scene } from '../types';
import { sceneColors } from '../ui/scenes';
import { Chip } from './Chip';
import { MonkeyAvatar } from './MonkeyAvatar';

interface ComposerProps {
  accent: string;
  skin: string;
  draft: MonkeyUpdate;
  locationEnabled: boolean;
  open: boolean;
  onChange: (update: MonkeyUpdate) => void;
  onClose: () => void;
  onPublish: () => void;
}

export function ComposerModal({ accent, skin, draft, locationEnabled, open, onChange, onClose, onPublish }: ComposerProps) {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const set = <K extends keyof MonkeyUpdate>(key: K, value: MonkeyUpdate[K]) => onChange({ ...draft, [key]: value });
  const availableExpirations = expirationOptionsFor(draft.locationLevel);
  const expirationIndex = Math.max(0, availableExpirations.findIndex((item) => item.label === draft.expiration));

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={onClose}><Text style={styles.cancel}>Cancel</Text></Pressable>
            <Text style={styles.title}>Set your scene</Text>
            <View style={styles.headerSpacer} />
          </View>
          <ScrollView contentContainerStyle={styles.composer} keyboardShouldPersistTaps="handled">
            <View style={[styles.preview, { backgroundColor: sceneColors[draft.scene] }]}>
              <MonkeyAvatar activity={draft.activity} accent={accent} pose={draft.pose} skin={skin} />
              <Text style={styles.previewText}>{draft.activity} · feeling {draft.mood.toLowerCase()}</Text>
              <Text style={styles.previewDetail}>{draft.scene} · {draft.pose}</Text>
            </View>
            <Picker horizontal label="What are you up to?" items={activities} value={draft.activity} onChange={(value) => set('activity', value as Activity)} />
            <Picker horizontal label="Current flavor" items={moods} value={draft.mood} onChange={(value) => set('mood', value as Mood)} />
            <Picker label="Can they reach you?" items={availabilities} value={draft.availability} onChange={(value) => set('availability', value as Availability)} />
            <Text style={styles.fieldLabel}>Add context (optional)</Text>
            <TextInput accessibilityLabel="Update caption" maxLength={140} multiline onChangeText={(text) => set('caption', text)} placeholder="Narrate the monkey business…" placeholderTextColor={colors.muted} style={styles.input} value={draft.caption} />
            <Picker label="Location precision" items={locationEnabled ? locationLevels : ['Hidden']} value={draft.locationLevel} onChange={(value) => {
              const locationLevel = value as LocationLevel;
              onChange({ ...draft, locationLevel, ...(locationLevel === 'Trail' && !['15 min', '30 min', '1 hour'].includes(draft.expiration) ? { expiration: '1 hour' as const } : {}) });
            }} />
            {!locationEnabled && <View style={styles.warning}><Text style={styles.warningText}>Global location sharing is off. You can still share activity, mood, and availability.</Text></View>}
            {draft.locationLevel !== 'Hidden' && <TextInput accessibilityLabel="Place name" onChangeText={(text) => set('place', text)} placeholder="Name this place" placeholderTextColor={colors.muted} style={styles.singleInput} value={draft.place} />}
            {draft.locationLevel === 'Trail' && <View style={styles.warning}><Text style={styles.warningText}>Trail shares precise live location and ends automatically. You can stop it at any time.</Text></View>}
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: extrasOpen }} onPress={() => setExtrasOpen((value) => !value)} style={styles.extrasToggle}>
              <View><Text style={styles.extrasTitle}>Scene extras</Text><Text style={styles.extrasSummary}>{draft.scene} · {draft.pose}</Text></View>
              <Text style={styles.extrasChevron}>{extrasOpen ? '−' : '+'}</Text>
            </Pressable>
            {extrasOpen && (
              <View style={styles.extrasPanel}>
                <Picker horizontal label="Set the room" items={scenes} value={draft.scene} onChange={(value) => set('scene', value as Scene)} />
                <Picker horizontal label="Monkey pose" items={poses} value={draft.pose} onChange={(value) => set('pose', value as Pose)} />
              </View>
            )}
            <View style={styles.expirationCard}>
              <View style={styles.expirationHeading}><Text style={styles.fieldLabel}>Status expires</Text><Text style={styles.expirationValue}>{draft.expiration}</Text></View>
              <Slider accessibilityLabel={`Status expires in ${draft.expiration}`} minimumValue={0} maximumValue={availableExpirations.length - 1} minimumTrackTintColor={colors.mossDark} maximumTrackTintColor={colors.line} step={1} thumbTintColor={colors.mossDark} value={expirationIndex} onValueChange={(value) => set('expiration', availableExpirations[Math.round(value)]?.label ?? '1 hour')} />
              <View style={styles.expirationScale}><Text style={styles.expirationEnd}>15m</Text><Text style={styles.expirationEnd}>{draft.locationLevel === 'Trail' ? '1 hour max' : 'End of day'}</Text></View>
              <Text style={styles.expirationNote}>We’ll notify you when it expires, then show your status as unknown.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onPublish} style={styles.publishButton}><Text style={styles.publishText}>Publish monkey update</Text></Pressable>
            <Text style={styles.publishNote}>Your partner will see this update. It expires in {draft.expiration.toLowerCase()}.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Picker({ label, items, value, onChange, horizontal = false }: { label: string; items: readonly string[]; value: string; onChange: (value: string) => void; horizontal?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {horizontal ? (
        <ScrollView horizontal contentContainerStyle={styles.horizontalChips} showsHorizontalScrollIndicator={false}>
          {items.map((item) => <Chip key={item} label={item} selected={item === value} onPress={() => onChange(item)} />)}
        </ScrollView>
      ) : (
        <View style={styles.chips}>{items.map((item) => <Chip key={item} label={item} selected={item === value} onPress={() => onChange(item)} />)}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.paper },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 17, fontWeight: '800' }, cancel: { color: colors.muted, fontSize: 15 }, headerSpacer: { width: 44 },
  composer: { padding: 20, paddingBottom: 50 }, preview: { height: 182, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  previewText: { color: colors.mossDark, fontSize: 13, fontWeight: '800' }, previewDetail: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 4 },
  field: { marginBottom: 23 }, fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 10 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, horizontalChips: { gap: 8, paddingRight: 14 },
  input: { minHeight: 90, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.card, padding: 14, textAlignVertical: 'top', color: colors.ink, fontSize: 15, marginBottom: 23 },
  singleInput: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.card, padding: 14, color: colors.ink, fontSize: 15, marginTop: -13, marginBottom: 23 },
  warning: { backgroundColor: '#FFF0D1', borderRadius: 13, padding: 12, marginTop: -13, marginBottom: 23 }, warningText: { color: '#74572B', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  extrasToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 15, marginBottom: 18 },
  extrasTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, extrasSummary: { color: colors.muted, fontSize: 11, marginTop: 4 }, extrasChevron: { color: colors.mossDark, fontSize: 24, fontWeight: '500' },
  extrasPanel: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 16, padding: 14, paddingBottom: 0, marginTop: -10, marginBottom: 18 },
  expirationCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 16, marginBottom: 18 }, expirationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expirationValue: { color: colors.mossDark, fontSize: 13, fontWeight: '900', backgroundColor: colors.lime, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, overflow: 'hidden' },
  expirationScale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 }, expirationEnd: { color: colors.muted, fontSize: 9, fontWeight: '700' }, expirationNote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 },
  publishButton: { backgroundColor: colors.mossDark, borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 6 }, publishText: { color: colors.white, fontSize: 15, fontWeight: '800' }, publishNote: { textAlign: 'center', color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 10 },
});
