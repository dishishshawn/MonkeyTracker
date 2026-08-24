export type Activity = 'Studying' | 'Working' | 'Eating' | 'Chilling' | 'Sleeping';
export type Mood = 'Crispy' | 'Cozy' | 'Focused' | 'Wobbly' | 'Happy';
export type Availability = 'Free' | 'Text only' | 'Busy' | 'Asleep';
export type LocationLevel = 'Hidden' | 'Perch' | 'Nearby' | 'Trail';
export type Expiration = '30 min' | '2 hours' | 'End of day';

export interface MonkeyUpdate {
  activity: Activity;
  mood: Mood;
  availability: Availability;
  caption: string;
  locationLevel: LocationLevel;
  place: string;
  expiration: Expiration;
  updatedAt: Date;
}

export interface Person {
  name: string;
  color: string;
  update: MonkeyUpdate;
}
