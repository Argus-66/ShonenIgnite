import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { preloadThemeImages } from '@/utils/profileImages';

export default function RootLayout() {
  useEffect(() => {
    // Set up an authentication state observer
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        router.replace('/(tabs)');
      } else {
        // No user is signed in, stay on login screen
        router.replace('/login');
      }
    });

    // Preload theme images
    const loadThemeImages = async () => {
      try {
        await preloadThemeImages();
        console.log('Theme images preloaded successfully');
      } catch (error) {
        console.error('Error preloading theme images:', error);
      }
    };
    
    loadThemeImages();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
