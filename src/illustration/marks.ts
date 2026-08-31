import { Availability, LocationLevel, Mood, RoomDecor } from '../types';
import { Glyph } from './Mark';

export const availabilityGlyph: Record<Availability, Glyph> = {
  Free: 'free', 'Text only': 'text', Busy: 'busy', Asleep: 'asleep',
};

export const precisionGlyph: Record<LocationLevel, Glyph> = {
  Hidden: 'hidden', Perch: 'perch', Nearby: 'nearby', Trail: 'trail',
};

/**
 * Social and Quiet are approximations: the illustration system shipped Fizzy
 * and Melted, which are not moods this app has, and drew nothing for these two.
 */
export const moodGlyph: Record<Mood, Glyph> = {
  Crispy: 'crispy', Cozy: 'cozy', Focused: 'focused', Wobbly: 'wobbly',
  Happy: 'happy', Tender: 'tender', Sleepy: 'sleepy', Frazzled: 'frazzled',
  Social: 'fizzy', Quiet: 'melted',
};

/**
 * Only Plant has a drawn glyph. The illustration system shipped a generic decor
 * set (stack, lamp, mug, rug, window) rather than this app's four, so the other
 * three borrow the nearest shape.
 */
export const decorGlyph: Record<Exclude<RoomDecor, 'None'>, Glyph> = {
  Plant: 'plant', 'String lights': 'lamp', Poster: 'window', Plushie: 'rug',
};
