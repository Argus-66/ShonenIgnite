export type Theme = {
  name: string;
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

export const themes: Record<string, Theme> = {
  'Solo Leveling': {
    name: 'Solo Leveling',
    colors: {
      primary: '#190019',
      secondary: '#2B124C',
      accent: '#522B5B',
      accent2: '#854F6C',
      textPrimary: '#FBE4D8',
      textSecondary: '#DFB6B2',
      background: '#190019',
      text: '#FBE4D8',
      card: '#2B124C',
      border: '#522B5B',
      error: '#FF4444',
    },
  },
  'Dragon Ball': {
    name: 'Dragon Ball',
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
    colors: {
      primary: '#101010',
      secondary: '#D32F2F',
      accent: '#FF7043',
      accent2: '#FFCCBC',
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      background: '#101010',
      text: '#FFFFFF',
      card: '#202020',
      border: '#D32F2F',
      error: '#FF4444',
    },
  },
  'Attack on Titan': {
    name: 'Attack on Titan',
    colors: {
      primary: '#2C3E50',
      secondary: '#556B2F',
      accent: '#C0392B',
      accent2: '#D35400',
      textPrimary: '#ECF0F1',
      textSecondary: '#7F8C8D',
      background: '#2C3E50',
      text: '#ECF0F1',
      card: '#34495E',
      border: '#C0392B',
      error: '#FF4444',
    },
  },
  'One Piece': {
    name: 'One Piece',
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