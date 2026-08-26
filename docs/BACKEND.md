# Supabase private-alpha setup

The app is local-first and does not require a cloud account for prototype work.
The checked-in backend adapter becomes available only when public Supabase
configuration is present.

## Configure a development project

1. Create a Supabase project intended for development, not production data.
2. Authenticate with `npx supabase login`, link with `npx supabase link`, then
   apply the checked-in migration with `npm run backend:push`.
3. Copy `.env.example` to `.env` and add the project URL and publishable/anon
   client key. Never use a service-role key in an Expo app.
4. Configure the authentication redirect URL from `.env` in the Supabase Auth
   URL allow list.
5. Restart Expo after changing environment values.

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

## Still required before real-user testing

- Add a scheduled database purge for expired retention data.
- Configure Expo push credentials and private notification payloads.
- Run RLS tests with two paired users, an unrelated user, and a former member.
- Complete abuse, deletion, export, recovery, and store-review checks.
