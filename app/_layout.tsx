import { Stack, Redirect } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { preloadThemeImages } from '@/utils/profileImages';

// A loading screen shown while checking authentication state
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#e985ff" />
      <Text style={{ marginTop: 20, color: '#fff', fontSize: 16 }}>Loading...</Text>
    </View>
  );
}

// Component to handle auth state and routing
function AuthStateHandler({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  useEffect(() => {
    // Preload theme images
    const loadImages = async () => {
      try {
        await preloadThemeImages();
        setImagesPreloaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesPreloaded(true); // Continue anyway
      }
    };
    
    loadImages();
  }, []);
  
  // Show loading screen while checking auth state and preloading images
  if (isInitializing || !imagesPreloaded) {
    return <LoadingScreen />;
  }
  
  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthStateHandler>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthStateHandler>
      </ThemeProvider>
    </AuthProvider>
  );
}
