# Monkey Tracker repository guide

Monkey Tracker is a consent-first presence-sharing app for couples. Read
`PRD.txt` before changing product behavior, and read `docs/HANDOFF.md` for the
current implementation snapshot and next work.

## Product rules

- Optimize for playful expression, not surveillance or productivity tracking.
- Release 0 supports exactly one private couple: the signed-in user and one
  explicitly consenting partner.
- Location is optional and off by default. Never make an update depend on it.
- Show sharing precision and expiration plainly. When a status expires, treat
  it as unknown; do not imply that the previous state is still current.
- Trail requires explicit opt-in, a clear disclosure, and a short expiration.
- Do not add guilt, punishment, streak pressure, or alerts that shame a partner
  for not sharing.
- Do not put exact location, private captions, or sensitive status content into
  analytics, logs, notification previews, or AI context.
- This is not an emergency, safety-monitoring, or proof-of-location service.

## Stack and structure

- Expo SDK 57, React Native 0.86, React 19, TypeScript in strict mode.
- `App.tsx` coordinates screens, modals, notifications, and the app state hook.
- `src/state/` owns the reducer and persistence-facing hook.
- `src/domain/` contains pure privacy, pairing, expiration, and retention rules.
- `src/storage/` owns local AsyncStorage persistence.
- `src/services/` is the optional Supabase boundary; local mode must keep
  working when public Supabase environment values are absent.
- `src/screens/` and `src/components/` own presentation.
- `src/types.ts` contains shared domain types.
- `src/theme.ts` contains design tokens.
- `src/components/` contains reusable UI primitives.
- `scripts/android-emulator.sh` launches the project-local Linux emulator.
- `.tools/` is machine-local tooling and must never be committed.

## Commands

Use Node 22.13 or newer. On a normal clone:

```sh
nvm use
npm ci
npm run verify
npm run web
```

This Codex workspace also has a Git-ignored Node installation. If `node` is not
already available, activate it with:

```sh
export PATH="$PWD/.tools/node/bin:$PATH"
```

Useful commands:

```sh
npm run verify       # TypeScript, domain tests, Expo dependency compatibility
npm test             # Fast privacy, consent, retention, and expiration tests
npm run backend:lint # Lint a linked/running Supabase database
npm run backend:push # Apply pending migrations to the linked Supabase project
npm run web          # Lightweight browser preview
npm run emulator     # Android emulator plus Expo Go on Linux
npm start            # Metro for a physical device or simulator
```

## Working agreement

1. Inspect the worktree and `docs/HANDOFF.md`; preserve unrelated user changes.
2. Check the relevant PRD section before changing product semantics.
3. Keep domain types explicit and UI accessible on narrow phone screens.
4. Run `npm run verify` after code or dependency changes. Exercise the changed
   flow in the web preview, and use Android for platform-specific behavior.
5. Update `docs/HANDOFF.md` when implementation state, decisions, limitations,
   or the recommended next task materially changes.
6. Never commit secrets, credentials, generated exports, `.tools/`, or local
   environment files.

The domain test suite does not replace component, end-to-end, RLS, notification,
or device testing. State exactly which layers were exercised.
