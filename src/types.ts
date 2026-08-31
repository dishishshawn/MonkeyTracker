export type Activity = 'Studying' | 'Working' | 'Eating' | 'Chilling' | 'Sleeping' | 'Commuting' | 'At the gym' | 'Cooking' | 'Gaming' | 'Out & about';
export type Mood = 'Crispy' | 'Cozy' | 'Focused' | 'Wobbly' | 'Happy' | 'Tender' | 'Sleepy' | 'Frazzled' | 'Social' | 'Quiet';
export type Availability = 'Free' | 'Text only' | 'Busy' | 'Asleep';
export type LocationLevel = 'Hidden' | 'Perch' | 'Nearby' | 'Trail';
export type Expiration = '15 min' | '30 min' | '1 hour' | '2 hours' | '4 hours' | '8 hours' | 'End of day';
export type Scene = 'Auto' | 'Desk nest' | 'Couch mode' | 'Outdoors' | 'Café' | 'Blanket fort';
export type Pose = 'Auto' | 'Waving' | 'Locked in' | 'Flopped' | 'Victory';
export type Accessory = 'None' | 'Glasses' | 'Beanie' | 'Crown' | 'Flower';
export type RoomDecor = 'None' | 'Plant' | 'String lights' | 'Poster' | 'Plushie';

export interface MonkeyUpdate {
  activity: Activity;
  mood: Mood;
  availability: Availability;
  caption: string;
  locationLevel: LocationLevel;
  place: string;
  expiration: Expiration;
  scene: Scene;
  pose: Pose;
  accessory: Accessory;
  roomDecor: RoomDecor;
  photoUri: string;
  photoPath: string;
  updatedAt: string;
}

export interface QuickPreset {
  id: string;
  name: string;
  activity: Activity;
  mood: Mood;
  availability: Availability;
  scene: Scene;
  pose: Pose;
}

export interface Profile {
  name: string;
  accent: string;
  skin: string;
}

export interface TimelineEntry {
  id: string;
  update: MonkeyUpdate;
  createdAt: string;
  saved: boolean;
}

export interface PrivacyPreferences {
  locationEnabled: boolean;
  notificationsPrivate: boolean;
  statusRemindersEnabled: boolean;
}

export interface PersistedAppState {
  version: 1;
  paired: boolean;
  profile: Profile;
  currentUpdate: MonkeyUpdate;
  timeline: TimelineEntry[];
  quickPresets: QuickPreset[];
  preferences: PrivacyPreferences;
}

export interface Person {
  name: string;
  color: string;
  update: MonkeyUpdate;
}
