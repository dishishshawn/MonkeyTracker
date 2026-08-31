# Monkey Tracker handoff

Last updated: 2026-08-31

This file is the shared, tool-agnostic checkpoint for Codex, Claude Code, and
human contributors. Update it after material work so a new session can resume
without reconstructing the project from chat history.

## Current state

Release 0 is a polished, local-first Expo prototype with an active hosted
development backend. It runs in a lightweight browser preview and in Expo Go
on the project-local Android emulator.

Implemented:

- Three-step first-run flow: monkey customization, private invite, and explicit
  partner acceptance.
- Shared home stage with two expressive monkey avatars.
- Independent monkey appearance controls with six fur colors (including
  Blueberry blue and Bubblegum pink) and five face tones, shared by local
  setup, cloud signup, home, and update previews.
- Partner status card with freshness and location-precision labels.
- Update composer for activity, mood, availability, caption, location sharing,
  scene, pose, and expiration.
- Discrete expiration slider. Expired updates automatically become unknown and
  trigger an in-app notice; the web preview can also use browser notifications.
- Native scheduled reminders through Expo Notifications for status expiration,
  a five-minute Trail heads-up, and Trail end. Previews never contain a caption,
  a place, a photo, or any location value; the "Private notifications" switch
  additionally hides the activity. A third privacy switch, "Expiration
  reminders", turns the whole set off, and leaving a troop cancels every pending
  reminder.
- Compact horizontal selectors with expanded activity, mood, room, pose, and
  scene-extra choices.
- Hidden, Perch, Nearby, and Trail sharing modes with explicit Trail disclosure.
- Realtime reactions and pokes delivered to the recipient’s own monkey, plus
  persistent privacy controls.
- Animated reaction bursts and poke nudges, activity-driven stage details,
  per-status accessories, and shared room decorations.
- Four built-in quick scenes and up to six locally persisted custom presets.
- Optional private photo postcards selected through Expo Image Picker and
  delivered through one-hour signed URLs from a troop-scoped Storage bucket.
- AsyncStorage persistence for pairing, profile, preferences, current status,
  and timeline across reloads.
- Real local history with 30-day retention plus save and delete controls.
- Optional Supabase client services for email authentication, private invite
  pairing, per-account update publication/reads, history, unpairing, and
  realtime status/interaction delivery.
- Cloud sign-up/sign-in and pairing screens that activate automatically when a
  Supabase URL and public key are configured.
- A checked-in Supabase migration with hashed/expiring invite codes, two-person
  membership, authoritative timestamps, retention-aware reads, and RLS.
- A dedicated free Supabase development project (`gexgntxhrgywdqmaxrkf`) with
  the migration, Auth redirects, eight-character password minimum, no-confirm
  alpha signup, and Realtime publication deployed.
- An additive `avatar_skin` migration with defaults for existing profiles and
  compatibility for the brief combined `blue-pink` appearance value.
- A `monkey_interactions` migration with recipient-scoped RLS and Realtime
  delivery for reactions and pokes.
- A status-personality/postcard migration adding constrained accessory and room
  fields plus private Storage object policies.
- A cleanup-safe hosted RLS verification script for paired, unrelated, and
  former-member access boundaries, now also covering the daily poke limit.
- A retention migration adding `public.purge_expired_monkey_data()`, a daily
  pg_cron schedule for it, and a three-per-rolling-24-hours poke cap enforced by
  the interaction insert policy through `public.pokes_sent_recently()`.
- `npm run backend:purge-postcards`, a service-role job that removes postcard
  objects no surviving update references, with a dry-run mode and a refusal to
  act when it reads objects but no references at all.

The source of truth for intended product behavior is `PRD.txt`. If this summary
conflicts with it, preserve the PRD guardrails and resolve the discrepancy.

## Architecture

`App.tsx` coordinates account state, separate self/partner updates, realtime
interactions, screens, and modals. Screen and modal UI live in
`src/screens/` and `src/components/`; the reducer and hook live in `src/state/`;
pure rules live in `src/domain/`; AsyncStorage is isolated in `src/storage/`;
and optional cloud calls live in `src/services/`.

This workspace's ignored `.env` activates the hosted account and pairing flow.
Fresh clones fall back to the local pairing simulator until their own ignored
environment file is configured; follow `docs/BACKEND.md`. Remote push
notifications and real location services are still not built: scheduled
reminders are local-only, are rebuilt from the current update whenever it or the
preferences change, and are skipped entirely on web, where the existing browser
`Notification` path still runs.

## Validation baseline

At this checkpoint, TypeScript validation, twenty-one tests, Expo dependency
validation, and a production web export pass with the hosted public
configuration. `expo install --fix` moved `expo`, `@expo/metro-runtime`, and
`react-native` to their SDK 57 expected patch versions, which had drifted and
was failing `npm run verify` before this session's changes. The latest hosted
migrations are deployed and `supabase db lint --linked --level error` reports no
schema errors. Run the common local check with:

```sh
npm run verify
```

For a lightweight UI pass:

```sh
npm run web
```

For device behavior on this Linux workspace:

```sh
npm run emulator
```

Vitest covers twenty-one domain/reducer/mapping/appearance cases across
expiration boundaries, end-of-day behavior, retention, location privacy,
explicit pairing consent, quick-scene persistence, avatar palette fallback, and
scheduled-notification planning, including the assertion that no planned preview
can contain a caption or a place.
`npm run backend:verify-hosted` now covers live pairing, per-user status reads,
interactions, private postcard access, outsider isolation, and post-unpair
revocation using temporary users deleted in `finally`; it was updated but not
rerun after the latest two migrations because a service-role key was not placed
in this workspace. The retention/poke migration and the postcard purge job were
written but never executed: `backend:push`, `backend:lint`, and
`backend:verify-hosted` all need credentials this workspace does not hold, so
the SQL has not been parsed by a real Postgres and the purge job has not talked
to a real bucket. Treat both as unverified until item 2 below runs. There are no
component, full UI end-to-end, or native-notification tests yet. The newest Android export was not rerun after
adding Expo Image Picker or Expo Notifications.

The notification work was exercised only through the pure planner tests and a
web smoke test: a production web export was served locally and loaded in Chrome,
where the app booted to the cloud sign-up screen with no console errors and one
benign `[expo-notifications] Listening to push token changes is not yet fully
supported on web` warning emitted at import time. Nothing schedules on web, so
the delivery path itself is untested; it needs an Android or iOS device run.

`npm audit --omit=dev` currently reports 10 moderate advisories inherited
through Expo tooling and its `xcode`/`uuid` chain, with no high or critical
findings. npm's suggested automatic resolution is an incompatible Expo
downgrade, so it was not applied.

## Recommended next work

1. Manually regression-test the two-account browser flow: self/partner status,
   signed postcard upload/display/removal, saved quick scenes, accessories,
   décor, reaction bursts, and poke nudges.
2. Run `backend:push` for the retention/poke migration, then
   `backend:lint`, `backend:verify-hosted` (which now asserts the poke cap), and
   `backend:purge-postcards -- --dry-run`, all with a temporary service-role key.
   Confirm `cron.job` actually holds `monkey-retention-purge`; the migration
   downgrades a pg_cron failure to a notice, so a missing schedule is silent.
   Rerun the Android export/device smoke test after the Image Picker addition.
3. Run the notification flow on a device: confirm the Android `monkey-status`
   channel, the permission prompt on first publish, a delivered Trail warning
   and Trail-end pair, and that a denied permission degrades silently.
4. Add component and full UI account/pairing tests around the hosted adapter.
5. Add real permission-gated Perch/location services only after device privacy
   and battery testing.
6. Configure production SMTP, abuse controls, deletion/export flows, and a
   separate production Supabase organization before inviting broader testers.

## Environment notes

- Required Node version is recorded in `.nvmrc`.
- This workspace's local Node, Android SDK, Java runtime, emulator, and Expo
  cache live under `.tools/` and are intentionally ignored.
- The hosted repository is `dishishshawn/MonkeyTracker` and is private.
- The latest feature implementation commit is
  `4bf8357` (`feat: enforce 30-day retention and the daily poke limit`),
  preceded by `b039fd0` (`feat: schedule private expiration and Trail
  reminders`); later commits may update handoff docs.
- The hosted development backend is Supabase project `gexgntxhrgywdqmaxrkf`;
  public app values live only in ignored `.env` files.
- This managed Codex workspace uses `.git-local` because `.git` is an immutable
  mount. A normal clone, including one opened with Claude Code, should use the
  standard `.git` directory and ordinary Git commands.

## End-of-session checklist

- Summarize what changed and why.
- Record new decisions, known regressions, and the best next task in this file.
- Run `npm run verify` and state any manual checks actually performed.
- Confirm no secrets or machine-local files entered Git.
- Leave the worktree in an understandable state, with a focused commit when the
  user asked for repository publication.
