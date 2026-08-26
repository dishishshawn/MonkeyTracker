# Monkey Tracker

Release 0 mobile prototype for the private presence-sharing app described in [`PRD.txt`](./PRD.txt).

## Included

- Shared home stage with two expressive monkey avatars
- Three-step first-run flow for monkey customization, private invite, and explicit partner acceptance
- Partner status card with freshness and location-precision labels
- Update composer for activity, mood, availability, caption, location, and expiration
- Discrete status-expiration slider with in-app/browser expiration notices and automatic unknown state
- Expanded activities, moods, rooms, and monkey poses behind compact horizontal selectors
- Hidden, Perch, Nearby, and Trail sharing choices with explicit Trail disclosure
- Lightweight reactions and a playful poke
- Privacy controls with a global location kill switch and private notification previews
- Small Monkey Business timeline preview

All data is currently local, in-memory prototype state. Authentication, pairing, persistence, realtime sync, location services, notifications, and backend-enforced expiration belong to the private-alpha implementation.

## Run

Expo SDK 57 requires Node.js 22.13 or newer.

This workspace has Node.js 22.23.2 installed locally at `.tools/node` (ignored by Git). Activate it for the current shell with:

```sh
export PATH="$PWD/.tools/node/bin:$PATH"
```

On another machine, `nvm use` will read the checked-in `.nvmrc`.

```sh
npm install
npx expo install --fix
npm run typecheck
npm start
```

Then open the project in Expo Go or launch an iOS/Android simulator from the Expo terminal UI.

## Local Android emulator

This workspace includes a project-local Android 16 `medium_phone` emulator with Google Play APIs. Its SDK, Java runtime, and AVD data live under `.tools/` and are intentionally ignored by Git.

Launch the emulator and open Monkey Tracker with:

```sh
npm run emulator
```

The script enables KVM acceleration, waits for Android to boot, starts Metro on localhost, and opens the app through Expo Go. Press `Ctrl+C` to stop Metro; close the emulator window separately when finished.

## Product guardrails already represented

- Location can be fully disabled and is not required for an update.
- Sharing precision is visible beside the current update.
- Trail is opt-in, includes a plain-language disclosure, and always has an expiration choice.
- Notification contents are private by default.
- The interface does not alert or shame a partner when location is disabled.
