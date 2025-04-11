import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { preloadThemeImages } from '@/utils/profileImages';
import { setupAuthListener } from '@/utils/authService';

export default function RootLayout() {
  useEffect(() => {
    // Set up authentication listener when the app starts
    const unsubscribe = setupAuthListener();
    
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
