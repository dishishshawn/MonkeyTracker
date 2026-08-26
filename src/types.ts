export type Activity = 'Studying' | 'Working' | 'Eating' | 'Chilling' | 'Sleeping' | 'Commuting' | 'At the gym' | 'Cooking' | 'Gaming' | 'Out & about';
export type Mood = 'Crispy' | 'Cozy' | 'Focused' | 'Wobbly' | 'Happy' | 'Tender' | 'Sleepy' | 'Frazzled' | 'Social' | 'Quiet';
export type Availability = 'Free' | 'Text only' | 'Busy' | 'Asleep';
export type LocationLevel = 'Hidden' | 'Perch' | 'Nearby' | 'Trail';
export type Expiration = '15 min' | '30 min' | '1 hour' | '2 hours' | '4 hours' | '8 hours' | 'End of day';
export type Scene = 'Auto' | 'Desk nest' | 'Couch mode' | 'Outdoors' | 'Café' | 'Blanket fort';
export type Pose = 'Auto' | 'Waving' | 'Locked in' | 'Flopped' | 'Victory';

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
  updatedAt: Date;
}

export interface Person {
  name: string;
  color: string;
  update: MonkeyUpdate;
}
