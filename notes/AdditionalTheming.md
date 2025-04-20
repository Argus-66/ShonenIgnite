export type Theme = {
  name: string;
  mode: 'dark' | 'light';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accent2: string;
    textPrimary: string;
    textSecondary: string;
    background: string;
    text: string;
    card: string;
    border: string;
    error: string;
    
    // Page-specific theming
    dashboard: {
      headerBackground: string;
      statCardBackground: string;
      workoutCardBackground: string;
      progressBarFill: string;
      progressBarBackground: string;
      achievementBadge: string;
    };
    workouts: {
      categoryCardBackground: string;
      exerciseCardBackground: string;
      completedExercise: string;
      workoutModalBackground: string;
      intensityLow: string;
      intensityMedium: string;
      intensityHigh: string;
    };
    profile: {
      statsCardBackground: string;
      achievementCardBackground: string;
      historyCardBackground: string;
      levelBadgeBackground: string;
      settingsCardBackground: string;
    };
    leaderboard: {
      podiumBackground: string;
      firstPlaceAccent: string;
      secondPlaceAccent: string;
      thirdPlaceAccent: string;
      rankCardBackground: string;
      userHighlightBackground: string;
    };
    explore: {
      mapMarker: string;
      mapCallout: string;
      gymCardBackground: string;
      filterBackground: string;
      ratingHighlight: string;
    };
  };
};

// Dark Themes
const darkThemes: Record<string, Theme> = {
  'Solo Leveling': {
    name: 'Solo Leveling',
    mode: 'dark',
    colors: {
      primary: '#190019',
      secondary: '#9054df',
      accent: '#e985ff',
      accent2: '#854F6C',
      textPrimary: '#FBE4D8',
      textSecondary: '#DFB6B2',
      background: '#190019',
      text: '#FBE4D8',
      card: '#9054df',
      border: '#e985ff',
      error: '#FF4444',
      
      // Solo Leveling - Purple/dark theme with magic portal glowing effects
      dashboard: {
        headerBackground: '#231238',
        statCardBackground: '#341256',
        workoutCardBackground: '#2A0E45',
        progressBarFill: '#e985ff',
        progressBarBackground: '#3E1A54',
        achievementBadge: '#BE73FF',
      },
      workouts: {
        categoryCardBackground: '#2D1245',
        exerciseCardBackground: '#321350',
        completedExercise: '#A64DFF',
        workoutModalBackground: '#1D0A30',
        intensityLow: '#5C42FF',
        intensityMedium: '#8452FF',
        intensityHigh: '#B442FF',
      },
      profile: {
        statsCardBackground: '#2F1348',
        achievementCardBackground: '#3A1959',
        historyCardBackground: '#281040',
        levelBadgeBackground: '#BE73FF',
        settingsCardBackground: '#22113A',
      },
      leaderboard: {
        podiumBackground: '#2A1045',
        firstPlaceAccent: '#FFDF00',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#33164F',
        userHighlightBackground: '#4C1D7D',
      },
      explore: {
        mapMarker: '#e985ff',
        mapCallout: '#190019',
        gymCardBackground: '#321350',
        filterBackground: '#190019',
        ratingHighlight: '#BE73FF',
      },
    },
  },
  'Dragon Ball': {
    name: 'Dragon Ball',
    mode: 'dark',
    colors: {
      primary: '#0A0A23',
      secondary: '#FF8C00',
      accent: '#E63946',
      accent2: '#FFC300',
      textPrimary: '#F1FAEE',
      textSecondary: '#457B9D',
      background: '#0A0A23',
      text: '#F1FAEE',
      card: '#1A1A40',
      border: '#E63946',
      error: '#FF4444',
      
      // Dragon Ball - Orange/blue theme with energy effects
      dashboard: {
        headerBackground: '#0E1235',
        statCardBackground: '#1A2045',
        workoutCardBackground: '#202D50',
        progressBarFill: '#FF8C00',
        progressBarBackground: '#304269',
        achievementBadge: '#FFC300',
      },
      workouts: {
        categoryCardBackground: '#222F55',
        exerciseCardBackground: '#1D2A4E',
        completedExercise: '#FF8C00',
        workoutModalBackground: '#0E1235',
        intensityLow: '#4d94ff',
        intensityMedium: '#FF8C00',
        intensityHigh: '#E63946',
      },
      profile: {
        statsCardBackground: '#1F2E5C',
        achievementCardBackground: '#253764',
        historyCardBackground: '#192852',
        levelBadgeBackground: '#FF8C00',
        settingsCardBackground: '#152247',
      },
      leaderboard: {
        podiumBackground: '#1D2B59',
        firstPlaceAccent: '#FFC300',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#283B6A',
        userHighlightBackground: '#304269',
      },
      explore: {
        mapMarker: '#FF8C00',
        mapCallout: '#152247',
        gymCardBackground: '#1D2A4E',
        filterBackground: '#0A0A23',
        ratingHighlight: '#FFC300',
      },
    },
  },
  'One Punch': {
    name: 'One Punch',
    mode: 'dark',
    colors: {
      primary: '#1A1A1A',
      secondary: '#F9D342',
      accent: '#FF4500',
      accent2: '#EFEFEF',
      textPrimary: '#FFFFFF',
      textSecondary: '#DC143C',
      background: '#1A1A1A',
      text: '#FFFFFF',
      card: '#2A2A2A',
      border: '#FF4500',
      error: '#FF4444',
      
      // One Punch Man - Yellow/red with minimalist sharp design
      dashboard: {
        headerBackground: '#0D0D0D',
        statCardBackground: '#2A2A2A',
        workoutCardBackground: '#232323',
        progressBarFill: '#DC143C',
        progressBarBackground: '#333333',
        achievementBadge: '#F9D342',
      },
      workouts: {
        categoryCardBackground: '#1F1F1F',
        exerciseCardBackground: '#262626',
        completedExercise: '#DC143C',
        workoutModalBackground: '#0D0D0D',
        intensityLow: '#F9D342',
        intensityMedium: '#FF6347',
        intensityHigh: '#DC143C',
      },
      profile: {
        statsCardBackground: '#262626',
        achievementCardBackground: '#2D2D2D',
        historyCardBackground: '#1F1F1F',
        levelBadgeBackground: '#F9D342',
        settingsCardBackground: '#1A1A1A',
      },
      leaderboard: {
        podiumBackground: '#1F1F1F',
        firstPlaceAccent: '#F9D342',
        secondPlaceAccent: '#CCCCCC',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#2A2A2A',
        userHighlightBackground: '#333333',
      },
      explore: {
        mapMarker: '#DC143C',
        mapCallout: '#1A1A1A',
        gymCardBackground: '#262626',
        filterBackground: '#0D0D0D',
        ratingHighlight: '#F9D342',
      },
    },
  },
  'Baki': {
    name: 'Baki',
    mode: 'dark',
    colors: {
      primary: '#101010',
      secondary: '#FF7043',
      accent: '#D32F2F',
      accent2: '#FFCCBC',
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      background: '#101010',
      text: '#FFFFFF',
      card: '#202020',
      border: '#FF7043',
      error: '#FF4444',
      
      // Baki - Gritty red/black theme for intense fighting spirit
      dashboard: {
        headerBackground: '#0A0A0A',
        statCardBackground: '#1F1F1F',
        workoutCardBackground: '#181818',
        progressBarFill: '#D32F2F',
        progressBarBackground: '#2A2A2A',
        achievementBadge: '#FF7043',
      },
      workouts: {
        categoryCardBackground: '#181818',
        exerciseCardBackground: '#1C1C1C',
        completedExercise: '#D32F2F',
        workoutModalBackground: '#0A0A0A',
        intensityLow: '#FF8F66',
        intensityMedium: '#FF7043',
        intensityHigh: '#D32F2F',
      },
      profile: {
        statsCardBackground: '#1C1C1C',
        achievementCardBackground: '#222222',
        historyCardBackground: '#191919',
        levelBadgeBackground: '#FF7043',
        settingsCardBackground: '#151515',
      },
      leaderboard: {
        podiumBackground: '#191919',
        firstPlaceAccent: '#FFD700',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#202020',
        userHighlightBackground: '#2A2A2A',
      },
      explore: {
        mapMarker: '#D32F2F',
        mapCallout: '#151515',
        gymCardBackground: '#1C1C1C',
        filterBackground: '#0A0A0A',
        ratingHighlight: '#FF7043',
      },
    },
  },
  'Attack on Titan': {
    name: 'Attack on Titan',
    mode: 'dark',
    colors: {
      primary: '#0C2E3F',
      secondary: '#556B2F',
      accent: '#C0392B',
      accent2: '#D35400',
      textPrimary: '#ECF0F1',
      textSecondary: '#7F8C8D',
      background: '#0C2E3F',
      text: '#ECF0F1',
      card: '#34495E',
      border: '#C0392B',
      error: '#FF4444',
      
      // Attack on Titan - Military green/brown and red accents
      dashboard: {
        headerBackground: '#0A242F',
        statCardBackground: '#2C3E50',
        workoutCardBackground: '#1C2E3E',
        progressBarFill: '#C0392B',
        progressBarBackground: '#34495E',
        achievementBadge: '#556B2F',
      },
      workouts: {
        categoryCardBackground: '#1E3346',
        exerciseCardBackground: '#24394A',
        completedExercise: '#C0392B',
        workoutModalBackground: '#0A242F',
        intensityLow: '#556B2F',
        intensityMedium: '#D35400',
        intensityHigh: '#C0392B',
      },
      profile: {
        statsCardBackground: '#24394A',
        achievementCardBackground: '#2C3E50',
        historyCardBackground: '#1E3346',
        levelBadgeBackground: '#556B2F',
        settingsCardBackground: '#19313F',
      },
      leaderboard: {
        podiumBackground: '#1E3346',
        firstPlaceAccent: '#FFD700',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#273F52',
        userHighlightBackground: '#34495E',
      },
      explore: {
        mapMarker: '#C0392B',
        mapCallout: '#0C2E3F',
        gymCardBackground: '#24394A',
        filterBackground: '#0A242F',
        ratingHighlight: '#556B2F',
      },
    },
  },
  'One Piece': {
    name: 'One Piece',
    mode: 'dark',
    colors: {
      primary: '#001F3F',
      secondary: '#27AE60',
      accent: '#E67E22',
      accent2: '#F39C12',
      textPrimary: '#FDFEFE',
      textSecondary: '#FFFFFF',
      background: '#001F3F',
      text: '#FDFEFE',
      card: '#002F5F',
      border: '#27AE60',
      error: '#FF4444',
      
      // One Piece - Nautical blue and straw hat colors
      dashboard: {
        headerBackground: '#00162C',
        statCardBackground: '#002C52',
        workoutCardBackground: '#002447',
        progressBarFill: '#E67E22',
        progressBarBackground: '#00396B',
        achievementBadge: '#F39C12',
      },
      workouts: {
        categoryCardBackground: '#00264A',
        exerciseCardBackground: '#002C52',
        completedExercise: '#27AE60',
        workoutModalBackground: '#00162C',
        intensityLow: '#27AE60',
        intensityMedium: '#F39C12',
        intensityHigh: '#E67E22',
      },
      profile: {
        statsCardBackground: '#002C52',
        achievementCardBackground: '#00335F',
        historyCardBackground: '#00264A',
        levelBadgeBackground: '#F39C12',
        settingsCardBackground: '#001F3F',
      },
      leaderboard: {
        podiumBackground: '#00264A',
        firstPlaceAccent: '#FFD700',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#00335F',
        userHighlightBackground: '#003F75',
      },
      explore: {
        mapMarker: '#E67E22',
        mapCallout: '#001F3F',
        gymCardBackground: '#002C52',
        filterBackground: '#00162C',
        ratingHighlight: '#F39C12',
      },
    },
  },
  'Jujutsu Kaisen': {
    name: 'Jujutsu Kaisen',
    mode: 'dark',
    colors: {
      primary: '#1C1C1C',
      secondary: '#0077B6',
      accent: '#9B59B6',
      accent2: '#D2B4DE',
      textPrimary: '#ECF0F1',
      textSecondary: '#FFFFFF',
      background: '#1C1C1C',
      text: '#ECF0F1',
      card: '#2C2C2C',
      border: '#9B59B6',
      error: '#FF4444',
      
      // Jujutsu Kaisen - Dark with cursed energy purple accents
      dashboard: {
        headerBackground: '#131313',
        statCardBackground: '#252525',
        workoutCardBackground: '#1F1F1F',
        progressBarFill: '#9B59B6',
        progressBarBackground: '#2F2F2F',
        achievementBadge: '#8E44AD',
      },
      workouts: {
        categoryCardBackground: '#1F1F1F',
        exerciseCardBackground: '#252525',
        completedExercise: '#9B59B6',
        workoutModalBackground: '#131313',
        intensityLow: '#0077B6',
        intensityMedium: '#8E44AD',
        intensityHigh: '#9B59B6',
      },
      profile: {
        statsCardBackground: '#252525',
        achievementCardBackground: '#2A2A2A',
        historyCardBackground: '#1F1F1F',
        levelBadgeBackground: '#9B59B6',
        settingsCardBackground: '#1A1A1A',
      },
      leaderboard: {
        podiumBackground: '#1F1F1F',
        firstPlaceAccent: '#FFD700',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#272727',
        userHighlightBackground: '#333333',
      },
      explore: {
        mapMarker: '#9B59B6',
        mapCallout: '#1C1C1C',
        gymCardBackground: '#252525',
        filterBackground: '#131313',
        ratingHighlight: '#8E44AD',
      },
    },
  },
  'Black Clover': {
    name: 'Black Clover',
    mode: 'dark',
    colors: {
      primary: '#1A1A1A',
      secondary: '#000000',
      accent: '#F1C40F',
      accent2: '#8E44AD',
      textPrimary: '#EAECEE',
      textSecondary: '#D4AC0D',
      background: '#1A1A1A',
      text: '#EAECEE',
      card: '#2A2A2A',
      border: '#F1C40F',
      error: '#FF4444',
      
      // Black Clover - Black bull's dark theme with magic book gold
      dashboard: {
        headerBackground: '#121212',
        statCardBackground: '#232323',
        workoutCardBackground: '#1D1D1D',
        progressBarFill: '#F1C40F',
        progressBarBackground: '#2F2F2F',
        achievementBadge: '#D4AC0D',
      },
      workouts: {
        categoryCardBackground: '#1D1D1D',
        exerciseCardBackground: '#232323',
        completedExercise: '#F1C40F',
        workoutModalBackground: '#121212',
        intensityLow: '#8E44AD',
        intensityMedium: '#D4AC0D',
        intensityHigh: '#F1C40F',
      },
      profile: {
        statsCardBackground: '#232323',
        achievementCardBackground: '#292929',
        historyCardBackground: '#1D1D1D',
        levelBadgeBackground: '#F1C40F',
        settingsCardBackground: '#181818',
      },
      leaderboard: {
        podiumBackground: '#1D1D1D',
        firstPlaceAccent: '#F1C40F',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#262626',
        userHighlightBackground: '#333333',
      },
      explore: {
        mapMarker: '#F1C40F',
        mapCallout: '#1A1A1A',
        gymCardBackground: '#232323',
        filterBackground: '#121212',
        ratingHighlight: '#D4AC0D',
      },
    },
  },
  'Naruto': {
    name: 'Naruto',
    mode: 'dark',
    colors: {
      primary: '#0B0C10',
      secondary: '#FF4136',
      accent: '#2980B9',
      accent2: '#FF851B',
      textPrimary: '#FDFEFE',
      textSecondary: '#FFDC00',
      background: '#0B0C10',
      text: '#FDFEFE',
      card: '#1B1C20',
      border: '#2980B9',
      error: '#FF4444',
      
      // Naruto - Black with orange and blue highlights
      dashboard: {
        headerBackground: '#070809',
        statCardBackground: '#16171C',
        workoutCardBackground: '#111216',
        progressBarFill: '#FF851B',
        progressBarBackground: '#1F2026',
        achievementBadge: '#FFDC00',
      },
      workouts: {
        categoryCardBackground: '#111216',
        exerciseCardBackground: '#16171C',
        completedExercise: '#FF851B',
        workoutModalBackground: '#070809',
        intensityLow: '#2980B9',
        intensityMedium: '#FF851B',
        intensityHigh: '#FF4136',
      },
      profile: {
        statsCardBackground: '#16171C',
        achievementCardBackground: '#1B1C21',
        historyCardBackground: '#111216',
        levelBadgeBackground: '#FF851B',
        settingsCardBackground: '#0E0F13',
      },
      leaderboard: {
        podiumBackground: '#111216',
        firstPlaceAccent: '#FFDC00',
        secondPlaceAccent: '#C0C0C0',
        thirdPlaceAccent: '#CD7F32',
        rankCardBackground: '#19191F',
        userHighlightBackground: '#222228',
      },
      explore: {
        mapMarker: '#FF851B',
        mapCallout: '#0B0C10',
        gymCardBackground: '#16171C',
        filterBackground: '#070809',
        ratingHighlight: '#FFDC00',
      },
    },
  },
};

// Light Themes
const lightThemes: Record<string, Theme> = {
  'Hajime no Ippo': {
    name: 'Hajime no Ippo',
    mode: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#0D47A1', // Deeper blue for better contrast on mobile
      accent: '#FFC107',    // Champion belt gold
      accent2: '#2E7D32',   // Darker Kamogawa gym green
      textPrimary: '#0D47A1',
      textSecondary: '#2E7D32',
      background: '#F5F5F5', // Light gray background reduces eye strain
      text: '#0D47A1',
      card: '#E3F2FD',
      border: '#0D47A1',    // Stronger border for better visibility
      error: '#C62828',
      
      // Hajime no Ippo - Boxing glove red and champion belt gold
      dashboard: {
        headerBackground: '#E3F2FD',
        statCardBackground: '#BBDEFB',
        workoutCardBackground: '#E3F2FD',
        progressBarFill: '#0D47A1',
        progressBarBackground: '#E1F5FE',
        achievementBadge: '#FFC107',
      },
      workouts: {
        categoryCardBackground: '#E3F2FD',
        exerciseCardBackground: '#BBDEFB',
        completedExercise: '#2E7D32',
        workoutModalBackground: '#F5F5F5',
        intensityLow: '#81C784',
        intensityMedium: '#FFC107',
        intensityHigh: '#C62828',
      },
      profile: {
        statsCardBackground: '#BBDEFB',
        achievementCardBackground: '#E3F2FD',
        historyCardBackground: '#E1F5FE',
        levelBadgeBackground: '#FFC107',
        settingsCardBackground: '#E3F2FD',
      },
      leaderboard: {
        podiumBackground: '#E3F2FD',
        firstPlaceAccent: '#FFC107',
        secondPlaceAccent: '#BDBDBD',
        thirdPlaceAccent: '#BF8970',
        rankCardBackground: '#BBDEFB',
        userHighlightBackground: '#90CAF9',
      },
      explore: {
        mapMarker: '#0D47A1',
        mapCallout: '#FFFFFF',
        gymCardBackground: '#E3F2FD',
        filterBackground: '#F5F5F5',
        ratingHighlight: '#FFC107',
      },
    },
  },
  'Megalo Box': {
    name: 'Megalo Box',
    mode: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#455A64', // Darker steel blue for contrast
      accent: '#E53935',    // Changed from amber to red
      accent2: '#B71C1C',   // Darker red
      textPrimary: '#263238',
      textSecondary: '#37474F',
      background: '#ECEFF1', // Light bluish-gray background
      text: '#263238',
      card: '#FFEBEE',      // Light red
      border: '#455A64',    // Steel blue border
      error: '#C62828',     // Error red
      
      // Megalo Box - Gear-themed mechanical aesthetic with futuristic red
      dashboard: {
        headerBackground: '#ECEFF1',
        statCardBackground: '#CFD8DC',
        workoutCardBackground: '#ECEFF1',
        progressBarFill: '#E53935',
        progressBarBackground: '#FFCDD2',
        achievementBadge: '#B71C1C',
      },
      workouts: {
        categoryCardBackground: '#ECEFF1',
        exerciseCardBackground: '#CFD8DC',
        completedExercise: '#B71C1C',
        workoutModalBackground: '#FFFFFF',
        intensityLow: '#90A4AE',
        intensityMedium: '#E53935',
        intensityHigh: '#B71C1C',
      },
      profile: {
        statsCardBackground: '#CFD8DC',
        achievementCardBackground: '#ECEFF1',
        historyCardBackground: '#FFEBEE',
        levelBadgeBackground: '#E53935',
        settingsCardBackground: '#ECEFF1',
      },
      leaderboard: {
        podiumBackground: '#ECEFF1',
        firstPlaceAccent: '#FFEB3B',
        secondPlaceAccent: '#B0BEC5',
        thirdPlaceAccent: '#BF8970',
        rankCardBackground: '#CFD8DC',
        userHighlightBackground: '#B0BEC5',
      },
      explore: {
        mapMarker: '#E53935',
        mapCallout: '#FFFFFF',
        gymCardBackground: '#ECEFF1',
        filterBackground: '#ECEFF1',
        ratingHighlight: '#B71C1C',
      },
    },
  },
};

// Combine dark and light themes
export const themes: Record<string, Theme> = {
  ...darkThemes,
  ...lightThemes,
}; 