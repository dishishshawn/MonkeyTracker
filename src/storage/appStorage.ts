import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInitialAppState } from '../state/appState';
import { PersistedAppState } from '../types';

const STORAGE_KEY = '@monkey-tracker/app-state/v1';

export async function loadAppState(): Promise<PersistedAppState> {
  const fallback = createInitialAppState();
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return fallback;
    const parsed = JSON.parse(value) as Partial<PersistedAppState>;
    if (parsed.version !== 1 || !parsed.currentUpdate || !parsed.profile) return fallback;
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...parsed.profile },
      currentUpdate: { ...fallback.currentUpdate, ...parsed.currentUpdate },
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      preferences: { ...fallback.preferences, ...parsed.preferences },
      version: 1,
    };
  } catch {
    return fallback;
  }
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearAppState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
