import { useCallback, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  acceptTroopInvite,
  ActiveTroop,
  createTroopInvite,
  leaveTroop,
  loadActiveTroop,
  loadMyProfile,
  loadPartnerProfile,
  RemoteProfile,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../services/backend';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export function useCloudAccount() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<RemoteProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<RemoteProfile | null>(null);
  const [troop, setTroop] = useState<ActiveTroop | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      setSession(data.session);
      if (!data.session) {
        setProfile(null);
        setPartnerProfile(null);
        setTroop(null);
        return;
      }
      const [nextProfile, nextTroop] = await Promise.all([loadMyProfile(), loadActiveTroop()]);
      setProfile(nextProfile);
      setTroop(nextTroop);
      setPartnerProfile(nextTroop?.memberCount && nextTroop.memberCount >= 2 ? await loadPartnerProfile(nextTroop.troopId) : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the cloud account.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) void refresh();
      else {
        setProfile(null);
        setPartnerProfile(null);
        setTroop(null);
        setLoading(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await operation();
      await refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Supabase could not complete that request.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return useMemo(() => ({
    configured: isSupabaseConfigured,
    session,
    profile,
    partnerProfile,
    troop,
    loading,
    error,
    ready: Boolean(session && troop && troop.memberCount >= 2),
    refresh,
    signIn: (email: string, password: string) => run(() => signInWithEmail(email, password)),
    signUp: (email: string, password: string, displayName: string, accent: string, skin: string) => run(() => signUpWithEmail(email, password, displayName, accent, skin)),
    signOut: () => run(signOut),
    createInvite: async () => {
      let code = '';
      const succeeded = await run(async () => { code = await createTroopInvite(); });
      if (!succeeded) return '';
      return code;
    },
    acceptInvite: (code: string) => run(async () => { await acceptTroopInvite(code); }),
    leave: () => troop ? run(() => leaveTroop(troop.troopId)) : Promise.resolve(true),
  }), [error, loading, partnerProfile, profile, refresh, run, session, troop]);
}
