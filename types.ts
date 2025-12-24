export type HabitCategory = 'Appreciating' | 'Depreciating' | 'Neutral' | 'Core';

export interface Habit {
  id: string;
  name: string;
  anchor?: string; // The "trigger" habit (Habit Stacking)
  category: HabitCategory;
  goalCount: number; 
  frequency: 'daily' | 'weekly';
  color: string;
  createdAt: number;
  reminderTime?: string; 
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface HabitHistoryStats {
  streak: number;
  lastSevenDays: boolean[]; 
  yearlyPulse: boolean[]; // Last 365 days of completion
  completionRate: number; 
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}