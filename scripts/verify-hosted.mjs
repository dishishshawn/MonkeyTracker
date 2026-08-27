import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anonKey || !serviceRoleKey) {
  throw new Error(
    'Set EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, and the temporary SUPABASE_SERVICE_ROLE_KEY before running this check.',
  );
}

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const admin = createClient(url, serviceRoleKey, options);
const clients = [createClient(url, anonKey, options), createClient(url, anonKey, options), createClient(url, anonKey, options)];
const userIds = [];
let troopId = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createTestUser(client, label, runId) {
  const email = `monkeytracker-${runId}-${label}@example.com`;
  const password = `Mt-${randomUUID()}-9!`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: `Test ${label}`, avatar_accent: '#996744' } },
  });
  if (error) throw error;
  if (data.user) userIds.push(data.user.id);
  assert(data.user && data.session, `Test ${label} did not receive an active session.`);
}

try {
  const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  await Promise.all([
    createTestUser(clients[0], 'alpha', runId),
    createTestUser(clients[1], 'partner', runId),
    createTestUser(clients[2], 'outsider', runId),
  ]);

  const [alpha, partner, outsider] = clients;
  const { data: invite, error: inviteError } = await alpha.rpc('create_troop_invite');
  if (inviteError) throw inviteError;
  assert(typeof invite === 'string' && /^\d{6}$/.test(invite), 'Invite code was not six digits.');

  const { data: acceptedTroopId, error: acceptError } = await partner.rpc('accept_troop_invite', { invite_code: invite });
  if (acceptError) throw acceptError;
  assert(typeof acceptedTroopId === 'string', 'Partner did not receive a troop ID.');
  troopId = acceptedTroopId;

  const { data: outsiderMemberships, error: outsiderReadError } = await outsider
    .from('troop_members')
    .select('troop_id')
    .eq('troop_id', troopId);
  if (outsiderReadError) throw outsiderReadError;
  assert(outsiderMemberships.length === 0, 'An unrelated user could read troop membership.');

  const { data: createdUpdate, error: createError } = await alpha
    .from('monkey_updates')
    .insert({
      troop_id: troopId,
      activity: 'Chilling',
      mood: 'Cozy',
      availability: 'Free',
      caption: 'Hosted RLS verification',
      location_level: 'Hidden',
      place: null,
      expiration: '1 hour',
      scene: 'Couch mode',
      pose: 'Waving',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();
  if (createError) throw createError;

  const { data: partnerRead, error: partnerReadError } = await partner
    .from('monkey_updates')
    .select('id')
    .eq('id', createdUpdate.id)
    .maybeSingle();
  if (partnerReadError) throw partnerReadError;
  assert(partnerRead?.id === createdUpdate.id, 'The paired partner could not read the shared update.');

  const { data: outsiderRead, error: outsiderUpdateReadError } = await outsider
    .from('monkey_updates')
    .select('id')
    .eq('id', createdUpdate.id);
  if (outsiderUpdateReadError) throw outsiderUpdateReadError;
  assert(outsiderRead.length === 0, 'An unrelated user could read a private update.');

  const { error: outsiderInsertError } = await outsider.from('monkey_updates').insert({
    troop_id: troopId,
    activity: 'Working',
    mood: 'Focused',
    availability: 'Busy',
    location_level: 'Hidden',
    expiration: '15 min',
    scene: 'Desk nest',
    pose: 'Locked in',
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
  assert(outsiderInsertError, 'An unrelated user was able to publish into the troop.');

  const { error: leaveError } = await alpha.rpc('leave_troop', { target_troop_id: troopId });
  if (leaveError) throw leaveError;
  const { data: formerMemberRead, error: formerMemberReadError } = await partner
    .from('monkey_updates')
    .select('id')
    .eq('id', createdUpdate.id);
  if (formerMemberReadError) throw formerMemberReadError;
  assert(formerMemberRead.length === 0, 'A former member retained access after the troop ended.');

  console.log('Hosted RLS verification passed: pair, share, outsider isolation, and post-unpair revocation.');
} finally {
  const cleanupErrors = [];
  if (troopId) {
    const { error } = await admin.from('troops').delete().eq('id', troopId);
    if (error) cleanupErrors.push(error);
  }
  const userCleanup = await Promise.all(userIds.map((userId) => admin.auth.admin.deleteUser(userId)));
  cleanupErrors.push(...userCleanup.flatMap(({ error }) => (error ? [error] : [])));
  if (cleanupErrors.length) throw new AggregateError(cleanupErrors, 'Hosted verification data could not be fully cleaned up.');
}
