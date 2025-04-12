import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme } from '@/constants/Themes';
import { StatusBar } from 'expo-status-bar';

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeName: string) => Promise<void>;
  availableThemes: string[];
  darkThemes: string[];
  lightThemes: string[];
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes['Solo Leveling']);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Filter themes by mode
  const darkThemes = Object.entries(themes)
    .filter(([_, theme]) => theme.mode === 'dark')
    .map(([name, _]) => name);
  
  const lightThemes = Object.entries(themes)
    .filter(([_, theme]) => theme.mode === 'light')
    .map(([name, _]) => name);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    // Update dark mode state whenever theme changes
    setIsDarkMode(currentTheme.mode === 'dark');
  }, [currentTheme]);

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
        darkThemes,
        lightThemes,
        isDarkMode,
      }}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
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