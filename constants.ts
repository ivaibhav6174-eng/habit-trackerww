import { HabitCategory } from './types';

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Appreciating: 'bg-green-900/20 text-green-400', 
  Depreciating: 'bg-red-900/20 text-red-400', 
  Neutral: 'bg-blue-900/20 text-blue-400',     
  Core: 'bg-red-900/30 text-red-500',        
};

export const CATEGORY_ICONS: Record<HabitCategory, string> = {
  Appreciating: '▲',
  Depreciating: '▼',
  Neutral: '◆',
  Core: '★',
};

export const CATEGORY_SHORT_FORMS: Record<string, string> = {
  'All': 'ALL',
  'Appreciating': 'APP',
  'Depreciating': 'DEP',
  'Neutral': 'NEU',
  'Core': 'COR'
};

export const M3_PALETTE = {
  primary: '#FFFFFF',
  primaryContainer: '#262626',
  secondary: '#A3A3A3',
  secondaryContainer: '#1F1F1F',
  tertiary: '#737373',
  tertiaryContainer: '#171717',
  surface: '#0A0A0A',
  surfaceVariant: '#161616',
  outline: '#262626'
};