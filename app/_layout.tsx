import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { auth } from '@/config/firebase';
import { useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const inAuthGroup = segments[0] === 'auth';
      
      if (!user && !inAuthGroup) {
        // If user is not signed in and the initial segment is not auth, redirect to login
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        // If user is signed in and the initial segment is auth, redirect to home
        router.replace('/(tabs)');
      }
    });

    return unsubscribe;
  }, [segments]);
}

export default function RootLayout() {
  useProtectedRoute();

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
