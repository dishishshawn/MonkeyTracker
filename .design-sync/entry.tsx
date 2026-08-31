// Sync entry for claude.ai/design. Exports only the presentational primitives
// that render without app state, storage, or Expo native modules.
export { Chip } from '../src/components/Chip';
export { MonkeyAvatar } from '../src/components/MonkeyAvatar';
export { BottomNavigation } from '../src/components/BottomNavigation';

// react-native-web injects <style id="react-native-stylesheet"> at import time.
// The preview harness looks for mount roots with `#root, [id^="r"]` and reads
// roots[0]; that style tag matches, sorts first in the document, and holds its
// rules in the CSSOM rather than as text, so every card reads as "root empty"
// however well it renders. Re-id it — RNW keeps its own reference to the sheet
// and never looks the element up by id again.
if (typeof document !== 'undefined') {
  const injected = document.getElementById('react-native-stylesheet');
  if (injected) injected.id = 'ds-rnw-stylesheet';
}
