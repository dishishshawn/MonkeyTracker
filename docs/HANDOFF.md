# Monkey Tracker handoff

Last updated: 2026-08-27

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
- Five selectable monkey colorways, including a blue-fur and pink-blush
  `Blueberry blush` palette shared by local setup, cloud signup, and previews.
- Partner status card with freshness and location-precision labels.
- Update composer for activity, mood, availability, caption, location sharing,
  scene, pose, and expiration.
- Discrete expiration slider. Expired updates automatically become unknown and
  trigger an in-app notice; the web preview can also use browser notifications.
- Compact horizontal selectors with expanded activity, mood, room, pose, and
  scene-extra choices.
- Hidden, Perch, Nearby, and Trail sharing modes with explicit Trail disclosure.
- Reactions, a playful poke, and persistent privacy controls.
- AsyncStorage persistence for pairing, profile, preferences, current status,
  and timeline across reloads.
- Real local history with 30-day retention plus save and delete controls.
- Optional Supabase client services for email authentication, private invite
  pairing, update publication, history reads, unpairing, and realtime updates.
- Cloud sign-up/sign-in and pairing screens that activate automatically when a
  Supabase URL and public key are configured.
- A checked-in Supabase migration with hashed/expiring invite codes, two-person
  membership, authoritative timestamps, retention-aware reads, and RLS.
- A dedicated free Supabase development project (`gexgntxhrgywdqmaxrkf`) with
  the migration, Auth redirects, eight-character password minimum, no-confirm
  alpha signup, and Realtime publication deployed.
- A cleanup-safe hosted RLS verification script for paired, unrelated, and
  former-member access boundaries.

The source of truth for intended product behavior is `PRD.txt`. If this summary
conflicts with it, preserve the PRD guardrails and resolve the discrepancy.

## Architecture

`App.tsx` is now a small coordinator. Screens and modal UI live in
`src/screens/` and `src/components/`; the reducer and hook live in `src/state/`;
pure rules live in `src/domain/`; AsyncStorage is isolated in `src/storage/`;
and optional cloud calls live in `src/services/`.

This workspace's ignored `.env` activates the hosted account and pairing flow.
Fresh clones fall back to the local pairing simulator until their own ignored
environment file is configured; follow `docs/BACKEND.md`. Native background
notifications and real location services are not built.

## Validation baseline

At this checkpoint, TypeScript validation, thirteen tests, and production exports
for web and Android pass with the hosted public configuration. Auth health and
an unauthenticated RLS read were also checked against the live project. Run the
common local check with:

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

Vitest covers thirteen domain/reducer/mapping/colorway cases across expiration
boundaries, end-of-day behavior, retention, location privacy, explicit pairing
consent, and avatar palette fallback. `npm run backend:verify-hosted` covers live
pair acceptance, partner update visibility, outsider isolation, and post-unpair
revocation using temporary users that are deleted after the run. There are no component,
full UI end-to-end, or native-notification tests yet.

`npm audit --omit=dev` currently reports 10 moderate advisories inherited
through Expo tooling and its `xcode`/`uuid` chain, with no high or critical
findings. npm's suggested automatic resolution is an incompatible Expo
downgrade, so it was not applied.

## Recommended next work

1. Add native scheduled expiration/Trail notifications with private payloads.
2. Add a scheduled database purge for expired 30-day retention data.
3. Add component and full UI account/pairing tests around the hosted adapter.
4. Add real permission-gated Perch/location services only after device privacy
   and battery testing.
5. Configure production SMTP, abuse controls, deletion/export flows, and a
   separate production Supabase organization before inviting broader testers.

## Environment notes

- Required Node version is recorded in `.nvmrc`.
- This workspace's local Node, Android SDK, Java runtime, emulator, and Expo
  cache live under `.tools/` and are intentionally ignored.
- The hosted repository is `dishishshawn/MonkeyTracker` and is private.
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
