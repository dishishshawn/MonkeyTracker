import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ComposerModal } from './src/components/ComposerModal';
import { PairingSetup } from './src/components/PairingSetup';
import { PrivacyModal } from './src/components/PrivacyModal';
import { enforceLocationPreference } from './src/domain/updates';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CloudAccessScreen } from './src/screens/CloudAccessScreen';
import {
  deleteRemoteUpdate,
  loadCurrentRemoteUpdates,
  loadRemoteTimeline,
  publishRemoteUpdate,
  subscribeToTroopUpdates,
  unsubscribe,
} from './src/services/backend';
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
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<MonkeyUpdate | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, duration = 2200) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleExpired = useCallback(() => {
    notify('Your status expired. Your current state is now unknown.', 4500);
    if (Platform.OS === 'web' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
      new globalThis.Notification('Your monkey status expired', { body: 'Your current state is now shown as unknown.' });
    }
    Alert.alert('Status expired', 'Your monkey update is no longer shown as current. Post a fresh one whenever you’re ready.');
  }, [notify]);

  const { state, hydrated, expired, actions } = useMonkeyTracker(handleExpired);
  const cloud = useCloudAccount();

  useEffect(() => {
    if (!cloud.ready || !cloud.profile) return;
    if (state.profile.name === cloud.profile.display_name && state.profile.accent === cloud.profile.avatar_accent && state.paired) return;
    actions.completePairing({ name: cloud.profile.display_name, accent: cloud.profile.avatar_accent }, true);
  }, [actions, cloud.profile, cloud.ready, state.paired, state.profile]);

  useEffect(() => {
    const troopId = cloud.troop?.troopId;
    if (!cloud.ready || !troopId) return;
    let active = true;
    const sync = async () => {
      try {
        const [currentRows, timelineRows] = await Promise.all([
          loadCurrentRemoteUpdates(troopId),
          loadRemoteTimeline(troopId),
        ]);
        if (active) actions.syncRemote(remoteCurrent(currentRows), remoteTimeline(timelineRows));
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
  }, [actions, cloud.ready, cloud.troop?.troopId, notify]);

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
    if (cloud.ready && cloud.troop) {
      void publishRemoteUpdate(cloud.troop.troopId, published).catch(() => notify('Saved locally, but cloud sync needs another try.', 3500));
    }
    setComposerOpen(false);
    notify('Monkey update published and saved to your timeline.');
  }, [actions, cloud.ready, cloud.troop, draft, notify]);

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
          expired={expired}
          onNotify={notify}
          onOpenComposer={openComposer}
          onOpenHistory={() => setActiveScreen('history')}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onReaction={(value) => {
            setReaction(value);
            notify(`${value} sent. A dignified response.`);
          }}
          profile={state.profile}
          reaction={reaction}
          timeline={state.timeline}
          update={state.currentUpdate}
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
          timeline={state.timeline}
        />
      )}

      <ComposerModal
        accent={state.profile.accent}
        draft={draft ?? state.currentUpdate}
        locationEnabled={state.preferences.locationEnabled}
        onChange={setDraft}
        onClose={() => setComposerOpen(false)}
        onPublish={publish}
        open={composerOpen}
      />
      <PrivacyModal
        locationEnabled={state.preferences.locationEnabled}
        notificationsPrivate={state.preferences.notificationsPrivate}
        onClose={() => setPrivacyOpen(false)}
        onLeave={() => {
          setPrivacyOpen(false);
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
        open={privacyOpen}
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
