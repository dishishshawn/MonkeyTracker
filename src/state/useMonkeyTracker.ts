import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { expirationDate, isUpdateExpired, timelineId } from '../domain/updates';
import { loadAppState, saveAppState } from '../storage/appStorage';
import { MonkeyUpdate, Profile, TimelineEntry } from '../types';
import { appReducer, createInitialAppState } from './appState';

export function useMonkeyTracker(onExpired: () => void) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => createInitialAppState());
  const [hydrated, setHydrated] = useState(false);
  const [expired, setExpired] = useState(() => isUpdateExpired(state.currentUpdate));

  useEffect(() => {
    let active = true;
    void loadAppState().then((saved) => {
      if (!active) return;
      dispatch({ type: 'hydrate', state: saved });
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveAppState(state);
  }, [hydrated, state]);

  useEffect(() => {
    const remaining = expirationDate(state.currentUpdate).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    setExpired(false);
    const timer = setTimeout(() => {
      setExpired(true);
      onExpired();
    }, remaining);
    return () => clearTimeout(timer);
  }, [onExpired, state.currentUpdate]);

  const completePairing = useCallback((profile: Profile, consentAccepted: boolean) => {
    dispatch({ type: 'completePairing', profile, consentAccepted });
  }, []);

  const publish = useCallback((draft: MonkeyUpdate) => {
    const updatedAt = new Date().toISOString();
    const update = { ...draft, updatedAt };
    dispatch({
      type: 'publish',
      update,
      entry: { id: timelineId(), update, createdAt: updatedAt, saved: false },
    });
    return update;
  }, []);

  const actions = useMemo(() => ({
    completePairing,
    publish,
    setLocationEnabled: (enabled: boolean) => dispatch({ type: 'setLocationEnabled', enabled }),
    setNotificationsPrivate: (enabled: boolean) => dispatch({ type: 'setNotificationsPrivate', enabled }),
    deleteTimelineEntry: (id: string) => dispatch({ type: 'deleteTimelineEntry', id }),
    toggleSaved: (id: string) => dispatch({ type: 'toggleSaved', id }),
    syncRemote: (currentUpdate: MonkeyUpdate, timeline: TimelineEntry[]) => dispatch({ type: 'syncRemote', currentUpdate, timeline }),
    leaveTroop: () => dispatch({ type: 'leaveTroop', now: new Date().toISOString() }),
  }), [completePairing, publish]);

  return { state, hydrated, expired, actions };
}
