# Monkey Tracker handoff

Last updated: 2026-08-26

This file is the shared, tool-agnostic checkpoint for Codex, Claude Code, and
human contributors. Update it after material work so a new session can resume
without reconstructing the project from chat history.

## Current state

Release 0 is a polished, local-only Expo prototype. It runs in a lightweight
browser preview and in Expo Go on the project-local Android emulator.

Implemented:

- Three-step first-run flow: monkey customization, private invite, and explicit
  partner acceptance.
- Shared home stage with two expressive monkey avatars.
- Partner status card with freshness and location-precision labels.
- Update composer for activity, mood, availability, caption, location sharing,
  scene, pose, and expiration.
- Discrete expiration slider. Expired updates automatically become unknown and
  trigger an in-app notice; the web preview can also use browser notifications.
- Compact horizontal selectors with expanded activity, mood, room, pose, and
  scene-extra choices.
- Hidden, Perch, Nearby, and Trail sharing modes with explicit Trail disclosure.
- Reactions, a playful poke, privacy controls, and a small timeline preview.

The source of truth for intended product behavior is `PRD.txt`. If this summary
conflicts with it, preserve the PRD guardrails and resolve the discrepancy.

## Architecture

`App.tsx` is currently a prototype monolith: it contains the screen flow,
in-memory state, expiry timer, browser notification integration, and most UI.
Reusable pieces live in `src/components/`; domain types and tokens live in
`src/types.ts` and `src/theme.ts`.

There is no backend or persistent local storage. Reloading the app resets state.
Authentication, invitations, pairing, realtime sync, database-enforced expiry,
native background notifications, and real location services are not built.

## Validation baseline

At this checkpoint, TypeScript validation and production exports for web and
Android pass. Run the common local check with:

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

There are no automated unit, component, or end-to-end tests yet.

## Recommended next work

1. Split `App.tsx` into screens, focused components, and a small state hook or
   reducer without changing the current visual behavior.
2. Add local persistence so onboarding, preferences, and the latest status
   survive reloads. Keep expiration semantics based on absolute timestamps.
3. Add tests for expiration boundaries, location-off behavior, and onboarding
   consent before extending the feature surface.
4. Turn the timeline preview into real local history with explicit retention
   and delete controls.
5. Only then introduce the private-alpha backend: authentication, one-couple
   pairing, row-level access control, realtime updates, and server-enforced TTL.

Before any backend work, record the proposed data model and privacy boundaries
here. Exact location must have narrow access, short retention, and no analytics
or log leakage.

## Environment notes

- Required Node version is recorded in `.nvmrc`.
- This workspace's local Node, Android SDK, Java runtime, emulator, and Expo
  cache live under `.tools/` and are intentionally ignored.
- The hosted repository is `dishishshawn/MonkeyTracker` and is private.
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
