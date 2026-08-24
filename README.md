# Monkey Tracker

Release 0 mobile prototype for the private presence-sharing app described in [`PRD.txt`](./PRD.txt).

## Included

- Shared home stage with two expressive monkey avatars
- Partner status card with freshness and location-precision labels
- Update composer for activity, mood, availability, caption, location, and expiration
- Hidden, Perch, Nearby, and Trail sharing choices with explicit Trail disclosure
- Lightweight reactions and a playful poke
- Privacy controls with a global location kill switch and private notification previews
- Small Monkey Business timeline preview

All data is currently local, in-memory prototype state. Authentication, pairing, persistence, realtime sync, location services, notifications, and backend-enforced expiration belong to the private-alpha implementation.

## Run

Expo SDK 57 requires Node.js 22.13 or newer.

```sh
npm install
npx expo install --fix
npm run typecheck
npm start
```

Then open the project in Expo Go or launch an iOS/Android simulator from the Expo terminal UI.

## Product guardrails already represented

- Location can be fully disabled and is not required for an update.
- Sharing precision is visible beside the current update.
- Trail is opt-in, includes a plain-language disclosure, and always has an expiration choice.
- Notification contents are private by default.
- The interface does not alert or shame a partner when location is disabled.
