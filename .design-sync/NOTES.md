# design-sync notes — monkey-tracker

## What this repo is

Not a design-system package: an Expo/React Native app (`private: true`, `main`
points at Expo's `AppEntry`, no `exports`/`dist`). The sync is deliberately
**narrow** — only the presentational primitives that render with no app state,
storage, or Expo native modules:

- `Chip`, `MonkeyAvatar`, `BottomNavigation`

Deliberately excluded, because they need AsyncStorage, Supabase, `Alert`,
`Modal`, or `expo-image-picker`: `ComposerModal`, `PrivacyModal`,
`PairingSetup`, `MonkeyAppearancePicker`, and all three screens.

## Build mechanics

- No `dist/`. The converter runs against `.design-sync/entry.tsx`, a hand-written
  barrel: `--entry ./.design-sync/entry.tsx`.
- `react-native` is aliased to `react-native-web` through
  `.design-sync/tsconfig.ds-sync.json`'s `compilerOptions.paths`, which the
  converter's `tsconfigPathsPlugin` picks up. No lib fork needed.
- Node lives at `.tools/node/bin` in this workspace: `export PATH="$PWD/.tools/node/bin:$PATH"`.
- Full command:
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/entry.tsx --out ./ds-bundle`

## Gotchas

- **`entry.tsx` re-ids the react-native-web stylesheet, and must keep doing so.**
  RNW injects `<style id="react-native-stylesheet">` at import time. The
  validator's mount-root selector is `#root, [id^="r"]`, so that tag matches,
  sorts first in the document, and (RNW writes rules via CSSOM, not text) has
  empty `innerHTML` — making `roots[0]` empty and reporting EVERY card as
  `[RENDER] root empty` no matter how well it renders. The barrel renames it to
  `ds-rnw-stylesheet`. Delete that and all three components fail validation
  spuriously. This is a validator bug for any react-native-web system; worth
  reporting upstream.
- Prop extraction yields `[key: string]: unknown` for everything without a
  shipped `.d.ts`, so all three contracts are pinned by hand in
  `cfg.dtsPropsFor`. **Any prop change in `src/components/` must be mirrored
  there** — nothing checks this automatically.
- `BottomNavigation` is absolutely positioned and full-width; it needs
  `cfg.overrides.BottomNavigation.cardMode: "column"` or it trips
  `[GRID_OVERFLOW]`. Its previews wrap it in a `position: relative` frame.

## Known render warns

- `[CSS_RUNTIME]` on `styles.css` and `_ds_bundle.css` — expected and permanent.
  Styling is React Native `StyleSheet` (CSS-in-JS); the repo ships no CSS at
  all, so `tokens/` is empty and there is no `fonts/`. Do not chase it, and do
  not set `cfg.cssEntry`.

## Re-sync risks

- The palette in `conventions.md` is **transcribed** from `src/theme.ts` and
  `src/ui/monkeyColorways.ts`, not generated. There are no CSS custom properties
  to bind to, so a token change in either file silently rots the header —
  re-verify every hex against `_ds_bundle.js` on each sync (one caught this run:
  `#4B3227` was wrong; the real default fur is `#996744`).
- Preview content uses the real `Activity`/`Mood`/`Availability` unions from
  `src/types.ts`. If those unions change, the previews still compile but stop
  reflecting the product.
- Playwright's chromium was installed into `.ds-sync/` for the render check;
  a fresh clone needs `npm i -D playwright && npx playwright install chromium`
  there again.
- Only three components are synced. If the app grows genuinely reusable
  primitives, add them to `entry.tsx` AND `cfg.componentSrcMap`.
