import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ComposerModal } from './src/components/ComposerModal';
import { PairingSetup } from './src/components/PairingSetup';
import { PrivacyModal } from './src/components/PrivacyModal';
import { planNotifications } from './src/domain/notifications';
import { createInitialUpdate, enforceLocationPreference, expirationDate } from './src/domain/updates';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CloudAccessScreen } from './src/screens/CloudAccessScreen';
import {
  deleteRemoteUpdate,
  loadCurrentRemoteUpdates,
  loadMyCurrentRemoteUpdates,
  loadRemoteTimeline,
  publishRemoteUpdate,
  PokeLimitReachedError,
  DAILY_POKE_LIMIT,
  remainingPokes,
  sendTroopInteraction,
  subscribeToTroopInteractions,
  subscribeToTroopUpdates,
  unsubscribe,
} from './src/services/backend';
import {
  cancelScheduledNotifications,
  configureNotificationHandler,
  ensureNotificationPermission,
  syncScheduledNotifications,
} from './src/services/notifications';
import { remoteCurrent, remoteTimeline } from './src/services/remoteMapping';
import { useCloudAccount } from './src/state/useCloudAccount';
import { useMonkeyTracker } from './src/state/useMonkeyTracker';
import { colors } from './src/theme';
import { MonkeyUpdate } from './src/types';

function AppContent() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'home' | 'history'>('home');
  const [reaction, setReaction] = useState<string | null>(null);
  const [incomingCue, setIncomingCue] = useState<string | null>(null);
  const [incomingKind, setIncomingKind] = useState<'reaction' | 'poke' | null>(null);
  const [incomingKey, setIncomingKey] = useState<string | null>(null);
  const [partnerUpdate, setPartnerUpdate] = useState<MonkeyUpdate>(() => createInitialUpdate(new Date(0)));
  const [partnerExpired, setPartnerExpired] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<MonkeyUpdate | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, duration = 2200) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (cueTimer.current) clearTimeout(cueTimer.current);
  }, []);

  const handleExpired = useCallback(() => {
    notify('Your status expired. Your current state is now unknown.', 4500);
    if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
      new globalThis.Notification('Your monkey status expired', { body: 'Your current state is now shown as unknown.' });
    }
    Alert.alert('Status expired', 'Your monkey update is no longer shown as current. Post a fresh one whenever you’re ready.');
  }, [notify]);

  const { state, hydrated, expired: ownExpired, actions } = useMonkeyTracker(handleExpired);
  const cloud = useCloudAccount();

  useEffect(() => {
    const remaining = expirationDate(partnerUpdate).getTime() - Date.now();
    if (remaining <= 0) {
      setPartnerExpired(true);
      return;
    }
    setPartnerExpired(false);
    const timer = setTimeout(() => setPartnerExpired(true), remaining);
    return () => clearTimeout(timer);
  }, [partnerUpdate]);

  useEffect(() => { configureNotificationHandler(); }, []);

  useEffect(() => {
    if (!hydrated) return;
    void syncScheduledNotifications(planNotifications(state.currentUpdate, state.preferences));
  }, [hydrated, state.currentUpdate, state.preferences]);

  useEffect(() => {
    if (!cloud.ready || !cloud.profile) return;
    if (state.profile.name === cloud.profile.display_name && state.profile.accent === cloud.profile.avatar_accent && state.profile.skin === cloud.profile.avatar_skin && state.paired) return;
    actions.completePairing({ name: cloud.profile.display_name, accent: cloud.profile.avatar_accent, skin: cloud.profile.avatar_skin }, true);
  }, [actions, cloud.profile, cloud.ready, state.paired, state.profile]);

  useEffect(() => {
    const troopId = cloud.troop?.troopId;
    const myUserId = cloud.session?.user.id;
    if (!cloud.ready || !troopId) return;
    let active = true;
    const sync = async () => {
      try {
        const [myCurrentRows, partnerCurrentRows, timelineRows] = await Promise.all([
          loadMyCurrentRemoteUpdates(troopId),
          loadCurrentRemoteUpdates(troopId),
          loadRemoteTimeline(troopId),
        ]);
        if (active) {
          actions.syncRemote(remoteCurrent(myCurrentRows), remoteTimeline(timelineRows, myUserId));
          setPartnerUpdate(remoteCurrent(partnerCurrentRows));
        }
      } catch {
        if (active) notify('Cloud sync paused. Local data is still available.', 3500);
      }
    };
    void sync();
    const channel = subscribeToTroopUpdates(troopId, () => { void sync(); });
    return () => {
      active = false;
      void unsubscribe(channel);
    };
  }, [actions, cloud.ready, cloud.session?.user.id, cloud.troop?.troopId, notify]);

  useEffect(() => {
    const troopId = cloud.troop?.troopId;
    const myUserId = cloud.session?.user.id;
    if (!cloud.ready || !troopId || !myUserId) return;
    const channel = subscribeToTroopInteractions(troopId, (interaction) => {
      if (interaction.recipient_id !== myUserId) return;
      const senderName = cloud.partnerProfile?.display_name ?? 'Your monkey';
      const cue = interaction.kind === 'poke' ? '👋 Poke!' : interaction.reaction ?? '♡';
      setIncomingCue(cue);
      setIncomingKind(interaction.kind);
      setIncomingKey(interaction.id);
      if (cueTimer.current) clearTimeout(cueTimer.current);
      cueTimer.current = setTimeout(() => { setIncomingCue(null); setIncomingKind(null); setIncomingKey(null); }, 4500);
      notify(interaction.kind === 'poke' ? `${senderName} poked you.` : `${senderName} reacted ${cue}` , 4000);
      if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
        new globalThis.Notification(interaction.kind === 'poke' ? `${senderName} poked you` : `${senderName} reacted ${cue}`);
      }
    });
    return () => { void unsubscribe(channel); };
  }, [cloud.partnerProfile?.display_name, cloud.ready, cloud.session?.user.id, cloud.troop?.troopId, notify]);

  const openComposer = useCallback(() => {
    setDraft(enforceLocationPreference(state.currentUpdate, state.preferences.locationEnabled));
    setComposerOpen(true);
  }, [state.currentUpdate, state.preferences.locationEnabled]);

  const publish = useCallback(() => {
    if (!draft) return;
    if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'default') {
      void globalThis.Notification.requestPermission();
    }
    const published = actions.publish(draft);
    if (state.preferences.statusRemindersEnabled) {
      // The scheduling effect never prompts, so publishing is where we ask, and
      // a fresh grant has to schedule the update it was granted for.
      void ensureNotificationPermission().then((granted) => {
        if (!granted) return;
        // Match the reducer, which hides location when the global switch is off.
        const stored = enforceLocationPreference(published, state.preferences.locationEnabled);
        void syncScheduledNotifications(planNotifications(stored, state.preferences));
      });
    }
    if (cloud.ready && cloud.troop) {
      void publishRemoteUpdate(cloud.troop.troopId, published).catch(() => notify('Saved locally, but cloud sync needs another try.', 3500));
    }
    setComposerOpen(false);
    notify('Monkey update published and saved to your timeline.');
  }, [actions, cloud.ready, cloud.troop, draft, notify, state.preferences]);

  if (!hydrated) return <LoadingScreen />;

  if (cloud.configured && !cloud.ready) {
    return (
      <CloudAccessScreen
        error={cloud.error}
        loading={cloud.loading}
        onAcceptInvite={cloud.acceptInvite}
        onCreateInvite={cloud.createInvite}
        onRefresh={cloud.refresh}
        onSignIn={cloud.signIn}
        onSignOut={cloud.signOut}
        onSignUp={cloud.signUp}
        profile={cloud.profile}
        signedIn={Boolean(cloud.session)}
        troop={cloud.troop}
      />
    );
  }

  if (cloud.ready && !state.paired) return <LoadingScreen />;

  if (!cloud.configured && !state.paired) {
    return (
      <>
        <PairingSetup onComplete={(profile, consentAccepted) => {
          actions.completePairing(profile, consentAccepted);
          if (consentAccepted) notify('Troop assembled. Extremely official.');
        }} />
        <Toast message={toast} />
      </>
    );
  }

  return (
    <>
      {activeScreen === 'home' ? (
        <HomeScreen
          expired={partnerExpired}
          incomingCue={incomingCue}
          incomingKey={incomingKey}
          incomingKind={incomingKind}
          onPoke={() => {
            const troopId = cloud.troop?.troopId;
            const recipientId = cloud.partnerProfile?.id;
            if (!troopId || !recipientId) return notify('Your monkey is not connected yet.');
            void sendTroopInteraction(troopId, recipientId, 'poke')
              .then(async () => {
                // Showing what is left keeps the cap from arriving as a wall.
                const left = await remainingPokes().catch(() => null);
                notify(left === null ? 'Poke sent. Do not abuse your power.' : `Poke sent. ${left} left today.`);
              })
              .catch((error) => notify(error instanceof PokeLimitReachedError
                ? `That is ${DAILY_POKE_LIMIT} pokes today. Your monkey has earned some peace.`
                : 'That poke fell out of the tree. Try again.'));
          }}
          onOpenComposer={openComposer}
          onOpenHistory={() => setActiveScreen('history')}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onReaction={(value) => {
            setReaction(value);
            const troopId = cloud.troop?.troopId;
            const recipientId = cloud.partnerProfile?.id;
            if (!troopId || !recipientId) return notify('Your monkey is not connected yet.');
            void sendTroopInteraction(troopId, recipientId, 'reaction', value)
              .then(() => notify(`${value} sent. A dignified response.`))
              .catch(() => notify('That reaction did not make it across the branch.'));
          }}
          ownExpired={ownExpired}
          ownUpdate={state.currentUpdate}
          partner={cloud.partnerProfile ? { name: cloud.partnerProfile.display_name, accent: cloud.partnerProfile.avatar_accent, skin: cloud.partnerProfile.avatar_skin } : undefined}
          profile={state.profile}
          reaction={reaction}
          timeline={state.timeline}
          update={partnerUpdate}
        />
      ) : (
        <HistoryScreen
          onDelete={(id) => {
            actions.deleteTimelineEntry(id);
            if (cloud.ready) {
              void deleteRemoteUpdate(id).catch(() => notify('Removed locally; cloud deletion needs another try.', 3500));
            } else {
              notify('Update deleted from this device.');
            }
          }}
          onHome={() => setActiveScreen('home')}
          onOpenComposer={openComposer}
          onToggleSaved={actions.toggleSaved}
          partnerName={cloud.partnerProfile?.display_name ?? 'your partner'}
          timeline={state.timeline}
        />
      )}

      <ComposerModal
        accent={state.profile.accent}
        skin={state.profile.skin}
        draft={draft ?? state.currentUpdate}
        locationEnabled={state.preferences.locationEnabled}
        onChange={setDraft}
        onClose={() => setComposerOpen(false)}
        onPublish={publish}
        open={composerOpen}
        quickPresets={state.quickPresets}
        onSavePreset={(name, update) => {
          actions.saveQuickPreset({ id: `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, activity: update.activity, mood: update.mood, availability: update.availability, scene: update.scene, pose: update.pose });
          notify(`${name} saved to quick scenes.`);
        }}
      />
      <PrivacyModal
        locationEnabled={state.preferences.locationEnabled}
        notificationsPrivate={state.preferences.notificationsPrivate}
        onClose={() => setPrivacyOpen(false)}
        onLeave={() => {
          setPrivacyOpen(false);
          void cancelScheduledNotifications();
          setActiveScreen('home');
          setReaction(null);
          if (cloud.ready) {
            void cloud.leave().then((succeeded) => {
              if (succeeded) actions.leaveTroop();
            });
          } else {
            actions.leaveTroop();
          }
        }}
        onLocationChange={actions.setLocationEnabled}
        onNotificationsChange={actions.setNotificationsPrivate}
        onStatusRemindersChange={actions.setStatusRemindersEnabled}
        open={privacyOpen}
        statusRemindersEnabled={state.preferences.statusRemindersEnabled}
      />
      <Toast message={toast} />
    </>
  );
}

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loading}>
      <StatusBar style="dark" />
      <Text style={styles.loadingMonkey}>🐒</Text>
      <Text style={styles.loadingText}>Checking the treehouse…</Text>
    </SafeAreaView>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <View accessibilityLiveRegion="polite" style={styles.toast}><Text style={styles.toastText}>{message}</Text></View>;
}

export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  loadingMonkey: { fontSize: 48 }, loadingText: { color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 12 },
  toast: { position: 'absolute', zIndex: 20, left: 24, right: 24, bottom: 105, backgroundColor: colors.ink, borderRadius: 14, padding: 13, alignItems: 'center' },
  toastText: { color: colors.white, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
