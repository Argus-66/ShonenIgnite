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
    },
  },
  'Megalo Box': {
    name: 'Megalo Box',
    mode: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#455A64', // Darker steel blue for contrast
      accent: '#E53935',    // Changed from amber (#FF8F00) to red
      accent2: '#B71C1C',   // Changed from orange (#BF360C) to darker red
      textPrimary: '#263238',
      textSecondary: '#37474F',
      background: '#ECEFF1', // Light bluish-gray background
      text: '#263238',
      card: '#FFEBEE',      // Changed from light blue to light red
      border: '#455A64',    // Kept for better visibility
      error: '#C62828',     // Darker red error
    },
  },
};

// Combine dark and light themes
export const themes: Record<string, Theme> = {
  ...darkThemes,
  ...lightThemes,
}; 