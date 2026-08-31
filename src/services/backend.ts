import { RealtimeChannel } from '@supabase/supabase-js';
import { expirationDate } from '../domain/updates';
import { MonkeyUpdate } from '../types';
import { requireSupabase } from './supabase';

export interface RemoteUpdate {
  id: string;
  troop_id: string;
  user_id: string;
  activity: string;
  mood: string;
  availability: string;
  caption: string | null;
  location_level: string;
  place: string | null;
  expiration: string;
  scene: string;
  pose: string;
  accessory: string;
  room_decor: string;
  photo_path: string | null;
  photo_url?: string | null;
  updated_at: string;
  expires_at: string;
  created_at: string;
}

export interface RemoteProfile {
  id: string;
  display_name: string;
  avatar_accent: string;
  avatar_skin: string;
}

export interface ActiveTroop {
  troopId: string;
  memberCount: number;
}

export interface RemoteInteraction {
  id: string;
  troop_id: string;
  sender_id: string;
  recipient_id: string;
  kind: 'reaction' | 'poke';
  reaction: string | null;
  created_at: string;
}

export async function signUpWithEmail(email: string, password: string, displayName: string, avatarAccent: string, avatarSkin: string): Promise<void> {
  const { error } = await requireSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim(), avatar_accent: avatarAccent, avatar_skin: avatarSkin } },
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function requestEmailSignIn(email: string): Promise<void> {
  const client = requireSupabase();
  const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();
  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function loadMyProfile(): Promise<RemoteProfile | null> {
  const { data: authData, error: authError } = await requireSupabase().auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;
  const { data, error } = await requireSupabase().from('profiles').select('id, display_name, avatar_accent, avatar_skin').eq('id', authData.user.id).maybeSingle();
  if (error) throw error;
  return data as RemoteProfile | null;
}

export async function loadPartnerProfile(troopId: string): Promise<RemoteProfile | null> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data: members, error: memberError } = await client
    .from('troop_members')
    .select('user_id')
    .eq('troop_id', troopId)
    .is('left_at', null)
    .neq('user_id', authData.user.id)
    .limit(1);
  if (memberError) throw memberError;
  const partnerId = members?.[0]?.user_id;
  if (!partnerId) return null;

  const { data, error } = await client
    .from('profiles')
    .select('id, display_name, avatar_accent, avatar_skin')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) throw error;
  return data as RemoteProfile | null;
}

export async function loadActiveTroop(): Promise<ActiveTroop | null> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;
  const { data: membership, error } = await client.from('troop_members').select('troop_id').eq('user_id', authData.user.id).is('left_at', null).maybeSingle();
  if (error) throw error;
  if (!membership) return null;
  const { count, error: countError } = await client.from('troop_members').select('*', { count: 'exact', head: true }).eq('troop_id', membership.troop_id).is('left_at', null);
  if (countError) throw countError;
  return { troopId: membership.troop_id as string, memberCount: count ?? 0 };
}

export async function createTroopInvite(): Promise<string> {
  const { data, error } = await requireSupabase().rpc('create_troop_invite');
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Supabase did not return an invite code.');
  return data;
}

export async function acceptTroopInvite(code: string): Promise<string> {
  const { data, error } = await requireSupabase().rpc('accept_troop_invite', { invite_code: code.trim() });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Supabase did not return a troop ID.');
  return data;
}

export async function leaveTroop(troopId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('leave_troop', { target_troop_id: troopId });
  if (error) throw error;
}

export async function publishRemoteUpdate(troopId: string, update: MonkeyUpdate): Promise<RemoteUpdate> {
  let photoPath = update.photoPath || '';
  if (update.photoUri && !photoPath) photoPath = await uploadPhotoPostcard(troopId, update.photoUri);
  const payload = {
    troop_id: troopId,
    activity: update.activity,
    mood: update.mood,
    availability: update.availability,
    caption: update.caption || null,
    location_level: update.locationLevel,
    place: update.locationLevel === 'Hidden' ? null : update.place,
    expiration: update.expiration,
    scene: update.scene,
    pose: update.pose,
    accessory: update.accessory,
    room_decor: update.roomDecor,
    photo_path: photoPath || null,
    updated_at: update.updatedAt,
    expires_at: expirationDate(update).toISOString(),
  };
  const { data, error } = await requireSupabase().from('monkey_updates').insert(payload).select().single();
  if (error) throw error;
  return (await attachSignedPhotoUrls([data as RemoteUpdate]))[0] as RemoteUpdate;
}

export async function loadRemoteTimeline(troopId: string): Promise<RemoteUpdate[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await requireSupabase().from('monkey_updates').select('*').eq('troop_id', troopId).gte('created_at', since).order('created_at', { ascending: false });
  if (error) throw error;
  return attachSignedPhotoUrls((data ?? []) as RemoteUpdate[]);
}

export async function loadCurrentRemoteUpdates(troopId: string): Promise<RemoteUpdate[]> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];
  const { data, error } = await client.from('monkey_updates').select('*').eq('troop_id', troopId).neq('user_id', authData.user.id).gt('expires_at', new Date().toISOString()).order('updated_at', { ascending: false });
  if (error) throw error;
  return attachSignedPhotoUrls((data ?? []) as RemoteUpdate[]);
}

export async function loadMyCurrentRemoteUpdates(troopId: string): Promise<RemoteUpdate[]> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];
  const { data, error } = await client.from('monkey_updates').select('*').eq('troop_id', troopId).eq('user_id', authData.user.id).gt('expires_at', new Date().toISOString()).order('updated_at', { ascending: false });
  if (error) throw error;
  return attachSignedPhotoUrls((data ?? []) as RemoteUpdate[]);
}

async function uploadPhotoPostcard(troopId: string, uri: string): Promise<string> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign in before sharing a postcard.');
  const response = await fetch(uri);
  if (!response.ok) throw new Error('The selected postcard could not be opened.');
  const blob = await response.blob();
  if (blob.size > 5 * 1024 * 1024) throw new Error('Postcards must be smaller than 5 MB.');
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/gif' ? 'gif' : 'jpg';
  const path = `${troopId}/${authData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const { error } = await client.storage.from('monkey-postcards').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

async function attachSignedPhotoUrls(rows: RemoteUpdate[]): Promise<RemoteUpdate[]> {
  const client = requireSupabase();
  return Promise.all(rows.map(async (row) => {
    if (!row.photo_path) return { ...row, photo_url: null };
    const { data, error } = await client.storage.from('monkey-postcards').createSignedUrl(row.photo_path, 60 * 60);
    return { ...row, photo_url: error ? null : data.signedUrl };
  }));
}

export async function sendTroopInteraction(troopId: string, recipientId: string, kind: RemoteInteraction['kind'], reaction?: string): Promise<void> {
  const { error } = await requireSupabase().from('monkey_interactions').insert({
    troop_id: troopId,
    recipient_id: recipientId,
    kind,
    reaction: kind === 'reaction' ? reaction : null,
  });
  if (error) throw error;
}

export async function deleteRemoteUpdate(updateId: string): Promise<void> {
  const client = requireSupabase();
  const { data: update } = await client.from('monkey_updates').select('photo_path').eq('id', updateId).maybeSingle();
  const { error } = await client.from('monkey_updates').delete().eq('id', updateId);
  if (error) throw error;
  if (update?.photo_path) await client.storage.from('monkey-postcards').remove([update.photo_path]);
}

export function subscribeToTroopUpdates(troopId: string, onChange: () => void): RealtimeChannel {
  return requireSupabase()
    .channel(`troop-updates:${troopId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'monkey_updates', filter: `troop_id=eq.${troopId}` }, onChange)
    .subscribe();
}

export function subscribeToTroopInteractions(troopId: string, onInteraction: (interaction: RemoteInteraction) => void): RealtimeChannel {
  return requireSupabase()
    .channel(`troop-interactions:${troopId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'monkey_interactions', filter: `troop_id=eq.${troopId}` }, (payload) => onInteraction(payload.new as RemoteInteraction))
    .subscribe();
}

export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await requireSupabase().removeChannel(channel);
}
