import { QuickPreset } from '../types';

export const builtInQuickPresets: QuickPreset[] = [
  { id: 'locked-in', name: 'Locked in', activity: 'Studying', mood: 'Focused', availability: 'Busy', scene: 'Desk nest', pose: 'Locked in' },
  { id: 'heading-home', name: 'Heading home', activity: 'Commuting', mood: 'Cozy', availability: 'Text only', scene: 'Outdoors', pose: 'Waving' },
  { id: 'call-me', name: 'Call me', activity: 'Chilling', mood: 'Happy', availability: 'Free', scene: 'Couch mode', pose: 'Waving' },
  { id: 'goblin-mode', name: 'Goblin mode', activity: 'Gaming', mood: 'Crispy', availability: 'Busy', scene: 'Blanket fort', pose: 'Flopped' },
];
