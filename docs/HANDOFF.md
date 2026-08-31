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

At this checkpoint, TypeScript validation, twenty-three tests, Expo dependency
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

Vitest covers twenty-three domain/reducer/mapping/appearance cases across
expiration boundaries, end-of-day behavior, retention, location privacy,
explicit pairing consent, quick-scene persistence, avatar palette fallback, and
scheduled-notification planning, and shared-timeline authorship, including the
assertion that no planned preview can contain a caption or a place.
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

A two-account browser pass ran against the hosted project with the two
accounts isolated by origin (`localhost:4599` and `127.0.0.1:4599` serve the
same export but hold separate `localStorage`, so each tab keeps its own
session). It confirmed live pairing, realtime partner sync with no reload,
`Hidden` precision surviving the round trip and being labeled as such, and the
expired partner card degrading to "Current status unknown". It also found and
fixed two presentation bugs described below. The poke cap could not be
exercised: `pokes_sent_recently` returns PostgREST `PGRST202` on the hosted
project because the retention/poke migration is still unpushed, so four
consecutive pokes were accepted. `remainingPokes()` failing that way degrades to
the plain "Poke sent" copy rather than an error, which is the intended
fallback. Poke *receipt* on the partner device was not confirmed; the toast is
transient and was checked too late.

Two bugs that pass came from that session and are now fixed. `remoteCurrent`
returns `createInitialUpdate(new Date(0))` when a partner has no active update,
and the partner card formatted that epoch as "Updated 20696 days ago"; the card
now shows "No current update" whenever the status is expired, so an unknown
state never carries a confident age. Separately, `loadRemoteTimeline` filters on
`troop_id` only — correct, because PRD 11.6 makes Monkey Business a shared
timeline — but the screens rendered every entry as the reader's own, labeled
"saved on this device", and offered "Delete my update" on the partner's posts.
`TimelineEntry` now carries `mine`, set by comparing `row.user_id` against the
signed-in user; Home and History name the author, and delete is restricted to
the author's own entries. Timeline entries persisted before this change default
to `mine: true`, which is right because local-only history was always the
reader's own.

The emoji-and-rectangle placeholder art is gone. `src/illustration/` holds
three components ported from a Claude Design illustration system: `Monkey`
(a layered figure — fur and face tone are color props, with activity, pose and
accessory composed over the base at fixed anchors, plus five eye and five mouth
shapes driving mood), `Stage` (six scenes plus an unknown state, all on one
grammar with a shared horizon at y=150 so two different scenes can butt
together mid-card), and `Mark` (24 glyphs at one ink weight: availability,
location precision, mood, decor). They render through `react-native-svg`.

The expired state is drawn, not faded: the figure keeps full posture, size and
ink line, and only the color fields empty to paper, with three soft dots
overhead. Nothing dims, greys, or slumps. `HomeScreen` passes `unknown` to the
stage, the stage avatar AND the partner-card avatar, so an expired status never
shows stale color anywhere.

Two mapping gaps the illustration system did not cover, both approximated in
`src/illustration/marks.ts`: it shipped `Fizzy` and `Melted` moods, which this
app does not have, and drew nothing for `Social` or `Quiet` (Social borrows the
fizzy mark and a chatty open mouth; Quiet uses the melted mark and the neutral
Calm face). Its decor set is generic (stack, lamp, mug, rug, window) rather than
this app's four, so only `Plant` is exact — `String lights`, `Poster` and
`Plushie` borrow the nearest shape. Both are worth a follow-up design pass.

Two features from `PRD-NEXT.txt` are built. Idle life (section 3) gives the
figure continuous breathing and blinking driven only by inputs that change
without anyone acting; it runs on the same native-driver transform as the poke
and reaction animations, so it never re-renders the SVG. Drowsiness after 22:00
applies to the viewer's own monkey only, because partner timezone sharing does
not exist yet and a partner's monkey settling on our clock would be a claim
about their night we cannot substantiate. Both animation gates fail open: a
missing or throwing reduce-motion implementation, and any app state other than
`background`, are treated as "animate". The strict version froze the stage
outright on web. Low power mode is NOT yet honoured; it needs `expo-battery`.

Combination states (section 5) pair the two panels. A shared scene draws the
scene props once, so the halves read as one continuous world instead of the
same picture twice; a shared activity steps both monkeys 16px toward each
other. `combinationState` is pure and tested, including that expiry ends a
combination immediately — a pair state that outlives a participant would imply
presence the product knows is gone. Combinations are emergent by design: never
announced, never named in copy, and never pairing on mood or accessory, since
anything a user could deliberately match on becomes pressure to match.

Both were verified in the browser by DOM measurement rather than screenshots,
which is the only way several of these bugs were visible: a visible tab
breathes and blinks while a hidden one is completely static, and with both
partners on Café the right panel drops to seven elements (sky, hills, horizon)
against the left panel's eighteen. Note that react-native-web compiles static
StyleSheet entries to CSS classes, so `element.style.transform` shows only
Animated values — use `getComputedStyle` when checking layout styles.

`npm audit --omit=dev` currently reports 10 moderate advisories inherited
through Expo tooling and its `xcode`/`uuid` chain, with no high or critical
findings. npm's suggested automatic resolution is an incompatible Expo
downgrade, so it was not applied.

## Recommended next work

1. Finish the two-account browser regression: pairing, partner sync, location
   precision, expiration, and shared-timeline authorship were covered this
   session, but signed postcard upload/display/removal, saved quick scenes,
   accessories, décor, and reaction bursts were not. Poke receipt on the
   recipient device still needs a deliberate check.
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
