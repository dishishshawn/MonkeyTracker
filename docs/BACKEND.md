# Supabase private-alpha setup

The app is local-first and does not require a cloud account for prototype work.
The checked-in backend adapter becomes available only when public Supabase
configuration is present.

## Hosted development project

The shared development project is `MonkeyTracker` in `us-east-1`, with project
reference `gexgntxhrgywdqmaxrkf`. The schema migrations and checked-in Auth
configuration are deployed, including independent `avatar_accent` fur and
`avatar_skin` face colors, private realtime reactions and pokes, status
accessories/decor, and the private `monkey-postcards` Storage bucket. This
workspace has an ignored `.env` containing
only the public project URL and anon client key. Supabase access tokens, database
passwords, and service-role keys must never enter Git or the Expo environment.

## Configure a development project

1. Create a Supabase project intended for development, not production data.
2. Authenticate with `npx supabase login`, link with
   `npx supabase link --project-ref gexgntxhrgywdqmaxrkf`, then apply the
   checked-in migration with `npm run backend:push`.
3. Copy `.env.example` to `.env` and add the project URL and publishable/anon
   client key. Never use a service-role key in an Expo app.
4. Configure the authentication redirect URL from `.env` in the Supabase Auth
   URL allow list.
5. Restart Expo after changing environment values. `npm run web` clears the
   Metro cache automatically so the rebuilt browser bundle uses the new public
   settings.

Apply checked-in hosted Auth settings after reviewing the diff with:

```sh
npx supabase config push --project-ref gexgntxhrgywdqmaxrkf
```

For a disposable hosted integration pass, temporarily expose the project's
service-role key to one command. The script creates three random test users,
checks couple access and outsider isolation, verifies access revocation after
unpairing, and deletes all test data in `finally`:

```sh
SUPABASE_SERVICE_ROLE_KEY='temporary-value' npm run backend:verify-hosted
```

Use the key only in the shell environment. Never add it to `.env`, source code,
logs, CI output, or the Expo client.

`src/services/backend.ts` exposes email/password and email-OTP authentication,
profile/troop reads, invite creation and acceptance, unpairing, update
publication, separate self/partner current-state reads, 30-day history reads,
private interaction delivery, signed postcard URLs, and realtime subscriptions.
When both public environment values are present, the app automatically enables
the cloud sign-up/sign-in and real invite screens. Without them, it remains in
local simulator mode.

## Privacy boundaries

- Row-level security is mandatory and enabled by the migration.
- Only active members of the same two-person troop can read troop data.
- Reactions and pokes can only be sent to the other active member of the troop.
- Postcards live in a non-public Storage bucket. Object paths are scoped by
  troop and owner, uploads are limited to images under 5 MB, and access ends
  when troop membership ends.
- Leaving ends the troop for both members and immediately removes read access.
- Invite codes are stored as hashes and expire after 15 minutes.
- Exact location is stored only in `monkey_updates`; it must never be copied to
  analytics, logs, crash metadata, or notification previews.
- Client expiration improves the interface, while `expires_at` provides the
  server timestamp required for authoritative current-state queries.
- Timeline queries are limited to 30 days, and `public.purge_expired_monkey_data()`
  now deletes what has aged past that window. Production still needs a
  documented backup deletion policy before accepting real users.
- Pokes are capped at three per sender per rolling 24 hours by the interaction
  insert policy, which calls `public.pokes_sent_recently()`. The client shows
  the remaining count and turns the rejection into a light message rather than
  an error.

## Retention jobs

Two jobs together enforce the 30-day promise.

`public.purge_expired_monkey_data()` deletes `monkey_updates` and
`monkey_interactions` rows older than 30 days. The migration schedules it daily
at 04:20 UTC through pg_cron under the job name `monkey-retention-purge`. If the
project has no pg_cron, the migration still applies and emits a notice; schedule
the function some other way and confirm with:

```sql
select jobname, schedule, command from cron.job;
select * from public.purge_expired_monkey_data();
```

Postcard objects are cleaned up separately, by a service-role job rather than by
SQL. `storage.objects` belongs to `supabase_storage_admin`, so a purge running as
`postgres` is subject to its row-level security: an orphan query that reads no
rows would treat every live postcard as an orphan, and deleting the row would
leave the underlying file behind anyway. The job goes through the Storage API
instead, and refuses to act if it finds objects but no update references any of
them. Dry-run it first:

```sh
SUPABASE_SERVICE_ROLE_KEY=... npm run backend:purge-postcards -- --dry-run
SUPABASE_SERVICE_ROLE_KEY=... npm run backend:purge-postcards
```

It skips anything uploaded in the last 24 hours, because `publishRemoteUpdate`
uploads the object before inserting the row that points at it. Remove the
service-role key from the environment afterwards; it must never enter Git.

## Still required before broader real-user testing

- Schedule `backend:purge-postcards` on a host that can hold a service-role key.
- Configure Expo push credentials and private notification payloads.
- Run `backend:verify-hosted` after every RLS or pairing-function change.
- Complete abuse, deletion, export, recovery, and store-review checks.
