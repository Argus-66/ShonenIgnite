export interface WorkoutProgress {
  workoutId: string;
  name: string;
  icon: string;
  metric: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  date: string;
  timestamp: number;
  isAdditional?: boolean;
  intensity?: string;
  calories?: number;
}

export interface DailyProgress {
  userId: string;
  date: string;
  workouts: WorkoutProgress[];
}

export interface XPHistory {
  userId: string;
  date: string;
  workout: string;
  xpGained: number;
  metric: string;
  value: number;
  unit: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  xpForNextLevel: number;
  currentLevelXP: number;
}

export const XP_RATES = {
  cardiovascular: {
    distance: 5, // XP per km
  },
  strength: {
    reps: 3, // XP per rep
  },
  flexibility: {
    time: 1, // XP per minute
    session: 1, // XP per session
  },
  balance: {
    time: 1, // XP per minute
    session: 1, // XP per session
  },
  hiit: {
    distance: 5, // XP per km
    time: 5, // XP per minute
    reps: 3, // XP per rep
  },
  functional: {
    reps: 3, // XP per rep
  }
};

export const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 XP (Starting level)
  100,    // Level 2: 100 XP required (Total: 100 XP)
  250,    // Level 3: 150 XP required (Total: 250 XP)
  475,    // Level 4: 225 XP required (Total: 475 XP)
  813,    // Level 5: 338 XP required (Total: 813 XP)
  1320,   // Level 6: 507 XP required (Total: 1320 XP)
  2080,   // Level 7: 760 XP required (Total: 2080 XP)
  3220,   // Level 8: 1140 XP required (Total: 3220 XP)
  4930,   // Level 9: 1710 XP required (Total: 4930 XP)
  7495,   // Level 10: 2565 XP required (Total: 7495 XP)
];

export function calculateLevel(totalXP: number): { level: number; xpForNextLevel: number; currentLevelXP: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      const currentLevelXP = totalXP - LEVEL_THRESHOLDS[i - 1];
      const xpForNextLevel = LEVEL_THRESHOLDS[i] - LEVEL_THRESHOLDS[i - 1];
      return { level, xpForNextLevel, currentLevelXP };
    }
  }
  // Max level reached
  return { 
    level: LEVEL_THRESHOLDS.length, 
    xpForNextLevel: 0, 
    currentLevelXP: 0 
  };
}

export interface ProgressData {
  [workoutName: string]: {
    [date: string]: {
      value: number;
      completed: boolean;
      timestamp: number;
      date: string;
      unit?: string;
      intensity?: string;
      isAdditional?: boolean;
      calories?: number;
    }
  }
} 