import { createInitialUpdate, enforceLocationPreference, pruneTimeline } from '../domain/updates';
import { MonkeyUpdate, PersistedAppState, Profile, QuickPreset, TimelineEntry } from '../types';

export type AppAction =
  | { type: 'hydrate'; state: PersistedAppState }
  | { type: 'completePairing'; profile: Profile; consentAccepted: boolean }
  | { type: 'publish'; update: MonkeyUpdate; entry: TimelineEntry }
  | { type: 'setLocationEnabled'; enabled: boolean }
  | { type: 'setNotificationsPrivate'; enabled: boolean }
  | { type: 'setStatusRemindersEnabled'; enabled: boolean }
  | { type: 'deleteTimelineEntry'; id: string }
  | { type: 'toggleSaved'; id: string }
  | { type: 'saveQuickPreset'; preset: QuickPreset }
  | { type: 'syncRemote'; currentUpdate: MonkeyUpdate; timeline: TimelineEntry[] }
  | { type: 'leaveTroop'; now: string };

export function createInitialAppState(now = new Date()): PersistedAppState {
  return {
    version: 1,
    paired: false,
    profile: { name: 'You', accent: '#996744', skin: '#EBC6A6' },
    currentUpdate: createInitialUpdate(now),
    timeline: [],
    quickPresets: [],
    preferences: {
      locationEnabled: false,
      notificationsPrivate: true,
      statusRemindersEnabled: true,
    },
  };
}

export function appReducer(state: PersistedAppState, action: AppAction): PersistedAppState {
  switch (action.type) {
    case 'hydrate':
      return { ...action.state, timeline: pruneTimeline(action.state.timeline) };
    case 'completePairing':
      if (!action.consentAccepted || !action.profile.name.trim()) return state;
      return { ...state, paired: true, profile: action.profile };
    case 'publish': {
      const update = enforceLocationPreference(action.update, state.preferences.locationEnabled);
      const entry = { ...action.entry, update };
      return {
        ...state,
        currentUpdate: update,
        timeline: pruneTimeline([entry, ...state.timeline]),
      };
    }
    case 'setLocationEnabled':
      return {
        ...state,
        currentUpdate: enforceLocationPreference(state.currentUpdate, action.enabled),
        preferences: { ...state.preferences, locationEnabled: action.enabled },
      };
    case 'setNotificationsPrivate':
      return { ...state, preferences: { ...state.preferences, notificationsPrivate: action.enabled } };
    case 'setStatusRemindersEnabled':
      return { ...state, preferences: { ...state.preferences, statusRemindersEnabled: action.enabled } };
    case 'deleteTimelineEntry':
      return { ...state, timeline: state.timeline.filter((entry) => entry.id !== action.id) };
    case 'toggleSaved':
      return {
        ...state,
        timeline: state.timeline.map((entry) => entry.id === action.id ? { ...entry, saved: !entry.saved } : entry),
      };
    case 'saveQuickPreset':
      return {
        ...state,
        quickPresets: [action.preset, ...state.quickPresets.filter((preset) => preset.name.toLowerCase() !== action.preset.name.toLowerCase())].slice(0, 6),
      };
    case 'syncRemote':
      return {
        ...state,
        currentUpdate: action.currentUpdate,
        timeline: pruneTimeline(action.timeline),
      };
    case 'leaveTroop': {
      const reset = createInitialAppState(new Date(action.now));
      return { ...reset, profile: state.profile };
    }
    default:
      return state;
  }
}
