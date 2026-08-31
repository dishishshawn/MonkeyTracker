// Removes private postcard objects that no surviving update references.
//
// The SQL retention purge deletes aged-out `monkey_updates` rows but leaves
// their postcards behind, because `storage.objects` belongs to the storage
// admin role and a SQL delete would strip the row while leaving the file. This
// job goes through the Storage API instead, so the file itself is gone.
//
// Requires a temporary service-role key. Pass --dry-run to list without
// deleting; that is the recommended first run against any project.

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRoleKey) {
  throw new Error(
    'Set EXPO_PUBLIC_SUPABASE_URL and the temporary SUPABASE_SERVICE_ROLE_KEY before running this job.',
  );
}

const dryRun = process.argv.includes('--dry-run');
const BUCKET = 'monkey-postcards';
const PAGE_SIZE = 100;

// `publishRemoteUpdate` uploads the object before inserting the row that points
// at it, so anything younger than this could be an upload still in flight.
const UPLOAD_GRACE_MS = 24 * 60 * 60 * 1000;

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Storage listing is one directory level at a time; postcards live at troop/user/file. */
async function listFolder(prefix) {
  const found = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await admin.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    if (!data || data.length === 0) return found;
    found.push(...data.map((entry) => ({ ...entry, path: prefix ? `${prefix}/${entry.name}` : entry.name })));
    if (data.length < PAGE_SIZE) return found;
  }
}

async function listAllPostcards() {
  const files = [];
  for (const troop of await listFolder('')) {
    if (troop.id !== null) continue; // A folder, not a file.
    for (const user of await listFolder(troop.path)) {
      if (user.id !== null) continue;
      for (const file of await listFolder(user.path)) {
        if (file.id === null) continue;
        files.push(file);
      }
    }
  }
  return files;
}

async function referencedPaths() {
  const referenced = new Set();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from('monkey_updates')
      .select('photo_path')
      .not('photo_path', 'is', null)
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) return referenced;
    for (const row of data) referenced.add(row.photo_path);
    if (data.length < 1000) return referenced;
  }
}

const files = await listAllPostcards();
const referenced = await referencedPaths();

// A read that returned nothing is far more likely to be a broken query than a
// project where every single postcard went orphaned at once, and acting on it
// would delete live postcards. Refuse instead.
if (files.length > 0 && referenced.size === 0) {
  throw new Error(
    `Found ${files.length} postcard objects but no update references any of them. Refusing to purge; check that the service-role key can read monkey_updates.`,
  );
}

const cutoff = Date.now() - UPLOAD_GRACE_MS;
const orphans = files.filter((file) => {
  if (referenced.has(file.path)) return false;
  const created = new Date(file.created_at ?? 0).getTime();
  return Number.isFinite(created) && created < cutoff;
});

console.log(`${files.length} postcard objects, ${referenced.size} referenced, ${orphans.length} orphaned beyond the upload grace period.`);

if (orphans.length === 0) {
  console.log('Nothing to purge.');
} else if (dryRun) {
  for (const orphan of orphans) console.log(`would remove ${orphan.path}`);
  console.log('Dry run: nothing was deleted.');
} else {
  for (let index = 0; index < orphans.length; index += PAGE_SIZE) {
    const batch = orphans.slice(index, index + PAGE_SIZE).map((orphan) => orphan.path);
    const { error } = await admin.storage.from(BUCKET).remove(batch);
    if (error) throw error;
    console.log(`Removed ${batch.length} orphaned postcards.`);
  }
}
