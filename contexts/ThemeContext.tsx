import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme } from '@/constants/Themes';

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeName: string) => Promise<void>;
  availableThemes: string[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes['Solo Leveling']);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      try {
        await AsyncStorage.setItem('theme', themeName);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        availableThemes: Object.keys(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 