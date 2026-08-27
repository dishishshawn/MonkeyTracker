import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { canAcceptInvite, PROTOTYPE_INVITE_CODE } from '../domain/pairing';
import { colors } from '../theme';
import { Profile } from '../types';
import { MonkeyAvatar } from './MonkeyAvatar';
import { MonkeyColorPicker } from './MonkeyColorPicker';

export function PairingSetup({ onComplete }: { onComplete: (profile: Profile, consentAccepted: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [accent, setAccent] = useState('#996744');
  const [code, setCode] = useState('');
  const accepted = canAcceptInvite(code);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.progressTrack}>
        {[0, 1, 2].map((item) => <View key={item} style={[styles.progressBar, item <= step && styles.progressBarActive]} />)}
      </View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={styles.kicker}>WELCOME TO THE TROOP</Text>
            <Text style={styles.title}>First, meet your monkey.</Text>
            <Text style={styles.body}>This tiny creature will report your whereabouts with questionable dignity.</Text>
            <View style={styles.monkey}><MonkeyAvatar activity="Chilling" accent={accent} /></View>
            <Text style={styles.fieldLabel}>What should your partner call you?</Text>
            <TextInput accessibilityLabel="Your display name" autoCapitalize="words" maxLength={30} onChangeText={setName} placeholder="Display name" placeholderTextColor={colors.muted} style={styles.input} value={name} />
            <Text style={styles.fieldLabel}>Choose your colorway</Text>
            <View style={styles.accentRow}><MonkeyColorPicker onChange={setAccent} value={accent} /></View>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !name.trim() }} disabled={!name.trim()} onPress={() => setStep(1)} style={[styles.primaryButton, !name.trim() && styles.disabled]}>
              <Text style={styles.primaryText}>That’s my monkey</Text>
            </Pressable>
          </>
        )}
        {step === 1 && (
          <>
            <Text style={styles.kicker}>PAIR WITH YOUR PERSON</Text>
            <Text style={styles.title}>Two monkeys. One troop.</Text>
            <Text style={styles.body}>Invite exactly one partner. They must accept before either of you can see updates.</Text>
            <View style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>YOUR PRIVATE CODE</Text>
              <Text selectable style={styles.inviteCode}>{PROTOTYPE_INVITE_CODE}</Text>
              <Text style={styles.inviteHint}>In the connected app this code expires and can only be used once.</Text>
            </View>
            <Pressable onPress={() => setStep(2)} style={styles.primaryButton}><Text style={styles.primaryText}>Simulate invite sent</Text></Pressable>
            <Pressable onPress={() => setStep(0)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back</Text></Pressable>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.kicker}>PARTNER ACCEPTANCE</Text>
            <Text style={styles.title}>Enter the code together.</Text>
            <Text style={styles.body}>For this local prototype, type {PROTOTYPE_INVITE_CODE} to record explicit partner acceptance.</Text>
            <View style={styles.pairScene}>
              <MonkeyAvatar activity="Chilling" accent={accent} />
              <Text style={styles.pairPlus}>＋</Text>
              <MonkeyAvatar activity="Studying" accent="#7C5540" />
            </View>
            <TextInput accessibilityLabel="Six character invite code" autoCapitalize="characters" autoCorrect={false} keyboardType="number-pad" maxLength={6} onChangeText={setCode} placeholder="SIX-DIGIT CODE" placeholderTextColor={colors.muted} style={[styles.input, styles.codeInput]} value={code} />
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !accepted }} disabled={!accepted} onPress={() => onComplete({ name: name.trim(), accent }, true)} style={[styles.primaryButton, !accepted && styles.disabled]}>
              <Text style={styles.primaryText}>Accept and enter the treehouse</Text>
            </Pressable>
            <Pressable onPress={() => setStep(1)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back</Text></Pressable>
            <Text style={styles.consentNote}>Pairing does not enable location sharing. Each monkey chooses that independently.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  progressTrack: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 10 },
  progressBar: { flex: 1, height: 4, borderRadius: 3, backgroundColor: colors.line },
  progressBarActive: { backgroundColor: colors.moss },
  page: { flexGrow: 1, padding: 25, paddingTop: 52, paddingBottom: 40 },
  kicker: { color: colors.moss, fontSize: 10, letterSpacing: 2.1, fontWeight: '900', textAlign: 'center' },
  title: { color: colors.ink, fontSize: 31, lineHeight: 36, letterSpacing: -1, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 30 },
  monkey: { height: 178, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.card, padding: 15, color: colors.ink, fontSize: 16, marginBottom: 23 },
  accentRow: { marginBottom: 30 },
  primaryButton: { backgroundColor: colors.mossDark, borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 'auto' },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.35 },
  secondaryButton: { alignItems: 'center', padding: 15 },
  secondaryText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  inviteCard: { backgroundColor: colors.lime, borderRadius: 25, padding: 30, alignItems: 'center', marginVertical: 30 },
  inviteLabel: { color: colors.mossDark, fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  inviteCode: { color: colors.ink, fontSize: 37, letterSpacing: 6, fontWeight: '900', marginVertical: 17 },
  inviteHint: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  pairScene: { height: 180, borderRadius: 27, backgroundColor: colors.lime, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 25 },
  pairPlus: { color: colors.mossDark, fontSize: 25, fontWeight: '900', marginHorizontal: -10, zIndex: 5 },
  codeInput: { textAlign: 'center', letterSpacing: 5, fontWeight: '800', fontSize: 19 },
  consentNote: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 16, marginTop: 12, paddingHorizontal: 18 },
});
