import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomNavigation } from '../components/BottomNavigation';
import { colors, shadow } from '../theme';
import { TimelineEntry } from '../types';
import { formatTimelineTime } from '../ui/format';
import { Mark } from '../illustration/Mark';
import { moodGlyph } from '../illustration/marks';

interface HistoryScreenProps {
  timeline: TimelineEntry[];
  partnerName: string;
  onHome: () => void;
  onOpenComposer: () => void;
  onDelete: (id: string) => void;
  onToggleSaved: (id: string) => void;
}

export function HistoryScreen({ timeline, partnerName, onHome, onOpenComposer, onDelete, onToggleSaved }: HistoryScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>PRIVATE TO YOUR TROOP</Text><Text style={styles.title}>Monkey Business</Text></View><Text style={styles.count}>{timeline.length}</Text></View>
        <Text style={styles.intro}>Both of your updates live here for 30 days unless the person who posted one deletes it sooner. Saving marks a favorite; it does not extend retention yet.</Text>
        {timeline.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyEmoji}>🌿</Text><Text style={styles.emptyTitle}>No recent monkey business</Text><Text style={styles.emptyBody}>Updates from either of you will land here.</Text><Pressable onPress={onOpenComposer} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Post an update</Text></Pressable></View>
        ) : timeline.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardTop}><View style={styles.icon}><Mark glyph={moodGlyph[entry.update.mood]} color={colors.ink} size={22} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>{entry.update.activity} · {entry.update.mood}</Text><Text style={styles.meta}>{formatTimelineTime(entry.createdAt)} · {entry.mine ? 'you' : partnerName} · {entry.update.availability}</Text></View><Pressable accessibilityLabel={entry.saved ? 'Remove from saved moments' : 'Save this moment'} onPress={() => onToggleSaved(entry.id)} style={styles.save}><Text style={styles.saveText}>{entry.saved ? '♥' : '♡'}</Text></Pressable></View>
            {!!entry.update.caption && <Text style={styles.caption}>{entry.update.caption}</Text>}
            <View style={styles.tags}><Text style={styles.tag}>{entry.update.locationLevel}</Text><Text style={styles.tag}>{entry.update.scene}</Text><Text style={styles.tag}>Expires {entry.update.expiration}</Text></View>
            {entry.mine && <Pressable accessibilityRole="button" onPress={() => Alert.alert('Delete this update?', 'It will be removed from local history on this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) }])} style={styles.deleteButton}><Text style={styles.deleteText}>Delete my update</Text></Pressable>}
          </View>
        ))}
      </ScrollView>
      <BottomNavigation active="history" onHome={onHome} onUpdate={onOpenComposer} onHistory={() => undefined} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, page: { padding: 20, paddingBottom: 128 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, eyebrow: { fontSize: 10, letterSpacing: 2.1, color: colors.moss, fontWeight: '900' }, title: { color: colors.ink, fontSize: 29, lineHeight: 36, fontWeight: '900', letterSpacing: -0.8 }, count: { minWidth: 38, textAlign: 'center', color: colors.mossDark, backgroundColor: colors.lime, borderRadius: 19, overflow: 'hidden', paddingVertical: 9, fontWeight: '900' },
  intro: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 12, marginBottom: 22 }, empty: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.line, padding: 30, marginTop: 18 }, emptyEmoji: { fontSize: 48 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 12 }, emptyBody: { color: colors.muted, fontSize: 13, marginTop: 5 }, emptyButton: { backgroundColor: colors.mossDark, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, marginTop: 20 }, emptyButtonText: { color: colors.white, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 12, ...shadow }, cardTop: { flexDirection: 'row', alignItems: 'center' }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lilac, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 21 }, cardCopy: { flex: 1, marginLeft: 11 }, cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 10, marginTop: 3 }, save: { padding: 8 }, saveText: { color: colors.mossDark, fontSize: 24 }, caption: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 13 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 }, tag: { color: colors.muted, backgroundColor: colors.paper, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, fontSize: 9, fontWeight: '700', overflow: 'hidden' }, deleteButton: { alignSelf: 'flex-start', marginTop: 14, paddingVertical: 5 }, deleteText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
});
