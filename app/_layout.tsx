import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { preloadThemeImages } from '@/utils/profileImages';
import { setupAuthListener } from '@/utils/authService';

export default function RootLayout() {
  useEffect(() => {
    // Set up authentication listener when the app starts
    const unsubscribe = setupAuthListener();
    
    // Preload theme images for faster loading
    preloadThemeImages();
    
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#121212' },
            animation: 'fade',
          }} 
        />
      </View>
    </ThemeProvider>
  );
}
