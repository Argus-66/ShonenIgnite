import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { currentTheme } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: currentTheme.colors.background },
        }}
      />
    </View>
  );
} 