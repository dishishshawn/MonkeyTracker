import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { placeLabel } from '../domain/updates';
import { colors, shadow } from '../theme';
import { MonkeyUpdate, Profile, TimelineEntry } from '../types';
import { formatRelativeAge, formatTimelineTime } from '../ui/format';
import { sceneColors } from '../ui/scenes';
import { BottomNavigation } from '../components/BottomNavigation';
import { MonkeyAvatar } from '../components/MonkeyAvatar';

interface HomeScreenProps {
  profile: Profile;
  update: MonkeyUpdate;
  expired: boolean;
  reaction: string | null;
  timeline: TimelineEntry[];
  onReaction: (reaction: string) => void;
  onNotify: (message: string) => void;
  onOpenPrivacy: () => void;
  onOpenComposer: () => void;
  onOpenHistory: () => void;
}

export function HomeScreen({ profile, update, expired, reaction, timeline, onReaction, onNotify, onOpenPrivacy, onOpenComposer, onOpenHistory }: HomeScreenProps) {
  const latest = timeline[0];
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>THE TREEHOUSE</Text><Text style={styles.logo}>Monkey Tracker</Text></View>
          <Pressable accessibilityLabel="Open privacy controls" onPress={onOpenPrivacy} style={styles.iconButton}><Text style={styles.iconButtonText}>◉</Text></Pressable>
        </View>
        <View style={styles.greetingRow}><View style={styles.onlineDot} /><Text style={styles.greeting}>Both monkeys accounted for</Text></View>
        <View style={[styles.stage, { backgroundColor: sceneColors[update.scene] }]}>
          <View style={styles.sun} /><View style={styles.cloudOne} /><View style={styles.cloudTwo} /><View style={styles.branch} />
          <View style={styles.stagePeople}>
            <View style={styles.monkeySlot}><MonkeyAvatar activity="Chilling" accent={profile.accent} skin={profile.skin} /><Text style={styles.monkeyName}>{profile.name}</Text><Text style={styles.monkeyMeta}>Chilling · cozy</Text></View>
            <View style={styles.monkeySlot}>{reaction && <Text style={styles.reactionBubble}>{reaction}</Text>}<MonkeyAvatar activity={update.activity} accent="#7C5540" pose={update.pose} /><Text style={styles.monkeyName}>Your person</Text><Text style={styles.monkeyMeta}>{expired ? 'Status unknown' : `${update.activity} · ${update.mood.toLowerCase()}`}</Text></View>
          </View>
        </View>
        <View style={styles.partnerCard}>
          <View style={styles.cardTopline}>
            <View style={styles.identity}><MonkeyAvatar activity={update.activity} accent="#7C5540" size="small" /><View><Text style={styles.cardName}>Your person’s little world</Text><Text style={styles.timestamp}>{formatRelativeAge(update.updatedAt)} · manual</Text></View></View>
            <View style={styles.precisionBadge}><Text style={styles.precisionText}>{expired ? 'Expired' : update.locationLevel}</Text></View>
          </View>
          <Text style={styles.place}>{expired ? 'Current status unknown' : placeLabel(update)}</Text>
          <Text style={styles.caption}>{expired ? 'This update expired and is no longer presented as current.' : update.caption || `${update.activity}, no further monkey business reported.`}</Text>
          <View style={styles.detailsRow}><Text style={styles.detailPill}>☻ {expired ? 'Unknown' : update.mood}</Text><Text style={styles.detailPill}>◷ {expired ? 'Unknown' : update.availability}</Text></View>
          <View style={styles.divider} />
          <View style={styles.reactions}>
            {['♡', '🍌', '🫡', '😭'].map((item) => <Pressable accessibilityLabel={`React ${item}`} key={item} onPress={() => onReaction(item)} style={[styles.reactionButton, reaction === item && styles.reactionSelected]}><Text style={styles.reactionText}>{item}</Text></Pressable>)}
            <Pressable onPress={() => onNotify('Poke sent. Do not abuse your power.')} style={styles.pokeButton}><Text style={styles.pokeText}>Poke</Text></Pressable>
          </View>
        </View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Today’s monkey business</Text><Pressable onPress={onOpenHistory}><Text style={styles.sectionLink}>See all</Text></Pressable></View>
        {latest ? (
          <Pressable accessibilityRole="button" onPress={onOpenHistory} style={styles.timelineCard}>
            <View style={[styles.timelineIcon, { backgroundColor: colors.lilac }]}><Text>☕</Text></View>
            <View style={styles.timelineCopy}><Text style={styles.timelineTitle}>{latest.update.activity} · {latest.update.mood}</Text><Text style={styles.timelineMeta}>{formatTimelineTime(latest.createdAt)} · saved on this device</Text></View>
            <Text style={styles.timelineHeart}>{latest.saved ? '♥' : '♡'}</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={onOpenComposer} style={styles.emptyTimeline}><Text style={styles.emptyTitle}>No monkey business saved yet</Text><Text style={styles.emptyBody}>Your first published update will appear here.</Text></Pressable>
        )}
      </ScrollView>
      <BottomNavigation active="home" onHome={() => undefined} onUpdate={onOpenComposer} onHistory={onOpenHistory} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, page: { padding: 20, paddingBottom: 128 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { fontSize: 10, letterSpacing: 2.3, color: colors.moss, fontWeight: '800' }, logo: { fontSize: 26, lineHeight: 33, color: colors.ink, fontWeight: '800', letterSpacing: -0.8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, iconButtonText: { color: colors.moss, fontSize: 20 }, greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 12 }, onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.moss, marginRight: 7 }, greeting: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  stage: { height: 276, borderRadius: 28, overflow: 'hidden', paddingHorizontal: 15, ...shadow }, sun: { position: 'absolute', width: 62, height: 62, borderRadius: 31, top: 22, right: 26, backgroundColor: colors.yellow }, cloudOne: { position: 'absolute', width: 82, height: 22, borderRadius: 20, top: 53, left: 20, backgroundColor: 'rgba(255,255,255,0.55)' }, cloudTwo: { position: 'absolute', width: 45, height: 15, borderRadius: 20, top: 81, left: 51, backgroundColor: 'rgba(255,255,255,0.45)' }, branch: { position: 'absolute', width: '115%', height: 24, borderRadius: 20, backgroundColor: '#765039', bottom: 57, left: -18, transform: [{ rotate: '-2deg' }] }, stagePeople: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 18, justifyContent: 'space-around' }, monkeySlot: { width: '48%', alignItems: 'center' }, monkeyName: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 5 }, monkeyMeta: { fontSize: 11, fontWeight: '600', color: colors.muted, marginTop: 2 }, reactionBubble: { position: 'absolute', zIndex: 5, right: 4, top: 52, fontSize: 25, backgroundColor: colors.white, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 18, overflow: 'hidden' },
  partnerCard: { marginTop: 16, padding: 17, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow }, cardTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, identity: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 }, cardName: { fontSize: 16, color: colors.ink, fontWeight: '800' }, timestamp: { marginTop: 3, color: colors.muted, fontSize: 11 }, precisionBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.lime }, precisionText: { color: colors.mossDark, fontSize: 11, fontWeight: '800' }, place: { marginTop: 14, fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 }, caption: { marginTop: 5, color: colors.muted, fontSize: 15, lineHeight: 21 }, detailsRow: { flexDirection: 'row', gap: 8, marginTop: 14 }, detailPill: { color: colors.ink, fontSize: 12, fontWeight: '700', backgroundColor: colors.paper, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, overflow: 'hidden' }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 }, reactions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, reactionButton: { width: 37, height: 37, borderRadius: 18.5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, reactionSelected: { backgroundColor: colors.peach }, reactionText: { fontSize: 18 }, pokeButton: { marginLeft: 'auto', paddingVertical: 9, paddingHorizontal: 16, backgroundColor: colors.ink, borderRadius: 999 }, pokeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 11 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, sectionLink: { color: colors.moss, fontSize: 12, fontWeight: '800' }, timelineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: colors.line }, timelineIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, timelineCopy: { flex: 1, marginLeft: 11 }, timelineTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, timelineMeta: { color: colors.muted, fontSize: 10, marginTop: 3 }, timelineHeart: { fontSize: 21, color: colors.muted }, emptyTimeline: { backgroundColor: colors.card, padding: 18, borderRadius: 17, borderWidth: 1, borderColor: colors.line }, emptyTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, emptyBody: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
