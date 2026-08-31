# Supabase private-alpha setup

The app is local-first and does not require a cloud account for prototype work.
The checked-in backend adapter becomes available only when public Supabase
configuration is present.

## Hosted development project

The shared development project is `MonkeyTracker` in `us-east-1`, with project
reference `gexgntxhrgywdqmaxrkf`. The schema migrations and checked-in Auth
configuration were deployed on 2026-08-27, including independent `avatar_accent`
fur and `avatar_skin` face colors. This workspace has an ignored `.env` containing
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
publication, current-state and 30-day history reads, and realtime subscriptions.
When both public environment values are present, the app automatically enables
the cloud sign-up/sign-in and real invite screens. Without them, it remains in
local simulator mode.

## Privacy boundaries

- Row-level security is mandatory and enabled by the migration.
- Only active members of the same two-person troop can read troop data.
- Leaving ends the troop for both members and immediately removes read access.
- Invite codes are stored as hashes and expire after 15 minutes.
- Exact location is stored only in `monkey_updates`; it must never be copied to
  analytics, logs, crash metadata, or notification previews.
- Client expiration improves the interface, while `expires_at` provides the
  server timestamp required for authoritative current-state queries.
- Timeline queries are limited to 30 days. Production needs a scheduled purge
  job and documented backup deletion policy before accepting real users.

## Still required before broader real-user testing

- Add a scheduled database purge for expired retention data.
- Configure Expo push credentials and private notification payloads.
- Run `backend:verify-hosted` after every RLS or pairing-function change.
- Complete abuse, deletion, export, recovery, and store-review checks.
