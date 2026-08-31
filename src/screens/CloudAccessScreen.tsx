import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActiveTroop, RemoteProfile } from '../services/backend';
import { colors } from '../theme';
import { MonkeyAvatar } from '../components/MonkeyAvatar';
import { MonkeyAppearancePicker } from '../components/MonkeyAppearancePicker';

interface CloudAccessScreenProps {
  signedIn: boolean;
  loading: boolean;
  error: string | null;
  profile: RemoteProfile | null;
  troop: ActiveTroop | null;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string, displayName: string, accent: string, skin: string) => Promise<boolean>;
  onSignOut: () => Promise<boolean>;
  onCreateInvite: () => Promise<string>;
  onAcceptInvite: (code: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export function CloudAccessScreen(props: CloudAccessScreenProps) {
  return props.signedIn ? <CloudPairing {...props} /> : <CloudAuth {...props} />;
}

function CloudAuth({ loading, error, onSignIn, onSignUp }: CloudAccessScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accent, setAccent] = useState('#996744');
  const [skin, setSkin] = useState('#EBC6A6');
  const [message, setMessage] = useState<string | null>(null);
  const valid = email.includes('@') && password.length >= 8 && (mode === 'signin' || displayName.trim().length > 0);

  const submit = async () => {
    const succeeded = mode === 'signin'
      ? await onSignIn(email, password)
      : await onSignUp(email, password, displayName, accent, skin);
    if (succeeded && mode === 'signup') setMessage('Account created. If email confirmation is enabled, confirm it before signing in.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authPage} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>PRIVATE ALPHA</Text>
        <Text style={styles.title}>{mode === 'signup' ? 'Create your treehouse.' : 'Welcome back, monkey.'}</Text>
        <Text style={styles.body}>Your account keeps one private troop synchronized across devices.</Text>
        {mode === 'signup' && <View style={styles.monkey}><MonkeyAvatar activity="Chilling" accent={accent} skin={skin} /></View>}
        {mode === 'signup' && <TextInput accessibilityLabel="Display name" autoCapitalize="words" maxLength={30} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor={colors.muted} style={styles.input} value={displayName} />}
        {mode === 'signup' && <View style={styles.accents}><MonkeyAppearancePicker compact fur={accent} onFurChange={setAccent} onSkinChange={setSkin} skin={skin} /></View>}
        <TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.muted} style={styles.input} value={email} />
        <TextInput accessibilityLabel="Password" autoCapitalize="none" onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} value={password} />
        {(error || message) && <View style={error ? styles.errorCard : styles.infoCard}><Text style={error ? styles.errorText : styles.infoText}>{error ?? message}</Text></View>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid || loading }} disabled={!valid || loading} onPress={() => void submit()} style={[styles.primary, (!valid || loading) && styles.disabled]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Text>}</Pressable>
        <Pressable onPress={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(null); }} style={styles.secondary}><Text style={styles.secondaryText}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New monkey? Create an account'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function CloudPairing({ loading, error, profile, troop, onSignOut, onCreateInvite, onAcceptInvite, onRefresh }: CloudAccessScreenProps) {
  const [invite, setInvite] = useState('');
  const [code, setCode] = useState('');
  const waiting = Boolean(troop && troop.memberCount < 2);
  const normalizedCode = code.replace(/\D/g, '');
  const isOwnCode = Boolean(invite) && normalizedCode === invite;
  const create = async () => {
    setCode('');
    setInvite(await onCreateInvite());
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.pairingPage} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>SIGNED IN AS {profile?.display_name?.toUpperCase() ?? 'A MONKEY'}</Text>
        <Text style={styles.title}>{waiting ? 'Waiting for your person.' : 'Build your troop.'}</Text>
        <Text style={styles.body}>{waiting ? 'Share a fresh private code, then check again after they accept.' : 'Create a code for your partner, or enter the code they sent you.'}</Text>
        <View style={styles.inviteCard}><Text style={styles.inviteLabel}>YOUR 15-MINUTE CODE</Text><Text selectable style={styles.inviteCode}>{invite || '••••••'}</Text><Pressable disabled={loading} onPress={() => void create()}><Text style={styles.inlineAction}>{invite ? 'Generate a new code' : 'Create invite code'}</Text></Pressable></View>
        <View style={styles.orRow}><View style={styles.line} /><Text style={styles.or}>OR JOIN THEIRS</Text><View style={styles.line} /></View>
        <TextInput accessibilityLabel="Partner invite code" keyboardType="number-pad" maxLength={6} onChangeText={setCode} placeholder="SIX-DIGIT CODE" placeholderTextColor={colors.muted} style={[styles.input, styles.codeInput]} value={code} />
        <Text style={styles.joinHint}>Enter the code your partner sent you — not the one above.</Text>
        {(error || isOwnCode) && <View style={styles.errorCard}><Text style={styles.errorText}>{isOwnCode ? 'That is your code. Send it to your partner; enter the code they send you here.' : error}</Text></View>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: normalizedCode.length !== 6 || isOwnCode || loading }} disabled={normalizedCode.length !== 6 || isOwnCode || loading} onPress={() => void onAcceptInvite(normalizedCode)} style={[styles.primary, (normalizedCode.length !== 6 || isOwnCode || loading) && styles.disabled]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>Accept and pair</Text>}</Pressable>
        {waiting && <Pressable disabled={loading} onPress={() => void onRefresh()} style={styles.refresh}><Text style={styles.refreshText}>Check whether my partner accepted</Text></Pressable>}
        <Pressable onPress={() => void onSignOut()} style={styles.secondary}><Text style={styles.secondaryText}>Sign out</Text></Pressable>
        <Text style={styles.consent}>Pairing never enables location. Both people control their own sharing independently.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, authPage: { flexGrow: 1, padding: 25, paddingTop: 48, paddingBottom: 40 }, pairingPage: { flexGrow: 1, padding: 25, paddingTop: 58, paddingBottom: 40 },
  kicker: { color: colors.moss, fontSize: 10, letterSpacing: 2, fontWeight: '900', textAlign: 'center' }, title: { color: colors.ink, fontSize: 30, lineHeight: 36, letterSpacing: -1, fontWeight: '900', textAlign: 'center', marginTop: 10 }, body: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9, marginBottom: 26 },
  monkey: { height: 150, borderRadius: 26, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, input: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.card, padding: 15, color: colors.ink, fontSize: 16, marginBottom: 14 }, accents: { marginBottom: 20 },
  primary: { backgroundColor: colors.mossDark, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minHeight: 52, padding: 15, marginTop: 5 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' }, disabled: { opacity: 0.35 }, secondary: { alignItems: 'center', padding: 16 }, secondaryText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  errorCard: { backgroundColor: '#FBE1DC', borderRadius: 12, padding: 11, marginBottom: 10 }, errorText: { color: colors.danger, fontSize: 11, lineHeight: 16, fontWeight: '700' }, infoCard: { backgroundColor: colors.lime, borderRadius: 12, padding: 11, marginBottom: 10 }, infoText: { color: colors.mossDark, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  inviteCard: { backgroundColor: colors.lime, borderRadius: 24, padding: 28, alignItems: 'center', marginVertical: 14 }, inviteLabel: { color: colors.mossDark, fontSize: 9, letterSpacing: 1.7, fontWeight: '900' }, inviteCode: { color: colors.ink, fontSize: 35, letterSpacing: 6, fontWeight: '900', marginVertical: 15 }, inlineAction: { color: colors.mossDark, fontSize: 11, fontWeight: '900' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 }, line: { flex: 1, height: 1, backgroundColor: colors.line }, or: { color: colors.muted, fontSize: 9, fontWeight: '900' }, codeInput: { textAlign: 'center', letterSpacing: 5, fontWeight: '900', marginBottom: 7 }, joinHint: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 15, marginBottom: 10 }, refresh: { alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, marginTop: 12 }, refreshText: { color: colors.mossDark, fontSize: 12, fontWeight: '900' }, consent: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 8, paddingHorizontal: 15 },
});
