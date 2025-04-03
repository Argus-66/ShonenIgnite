export type Theme = {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accent2: string;
    textPrimary: string;
    textSecondary: string;
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
    },
  },
}; 