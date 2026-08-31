import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { combinationState } from '../domain/combination';
import { placeLabel } from '../domain/updates';
import { colors, shadow } from '../theme';
import { MonkeyUpdate, Profile, TimelineEntry } from '../types';
import { formatRelativeAge, formatTimelineTime } from '../ui/format';
import { BottomNavigation } from '../components/BottomNavigation';
import { MonkeyAvatar } from '../components/MonkeyAvatar';
import { Mark } from '../illustration/Mark';
import { isDrowsyHour } from '../illustration/idleRules';
import { Stage } from '../illustration/Stage';
import { availabilityGlyph, decorGlyph, moodGlyph, precisionGlyph } from '../illustration/marks';

interface HomeScreenProps {
  profile: Profile;
  partner?: Profile;
  ownUpdate: MonkeyUpdate;
  update: MonkeyUpdate;
  ownExpired: boolean;
  expired: boolean;
  reaction: string | null;
  incomingCue: string | null;
  incomingKind: 'reaction' | 'poke' | null;
  incomingKey: string | null;
  timeline: TimelineEntry[];
  onReaction: (reaction: string) => void;
  onPoke: () => void;
  onOpenPrivacy: () => void;
  onOpenComposer: () => void;
  onOpenHistory: () => void;
}

export function HomeScreen({ profile, partner, ownUpdate, update, ownExpired, expired, reaction, incomingCue, incomingKind, incomingKey, timeline, onReaction, onPoke, onOpenPrivacy, onOpenComposer, onOpenHistory }: HomeScreenProps) {
  const latest = timeline[0];
  const partnerAccent = partner?.accent ?? '#7C5540';
  const partnerSkin = partner?.skin;
  const partnerName = partner?.name || 'Your monkey';
  const partnerPossessive = partnerName.endsWith('s') ? `${partnerName}’ little world` : `${partnerName}’s little world`;
  // Own clock only — see the note in idleRules.ts. The partner's monkey gets
  // idle motion but never settles, because we do not know their night yet.
  const ownDrowsy = isDrowsyHour(new Date().getHours());
  // Emergent only: never announced, never named in copy, never suggested.
  const combo = combinationState(ownUpdate, update, ownExpired, expired);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>THE TREEHOUSE</Text><Text style={styles.logo}>Monkey Tracker</Text></View>
          <Pressable accessibilityLabel="Open privacy controls" onPress={onOpenPrivacy} style={styles.iconButton}><Text style={styles.iconButtonText}>◉</Text></Pressable>
        </View>
        <View style={styles.greetingRow}><View style={styles.onlineDot} /><Text style={styles.greeting}>Both monkeys accounted for</Text></View>
        <View style={styles.stage}>
          <View style={styles.stageHalves}>
            <View style={styles.stageHalf}><Stage scene={ownUpdate.scene} side="left" unknown={ownExpired} /></View>
            <View style={styles.stageHalf}><Stage scene={update.scene} props={!combo.sharedScene} side="right" unknown={expired} /></View>
          </View>
          {!expired && update.roomDecor !== 'None' && (
            <View style={styles.roomDecor}><Mark glyph={decorGlyph[update.roomDecor]} color={colors.mossDark} size={22} /></View>
          )}
          <View style={styles.stagePeople}>
            <View style={[styles.monkeySlot, combo.sharedActivity && styles.monkeySlotTogetherLeft]}>{incomingCue && <InteractionBurst cue={incomingCue} kind={incomingKind} />}<MonkeyAvatar accessory={ownUpdate.accessory} activity={ownUpdate.activity} accent={profile.accent} animation={incomingKind ?? undefined} animationKey={incomingKey ?? undefined} drowsy={ownDrowsy} mood={ownUpdate.mood} pose={ownUpdate.pose} skin={profile.skin} unknown={ownExpired} /><Text style={styles.monkeyName}>{profile.name}</Text><Text style={styles.monkeyMeta}>{ownExpired ? 'Status unknown' : `${ownUpdate.activity} · ${ownUpdate.mood.toLowerCase()}`}</Text></View>
            <View style={[styles.monkeySlot, combo.sharedActivity && styles.monkeySlotTogetherRight]}><MonkeyAvatar accessory={update.accessory} activity={update.activity} accent={partnerAccent} mood={update.mood} pose={update.pose} skin={partnerSkin} unknown={expired} /><Text style={styles.monkeyName}>{partnerName}</Text><Text style={styles.monkeyMeta}>{expired ? 'Status unknown' : `${update.activity} · ${update.mood.toLowerCase()}`}</Text></View>
          </View>
        </View>
        <View style={styles.partnerCard}>
          <View style={styles.cardTopline}>
            <View style={styles.identity}><MonkeyAvatar activity={update.activity} accent={partnerAccent} mood={update.mood} size="small" skin={partnerSkin} unknown={expired} /><View><Text style={styles.cardName}>{partnerPossessive}</Text><Text style={styles.timestamp}>{expired ? 'No current update' : `${formatRelativeAge(update.updatedAt)} · manual`}</Text></View></View>
            <View style={styles.precisionBadge}>{!expired && <Mark glyph={precisionGlyph[update.locationLevel]} color={colors.mossDark} size={14} />}<Text style={styles.precisionText}>{expired ? 'Expired' : update.locationLevel}</Text></View>
          </View>
          <Text style={styles.place}>{expired ? 'Current status unknown' : placeLabel(update)}</Text>
          <Text style={styles.caption}>{expired ? 'This update expired and is no longer presented as current.' : update.caption || `${update.activity}, no further monkey business reported.`}</Text>
          {!expired && update.photoUri && <View style={styles.postcard}><Image source={{ uri: update.photoUri }} style={styles.postcardPhoto} /><Text style={styles.postcardLabel}>A tiny postcard from {partnerName}</Text></View>}
          <View style={styles.detailsRow}>
            <View style={styles.detailPill}>{!expired && <Mark glyph={moodGlyph[update.mood]} color={colors.ink} size={15} />}<Text style={styles.detailPillText}>{expired ? 'Unknown' : update.mood}</Text></View>
            <View style={styles.detailPill}>{!expired && <Mark glyph={availabilityGlyph[update.availability]} color={colors.ink} size={15} />}<Text style={styles.detailPillText}>{expired ? 'Unknown' : update.availability}</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.reactions}>
            {['♡', '🍌', '🫡', '😭'].map((item) => <Pressable accessibilityLabel={`React ${item}`} key={item} onPress={() => onReaction(item)} style={[styles.reactionButton, reaction === item && styles.reactionSelected]}><Text style={styles.reactionText}>{item}</Text></Pressable>)}
            <Pressable onPress={onPoke} style={styles.pokeButton}><Text style={styles.pokeText}>Poke</Text></Pressable>
          </View>
        </View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Today’s monkey business</Text><Pressable onPress={onOpenHistory}><Text style={styles.sectionLink}>See all</Text></Pressable></View>
        {latest ? (
          <Pressable accessibilityRole="button" onPress={onOpenHistory} style={styles.timelineCard}>
            <View style={[styles.timelineIcon, { backgroundColor: colors.lilac }]}><Mark glyph={moodGlyph[latest.update.mood]} color={colors.ink} size={20} /></View>
            <View style={styles.timelineCopy}><Text style={styles.timelineTitle}>{latest.update.activity} · {latest.update.mood}</Text><Text style={styles.timelineMeta}>{formatTimelineTime(latest.createdAt)} · {latest.mine ? 'you' : partnerName}</Text></View>
            <Text style={styles.timelineHeart}>{latest.saved ? '♥' : '♡'}</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={onOpenComposer} style={styles.emptyTimeline}><Text style={styles.emptyTitle}>No monkey business saved yet</Text><Text style={styles.emptyBody}>Updates from either of you will appear here.</Text></Pressable>
        )}
      </ScrollView>
      <BottomNavigation active="home" onHome={() => undefined} onUpdate={onOpenComposer} onHistory={onOpenHistory} />
    </SafeAreaView>
  );
}

function InteractionBurst({ cue, kind }: { cue: string; kind: 'reaction' | 'poke' | null }) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(lift, { toValue: -8, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [cue, lift, scale]);
  return <Animated.View style={[styles.reactionBubble, { transform: [{ translateY: lift }, { scale }] }]}><Text style={styles.reactionBubbleText}>{cue}</Text>{kind === 'reaction' && <><Text style={styles.sparkOne}>{cue}</Text><Text style={styles.sparkTwo}>{cue}</Text></>}</Animated.View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, page: { padding: 20, paddingBottom: 128, width: '100%', maxWidth: 430, alignSelf: 'center' }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { fontSize: 10, letterSpacing: 2.3, color: colors.moss, fontWeight: '800' }, logo: { fontSize: 26, lineHeight: 33, color: colors.ink, fontWeight: '800', letterSpacing: -0.8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, iconButtonText: { color: colors.moss, fontSize: 20 }, greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 12 }, onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.moss, marginRight: 7 }, greeting: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  stage: { aspectRatio: 360 / 216, borderRadius: 28, overflow: 'hidden', paddingHorizontal: 15, ...shadow }, stageHalves: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }, stageHalf: { flex: 1 }, stagePeople: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 18, justifyContent: 'space-around' }, monkeySlot: { width: '48%', alignItems: 'center' }, monkeySlotTogetherLeft: { transform: [{ translateX: 16 }] }, monkeySlotTogetherRight: { transform: [{ translateX: -16 }] }, monkeyName: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 5 }, monkeyMeta: { fontSize: 11, fontWeight: '600', color: colors.muted, marginTop: 2 }, reactionBubble: { position: 'absolute', zIndex: 8, right: 4, top: 45, backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18 }, reactionBubbleText: { fontSize: 22, fontWeight: '800' }, sparkOne: { position: 'absolute', fontSize: 15, top: -16, left: -9 }, sparkTwo: { position: 'absolute', fontSize: 13, top: -8, right: -13 }, roomDecor: { position: 'absolute', left: 21, top: 18 },
  partnerCard: { marginTop: 16, padding: 17, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow }, cardTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, identity: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 }, cardName: { fontSize: 16, color: colors.ink, fontWeight: '800' }, timestamp: { marginTop: 3, color: colors.muted, fontSize: 11 }, precisionBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.lime }, precisionText: { color: colors.mossDark, fontSize: 11, fontWeight: '800' }, place: { marginTop: 14, fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 }, caption: { marginTop: 5, color: colors.muted, fontSize: 15, lineHeight: 21 }, detailsRow: { flexDirection: 'row', gap: 8, marginTop: 14 }, detailPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.paper, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 }, detailPillText: { color: colors.ink, fontSize: 12, fontWeight: '700' }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 }, reactions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, reactionButton: { width: 37, height: 37, borderRadius: 18.5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, reactionSelected: { backgroundColor: colors.peach }, reactionText: { fontSize: 18 }, pokeButton: { marginLeft: 'auto', paddingVertical: 9, paddingHorizontal: 16, backgroundColor: colors.ink, borderRadius: 999 }, pokeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  postcard: { marginTop: 14, backgroundColor: colors.paper, padding: 9, paddingBottom: 13, borderRadius: 8, transform: [{ rotate: '-1deg' }] }, postcardPhoto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 5 }, postcardLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 11 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, sectionLink: { color: colors.moss, fontSize: 12, fontWeight: '800' }, timelineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: colors.line }, timelineIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, timelineCopy: { flex: 1, marginLeft: 11 }, timelineTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, timelineMeta: { color: colors.muted, fontSize: 10, marginTop: 3 }, timelineHeart: { fontSize: 21, color: colors.muted }, emptyTimeline: { backgroundColor: colors.card, padding: 18, borderRadius: 17, borderWidth: 1, borderColor: colors.line }, emptyTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, emptyBody: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
