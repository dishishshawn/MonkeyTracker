import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';
import { Chip } from './src/components/Chip';
import { MonkeyAvatar } from './src/components/MonkeyAvatar';
import { colors, shadow } from './src/theme';
import {
  Activity,
  Availability,
  Expiration,
  LocationLevel,
  MonkeyUpdate,
  Mood,
  Pose,
  Scene,
} from './src/types';

const activities: Activity[] = ['Studying', 'Working', 'Eating', 'Chilling', 'Sleeping', 'Commuting', 'At the gym', 'Cooking', 'Gaming', 'Out & about'];
const moods: Mood[] = ['Crispy', 'Cozy', 'Focused', 'Wobbly', 'Happy', 'Tender', 'Sleepy', 'Frazzled', 'Social', 'Quiet'];
const availabilities: Availability[] = ['Free', 'Text only', 'Busy', 'Asleep'];
const locations: LocationLevel[] = ['Hidden', 'Perch', 'Nearby', 'Trail'];
const scenes: Scene[] = ['Auto', 'Desk nest', 'Couch mode', 'Outdoors', 'Café', 'Blanket fort'];
const poses: Pose[] = ['Auto', 'Waving', 'Locked in', 'Flopped', 'Victory'];
const expirationOptions: Array<{ label: Expiration; minutes: number | 'day' }> = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '4 hours', minutes: 240 },
  { label: '8 hours', minutes: 480 },
  { label: 'End of day', minutes: 'day' },
];

const initialUpdate: MonkeyUpdate = {
  activity: 'Studying',
  mood: 'Crispy',
  availability: 'Busy',
  caption: 'Fighting for my life with electromagnetics',
  locationLevel: 'Perch',
  place: 'The library',
  expiration: '2 hours',
  scene: 'Auto',
  pose: 'Auto',
  updatedAt: new Date(),
};

function expirationDate(update: MonkeyUpdate) {
  const option = expirationOptions.find((item) => item.label === update.expiration) ?? expirationOptions[3];
  if (option?.minutes === 'day') {
    const end = new Date(update.updatedAt);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  return new Date(update.updatedAt.getTime() + (option?.minutes ?? 120) * 60_000);
}

const sceneColors: Record<Scene, string> = {
  Auto: colors.lime,
  'Desk nest': '#E8D9B9',
  'Couch mode': '#D9D0EC',
  Outdoors: '#C9E3C4',
  Café: '#E7CBB9',
  'Blanket fort': '#C9D5DF',
};

function AppContent() {
  const [paired, setPaired] = useState(false);
  const [profile, setProfile] = useState({ name: 'Shawn', accent: '#996744' });
  const [update, setUpdate] = useState<MonkeyUpdate>(initialUpdate);
  const [draft, setDraft] = useState<MonkeyUpdate>(initialUpdate);
  const [composerOpen, setComposerOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [globalLocation, setGlobalLocation] = useState(false);
  const [notificationsPrivate, setNotificationsPrivate] = useState(true);
  const [reaction, setReaction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const remaining = expirationDate(update).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    const timer = setTimeout(() => {
      setExpired(true);
      setToast('Your status expired. Your current state is now unknown.');
      setTimeout(() => setToast(null), 4500);
      if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
        new globalThis.Notification('Your monkey status expired', {
          body: 'Your current state is now shown as unknown.',
        });
      }
      Alert.alert('Status expired', 'Your monkey update is no longer shown as current. Post a fresh one whenever you’re ready.');
    }, remaining);
    return () => clearTimeout(timer);
  }, [update]);

  const placeLabel = useMemo(() => {
    if (update.locationLevel === 'Hidden') return 'Location hidden';
    if (update.locationLevel === 'Nearby') return `Near ${update.place}`;
    if (update.locationLevel === 'Trail') return `Live near ${update.place}`;
    return update.place;
  }, [update]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const openComposer = () => {
    setDraft({ ...update, ...(!globalLocation ? { locationLevel: 'Hidden' as const } : {}) });
    setComposerOpen(true);
  };

  const publish = () => {
    if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'default') {
      void globalThis.Notification.requestPermission();
    }
    setUpdate({ ...draft, updatedAt: new Date() });
    setExpired(false);
    setComposerOpen(false);
    notify('Monkey update published. Tiny world refreshed.');
  };

  if (!paired) {
    return (
      <PairingSetup
        onComplete={(name, accent) => {
          setProfile({ name, accent });
          setPaired(true);
          notify('Troop assembled. Extremely official.');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>THE TREEHOUSE</Text>
            <Text style={styles.logo}>Monkey Tracker</Text>
          </View>
          <Pressable accessibilityLabel="Open privacy controls" onPress={() => setPrivacyOpen(true)} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>◉</Text>
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.greeting}>Both monkeys accounted for</Text>
        </View>

        <View style={[styles.stage, { backgroundColor: sceneColors[update.scene] }]}>
          <View style={styles.sun} />
          <View style={styles.cloudOne} />
          <View style={styles.cloudTwo} />
          <View style={styles.branch} />
          <View style={styles.stagePeople}>
            <View style={styles.monkeySlot}>
              <MonkeyAvatar activity="Chilling" accent={profile.accent} />
              <Text style={styles.monkeyName}>{profile.name}</Text>
              <Text style={styles.monkeyMeta}>Chilling · cozy</Text>
            </View>
            <View style={styles.monkeySlot}>
              {reaction && <Text style={styles.reactionBubble}>{reaction}</Text>}
              <MonkeyAvatar activity={update.activity} accent="#7C5540" pose={update.pose} />
              <Text style={styles.monkeyName}>Shawn</Text>
              <Text style={styles.monkeyMeta}>{expired ? 'Status unknown' : `${update.activity} · ${update.mood.toLowerCase()}`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.partnerCard}>
          <View style={styles.cardTopline}>
            <View style={styles.identity}>
              <MonkeyAvatar activity={update.activity} accent="#7C5540" size="small" />
              <View>
                <Text style={styles.cardName}>Shawn’s little world</Text>
                <Text style={styles.timestamp}>Updated just now · manual</Text>
              </View>
            </View>
            <View style={styles.precisionBadge}>
              <Text style={styles.precisionText}>{expired ? 'Expired' : update.locationLevel}</Text>
            </View>
          </View>
          <Text style={styles.place}>{expired ? 'Current status unknown' : placeLabel}</Text>
          <Text style={styles.caption}>{expired ? 'This update expired and is no longer presented as current.' : update.caption || `${update.activity}, no further monkey business reported.`}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailPill}>☻ {expired ? 'Unknown' : update.mood}</Text>
            <Text style={styles.detailPill}>◷ {expired ? 'Unknown' : update.availability}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reactions}>
            {['♡', '🍌', '🫡', '😭'].map((item) => (
              <Pressable
                accessibilityLabel={`React ${item}`}
                key={item}
                onPress={() => { setReaction(item); notify(`${item} sent. A dignified response.`); }}
                style={[styles.reactionButton, reaction === item && styles.reactionSelected]}
              >
                <Text style={styles.reactionText}>{item}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => notify('Poke sent. Do not abuse your power.')} style={styles.pokeButton}>
              <Text style={styles.pokeText}>Poke</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Today’s monkey business</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>
        <View style={styles.timelineCard}>
          <View style={[styles.timelineIcon, { backgroundColor: colors.lilac }]}><Text>☕</Text></View>
          <View style={styles.timelineCopy}>
            <Text style={styles.timelineTitle}>Good morning from Shawn</Text>
            <Text style={styles.timelineMeta}>8:12 AM · saved to your troop</Text>
          </View>
          <Text style={styles.timelineHeart}>♡</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.navItem}><Text style={styles.navIcon}>⌂</Text><Text style={styles.navActive}>Home</Text></Pressable>
        <Pressable onPress={openComposer} style={styles.updateButton}><Text style={styles.updatePlus}>＋</Text><Text style={styles.updateText}>Update</Text></Pressable>
        <Pressable onPress={() => notify('No older monkey business yet.')} style={styles.navItem}><Text style={styles.navIcon}>◷</Text><Text style={styles.navText}>History</Text></Pressable>
      </View>

      {toast && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}

      <ComposerModal
        draft={draft}
        locationEnabled={globalLocation}
        open={composerOpen}
        onChange={setDraft}
        onClose={() => setComposerOpen(false)}
        onPublish={publish}
      />
      <PrivacyModal
        open={privacyOpen}
        locationEnabled={globalLocation}
        notificationsPrivate={notificationsPrivate}
        onLocationChange={setGlobalLocation}
        onNotificationsChange={setNotificationsPrivate}
        onLeave={() => {
          setPrivacyOpen(false);
          setPaired(false);
          setReaction(null);
        }}
        onClose={() => setPrivacyOpen(false)}
      />
    </SafeAreaView>
  );
}

function PairingSetup({ onComplete }: { onComplete: (name: string, accent: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [accent, setAccent] = useState('#996744');
  const [code, setCode] = useState('');
  const accents = ['#996744', '#7C5540', '#C07A62', '#5F7562'];
  const inviteCode = '462649';

  return (
    <SafeAreaView style={styles.onboardingSafe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.progressTrack}>
        {[0, 1, 2].map((item) => <View key={item} style={[styles.progressBar, item <= step && styles.progressBarActive]} />)}
      </View>
      <ScrollView contentContainerStyle={styles.onboardingPage} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={styles.onboardingKicker}>WELCOME TO THE TROOP</Text>
            <Text style={styles.onboardingTitle}>First, meet your monkey.</Text>
            <Text style={styles.onboardingBody}>This tiny creature will report your whereabouts with questionable dignity.</Text>
            <View style={styles.onboardingMonkey}><MonkeyAvatar activity="Chilling" accent={accent} /></View>
            <Text style={styles.fieldLabel}>What should your partner call you?</Text>
            <TextInput
              accessibilityLabel="Your display name"
              autoCapitalize="words"
              maxLength={30}
              onChangeText={setName}
              placeholder="Display name"
              placeholderTextColor={colors.muted}
              style={styles.onboardingInput}
              value={name}
            />
            <Text style={styles.fieldLabel}>Choose your fur</Text>
            <View style={styles.accentRow}>
              {accents.map((color) => (
                <Pressable
                  accessibilityLabel={`Choose monkey color ${color}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: accent === color }}
                  key={color}
                  onPress={() => setAccent(color)}
                  style={[styles.accentChoice, { backgroundColor: color }, accent === color && styles.accentSelected]}
                />
              ))}
            </View>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !name.trim() }} disabled={!name.trim()} onPress={() => setStep(1)} style={[styles.onboardingButton, !name.trim() && styles.buttonDisabled]}>
              <Text style={styles.onboardingButtonText}>That’s my monkey</Text>
            </Pressable>
          </>
        )}
        {step === 1 && (
          <>
            <Text style={styles.onboardingKicker}>PAIR WITH YOUR PERSON</Text>
            <Text style={styles.onboardingTitle}>Two monkeys. One troop.</Text>
            <Text style={styles.onboardingBody}>Invite exactly one partner. They must accept before either of you can see updates.</Text>
            <View style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>YOUR PRIVATE CODE</Text>
              <Text selectable style={styles.inviteCode}>{inviteCode}</Text>
              <Text style={styles.inviteHint}>In the real app this code expires and can only be used once.</Text>
            </View>
            <Pressable onPress={() => setStep(2)} style={styles.onboardingButton}>
              <Text style={styles.onboardingButtonText}>Simulate invite sent</Text>
            </Pressable>
            <Pressable onPress={() => setStep(0)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back</Text></Pressable>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.onboardingKicker}>PARTNER ACCEPTANCE</Text>
            <Text style={styles.onboardingTitle}>Enter the code together.</Text>
            <Text style={styles.onboardingBody}>For this prototype, type 462649 to simulate your partner explicitly accepting the troop invitation.</Text>
            <View style={styles.pairScene}>
              <MonkeyAvatar activity="Chilling" accent={accent} />
              <Text style={styles.pairPlus}>＋</Text>
              <MonkeyAvatar activity="Studying" accent="#7C5540" />
            </View>
            <TextInput
              accessibilityLabel="Six character invite code"
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setCode(value.toUpperCase())}
              placeholder="SIX-DIGIT CODE"
              placeholderTextColor={colors.muted}
              style={[styles.onboardingInput, styles.codeInput]}
              value={code}
            />
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: code !== inviteCode }} disabled={code !== inviteCode} onPress={() => onComplete(name.trim(), accent)} style={[styles.onboardingButton, code !== inviteCode && styles.buttonDisabled]}>
              <Text style={styles.onboardingButtonText}>Accept and enter the treehouse</Text>
            </Pressable>
            <Pressable onPress={() => setStep(1)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back</Text></Pressable>
            <Text style={styles.consentNote}>Pairing does not enable location sharing. Each monkey chooses that independently.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ComposerProps {
  draft: MonkeyUpdate;
  locationEnabled: boolean;
  open: boolean;
  onChange: (update: MonkeyUpdate) => void;
  onClose: () => void;
  onPublish: () => void;
}

function ComposerModal({ draft, locationEnabled, open, onChange, onClose, onPublish }: ComposerProps) {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const set = <K extends keyof MonkeyUpdate>(key: K, value: MonkeyUpdate[K]) => onChange({ ...draft, [key]: value });
  const expirationIndex = Math.max(0, expirationOptions.findIndex((item) => item.label === draft.expiration));
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}><Text style={styles.cancel}>Cancel</Text></Pressable>
            <Text style={styles.modalTitle}>Set your scene</Text>
            <View style={styles.headerSpacer} />
          </View>
          <ScrollView contentContainerStyle={styles.composer} keyboardShouldPersistTaps="handled">
            <View style={[styles.preview, { backgroundColor: sceneColors[draft.scene] }]}>
              <MonkeyAvatar activity={draft.activity} accent="#996744" pose={draft.pose} />
              <Text style={styles.previewText}>{draft.activity} · feeling {draft.mood.toLowerCase()}</Text>
              <Text style={styles.previewDetail}>{draft.scene} · {draft.pose}</Text>
            </View>
            <Picker horizontal label="What are you up to?" items={activities} value={draft.activity} onChange={(v) => set('activity', v as Activity)} />
            <Picker horizontal label="Current flavor" items={moods} value={draft.mood} onChange={(v) => set('mood', v as Mood)} />
            <Picker label="Can they reach you?" items={availabilities} value={draft.availability} onChange={(v) => set('availability', v as Availability)} />
            <Text style={styles.fieldLabel}>Add context (optional)</Text>
            <TextInput
              accessibilityLabel="Update caption"
              maxLength={140}
              multiline
              onChangeText={(text) => set('caption', text)}
              placeholder="Narrate the monkey business…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={draft.caption}
            />
            <Picker label="Location precision" items={locationEnabled ? locations : ['Hidden']} value={draft.locationLevel} onChange={(v) => set('locationLevel', v as LocationLevel)} />
            {!locationEnabled && (
              <View style={styles.warning}><Text style={styles.warningText}>Global location sharing is off. You can still share activity, mood, and availability.</Text></View>
            )}
            {draft.locationLevel !== 'Hidden' && (
              <TextInput
                accessibilityLabel="Place name"
                onChangeText={(text) => set('place', text)}
                placeholder="Name this place"
                placeholderTextColor={colors.muted}
                style={styles.singleInput}
                value={draft.place}
              />
            )}
            {draft.locationLevel === 'Trail' && (
              <View style={styles.warning}><Text style={styles.warningText}>Trail shares precise live location and ends automatically. You can stop it at any time.</Text></View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: extrasOpen }}
              onPress={() => setExtrasOpen((value) => !value)}
              style={styles.extrasToggle}
            >
              <View>
                <Text style={styles.extrasTitle}>Scene extras</Text>
                <Text style={styles.extrasSummary}>{draft.scene} · {draft.pose}</Text>
              </View>
              <Text style={styles.extrasChevron}>{extrasOpen ? '−' : '+'}</Text>
            </Pressable>
            {extrasOpen && (
              <View style={styles.extrasPanel}>
                <Picker horizontal label="Set the room" items={scenes} value={draft.scene} onChange={(v) => set('scene', v as Scene)} />
                <Picker horizontal label="Monkey pose" items={poses} value={draft.pose} onChange={(v) => set('pose', v as Pose)} />
              </View>
            )}
            <View style={styles.expirationCard}>
              <View style={styles.expirationHeading}>
                <Text style={styles.fieldLabel}>Status expires</Text>
                <Text style={styles.expirationValue}>{draft.expiration}</Text>
              </View>
              <Slider
                accessibilityLabel={`Status expires in ${draft.expiration}`}
                minimumValue={0}
                maximumValue={expirationOptions.length - 1}
                minimumTrackTintColor={colors.mossDark}
                maximumTrackTintColor={colors.line}
                step={1}
                thumbTintColor={colors.mossDark}
                value={expirationIndex}
                onValueChange={(value) => set('expiration', expirationOptions[Math.round(value)]?.label ?? '2 hours')}
              />
              <View style={styles.expirationScale}>
                <Text style={styles.expirationEnd}>15m</Text>
                <Text style={styles.expirationEnd}>End of day</Text>
              </View>
              <Text style={styles.expirationNote}>We’ll notify you when it expires, then show your status as unknown.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onPublish} style={styles.publishButton}>
              <Text style={styles.publishText}>Publish monkey update</Text>
            </Pressable>
            <Text style={styles.publishNote}>Shawn will see this update. It expires in {draft.expiration.toLowerCase()}.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Picker({ label, items, value, onChange, horizontal = false }: { label: string; items: string[]; value: string; onChange: (value: string) => void; horizontal?: boolean }) {
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

function PrivacyModal({ open, locationEnabled, notificationsPrivate, onLocationChange, onNotificationsChange, onLeave, onClose }: {
  open: boolean;
  locationEnabled: boolean;
  notificationsPrivate: boolean;
  onLocationChange: (value: boolean) => void;
  onNotificationsChange: (value: boolean) => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <View style={styles.headerSpacer} />
          <Text style={styles.modalTitle}>Privacy</Text>
          <Pressable onPress={onClose}><Text style={styles.done}>Done</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.privacyPage}>
          <View style={styles.privacyHero}><Text style={styles.privacyEmoji}>🙈</Text><Text style={styles.privacyTitle}>You control the view</Text><Text style={styles.privacyBody}>Shawn can only see what you choose to share. They cannot change these settings.</Text></View>
          <View style={styles.settingsCard}>
            <SettingRow title="Location sharing" body={locationEnabled ? 'On — controlled per update' : 'Off everywhere'} value={locationEnabled} onChange={onLocationChange} />
            <View style={styles.settingDivider} />
            <SettingRow title="Private notifications" body="Hide captions and places in previews" value={notificationsPrivate} onChange={onNotificationsChange} />
          </View>
          <View style={styles.visibilityCard}>
            <Text style={styles.visibilityLabel}>WHAT SHAWN CAN SEE RIGHT NOW</Text>
            <Text style={styles.visibilityValue}>{locationEnabled ? 'Your named Perch, activity, mood, and availability' : 'Your activity, mood, and availability — no location'}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert(
              'Leave this troop?',
              'Your former partner will immediately lose access to future updates. This prototype will return to setup.',
              [{ text: 'Cancel', style: 'cancel' }, { text: 'Leave troop', style: 'destructive', onPress: onLeave }],
            )}
            style={styles.unpair}
          >
            <Text style={styles.unpairText}>Block or leave this troop</Text>
          </Pressable>
          <Text style={styles.safetyCopy}>Monkey Tracker is not an emergency service. Shared location may be delayed, inaccurate, or unavailable.</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SettingRow({ title, body, value, onChange }: { title: string; body: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingBody}>{body}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: colors.line, true: colors.moss }} /></View>;
}

export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.paper }, page: { padding: 20, paddingBottom: 128 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { fontSize: 10, letterSpacing: 2.3, color: colors.moss, fontWeight: '800' }, logo: { fontSize: 26, lineHeight: 33, color: colors.ink, fontWeight: '800', letterSpacing: -0.8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, iconButtonText: { color: colors.moss, fontSize: 20 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 12 }, onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.moss, marginRight: 7 }, greeting: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  stage: { height: 276, borderRadius: 28, backgroundColor: colors.lime, overflow: 'hidden', paddingHorizontal: 15, ...shadow }, sun: { position: 'absolute', width: 62, height: 62, borderRadius: 31, top: 22, right: 26, backgroundColor: colors.yellow }, cloudOne: { position: 'absolute', width: 82, height: 22, borderRadius: 20, top: 53, left: 20, backgroundColor: 'rgba(255,255,255,0.55)' }, cloudTwo: { position: 'absolute', width: 45, height: 15, borderRadius: 20, top: 81, left: 51, backgroundColor: 'rgba(255,255,255,0.45)' }, branch: { position: 'absolute', width: '115%', height: 24, borderRadius: 20, backgroundColor: '#765039', bottom: 57, left: -18, transform: [{ rotate: '-2deg' }] }, stagePeople: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 18, justifyContent: 'space-around' }, monkeySlot: { width: '48%', alignItems: 'center' }, monkeyName: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 5 }, monkeyMeta: { fontSize: 11, fontWeight: '600', color: colors.muted, marginTop: 2 }, reactionBubble: { position: 'absolute', zIndex: 5, right: 4, top: 52, fontSize: 25, backgroundColor: colors.white, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 18, overflow: 'hidden' },
  partnerCard: { marginTop: 16, padding: 17, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow }, cardTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, identity: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 }, cardName: { fontSize: 16, color: colors.ink, fontWeight: '800' }, timestamp: { marginTop: 3, color: colors.muted, fontSize: 11 }, precisionBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.lime }, precisionText: { color: colors.mossDark, fontSize: 11, fontWeight: '800' }, place: { marginTop: 14, fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 }, caption: { marginTop: 5, color: colors.muted, fontSize: 15, lineHeight: 21 }, detailsRow: { flexDirection: 'row', gap: 8, marginTop: 14 }, detailPill: { color: colors.ink, fontSize: 12, fontWeight: '700', backgroundColor: colors.paper, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, overflow: 'hidden' }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 }, reactions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, reactionButton: { width: 37, height: 37, borderRadius: 18.5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, reactionSelected: { backgroundColor: colors.peach }, reactionText: { fontSize: 18 }, pokeButton: { marginLeft: 'auto', paddingVertical: 9, paddingHorizontal: 16, backgroundColor: colors.ink, borderRadius: 999 }, pokeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 11 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, sectionLink: { color: colors.moss, fontSize: 12, fontWeight: '800' }, timelineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: colors.line }, timelineIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, timelineCopy: { flex: 1, marginLeft: 11 }, timelineTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, timelineMeta: { color: colors.muted, fontSize: 10, marginTop: 3 }, timelineHeart: { fontSize: 21, color: colors.muted },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 89, paddingBottom: 18, backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, navItem: { width: 72, alignItems: 'center', gap: 3 }, navIcon: { fontSize: 22, color: colors.mossDark }, navActive: { fontSize: 10, color: colors.mossDark, fontWeight: '800' }, navText: { fontSize: 10, color: colors.muted, fontWeight: '700' }, updateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mossDark, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 21, gap: 5, marginTop: -23, ...shadow }, updatePlus: { color: colors.white, fontSize: 20 }, updateText: { color: colors.white, fontSize: 14, fontWeight: '800' }, toast: { position: 'absolute', left: 24, right: 24, bottom: 105, backgroundColor: colors.ink, borderRadius: 14, padding: 13, alignItems: 'center' }, toastText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: colors.paper }, modalHeader: { height: 62, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.line }, modalTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, cancel: { color: colors.muted, fontSize: 15 }, done: { color: colors.moss, fontWeight: '800', fontSize: 15 }, headerSpacer: { width: 44 }, composer: { padding: 20, paddingBottom: 50 }, preview: { height: 182, borderRadius: 24, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, previewText: { color: colors.mossDark, fontSize: 13, fontWeight: '800' }, previewDetail: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 4 }, field: { marginBottom: 23 }, fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 10 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, horizontalChips: { gap: 8, paddingRight: 14 }, input: { minHeight: 90, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.card, padding: 14, textAlignVertical: 'top', color: colors.ink, fontSize: 15, marginBottom: 23 }, singleInput: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.card, padding: 14, color: colors.ink, fontSize: 15, marginTop: -13, marginBottom: 23 }, warning: { backgroundColor: '#FFF0D1', borderRadius: 13, padding: 12, marginTop: -13, marginBottom: 23 }, warningText: { color: '#74572B', fontSize: 12, lineHeight: 18, fontWeight: '600' }, extrasToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 15, marginBottom: 18 }, extrasTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, extrasSummary: { color: colors.muted, fontSize: 11, marginTop: 4 }, extrasChevron: { color: colors.mossDark, fontSize: 24, fontWeight: '500' }, extrasPanel: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 16, padding: 14, paddingBottom: 0, marginTop: -10, marginBottom: 18 }, expirationCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 16, marginBottom: 18 }, expirationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, expirationValue: { color: colors.mossDark, fontSize: 13, fontWeight: '900', backgroundColor: colors.lime, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, overflow: 'hidden' }, expirationScale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 }, expirationEnd: { color: colors.muted, fontSize: 9, fontWeight: '700' }, expirationNote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 }, publishButton: { backgroundColor: colors.mossDark, borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 6 }, publishText: { color: colors.white, fontSize: 15, fontWeight: '800' }, publishNote: { textAlign: 'center', color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 10 },
  privacyPage: { padding: 20, paddingBottom: 50 }, privacyHero: { alignItems: 'center', padding: 20 }, privacyEmoji: { fontSize: 50 }, privacyTitle: { color: colors.ink, fontSize: 23, fontWeight: '800', marginTop: 8 }, privacyBody: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7, maxWidth: 310 }, settingsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 16, marginTop: 14 }, settingRow: { flexDirection: 'row', alignItems: 'center' }, settingCopy: { flex: 1, paddingRight: 12 }, settingTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, settingBody: { color: colors.muted, fontSize: 11, marginTop: 4 }, settingDivider: { height: 1, backgroundColor: colors.line, marginVertical: 16 }, visibilityCard: { backgroundColor: colors.lime, borderRadius: 18, padding: 17, marginTop: 15 }, visibilityLabel: { color: colors.mossDark, fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, visibilityValue: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '700', marginTop: 7 }, unpair: { alignItems: 'center', marginTop: 28, padding: 13 }, unpairText: { color: colors.danger, fontSize: 13, fontWeight: '800' }, safetyCopy: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 15, paddingHorizontal: 20 },
  onboardingSafe: { flex: 1, backgroundColor: colors.paper }, progressTrack: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 10 }, progressBar: { flex: 1, height: 4, borderRadius: 3, backgroundColor: colors.line }, progressBarActive: { backgroundColor: colors.moss }, onboardingPage: { flexGrow: 1, padding: 25, paddingTop: 52, paddingBottom: 40 }, onboardingKicker: { color: colors.moss, fontSize: 10, letterSpacing: 2.1, fontWeight: '900', textAlign: 'center' }, onboardingTitle: { color: colors.ink, fontSize: 31, lineHeight: 36, letterSpacing: -1, fontWeight: '900', textAlign: 'center', marginTop: 10 }, onboardingBody: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 30 }, onboardingMonkey: { height: 178, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }, onboardingInput: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.card, padding: 15, color: colors.ink, fontSize: 16, marginBottom: 23 }, accentRow: { flexDirection: 'row', gap: 14, marginBottom: 34 }, accentChoice: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: colors.paper }, accentSelected: { borderColor: colors.ink, transform: [{ scale: 1.08 }] }, onboardingButton: { backgroundColor: colors.mossDark, borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 'auto' }, onboardingButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' }, buttonDisabled: { opacity: 0.35 }, secondaryButton: { alignItems: 'center', padding: 15 }, secondaryButtonText: { color: colors.muted, fontSize: 13, fontWeight: '700' }, inviteCard: { backgroundColor: colors.lime, borderRadius: 25, padding: 30, alignItems: 'center', marginVertical: 30 }, inviteLabel: { color: colors.mossDark, fontSize: 9, letterSpacing: 1.8, fontWeight: '900' }, inviteCode: { color: colors.ink, fontSize: 37, letterSpacing: 6, fontWeight: '900', marginVertical: 17 }, inviteHint: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }, pairScene: { height: 180, borderRadius: 27, backgroundColor: colors.lime, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 25 }, pairPlus: { color: colors.mossDark, fontSize: 25, fontWeight: '900', marginHorizontal: -10, zIndex: 5 }, codeInput: { textAlign: 'center', letterSpacing: 5, fontWeight: '800', fontSize: 19 }, consentNote: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 16, marginTop: 12, paddingHorizontal: 18 },
});
