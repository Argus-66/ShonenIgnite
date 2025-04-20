import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface MetallicBackgroundWrapperProps {
  children: React.ReactNode;
}

/**
 * This component wraps dashboard content with a metallic background
 * if the theme supports it
 */
export const MetallicBackgroundWrapper = ({ children }: MetallicBackgroundWrapperProps) => {
  const { currentTheme } = useTheme();
  // Safely access the background property which might not exist in all themes
  const dashboardBackground = currentTheme.colors.dashboard?.background as any;
  
  // Only apply metallic styling if the flag is set and the theme supports it
  if (dashboardBackground?.metallic) {
    return (
      <LinearGradient
        colors={[
          dashboardBackground.gradient.start,
          dashboardBackground.gradient.middle,
          dashboardBackground.gradient.end,
          dashboardBackground.gradient.middle,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Metallic highlight overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
          transform: [{ scaleX: 1.5 }],
          backgroundColor: dashboardBackground.highlight,
          opacity: 0.15
        }} />
        
        {/* Metallic shadow overlay */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          borderTopLeftRadius: 100,
          borderTopRightRadius: 100,
          transform: [{ scaleX: 1.5 }],
          backgroundColor: dashboardBackground.shadow,
          opacity: 0.1
        }} />
        
        {/* Content */}
        <View style={{ flex: 1, zIndex: 1 }}>
          {children}
        </View>
      </LinearGradient>
    );
  }
  
  // Fallback for themes without metallic styling
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: dashboardBackground?.base || currentTheme.colors.background 
    }}>
      {children}
    </View>
  );
}; 