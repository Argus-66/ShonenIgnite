import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Example component showing how to implement a metallic background
 * using the new theme properties
 */
export const MetallicDashboardBackground = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useTheme();
  // Safely access the background property which might not exist in all themes
  const dashboardBackground = currentTheme.colors.dashboard?.background as any;
  
  // Only apply metallic styling if the flag is set
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
        style={styles.container}
      >
        {/* Metallic highlight overlay */}
        <View style={[
          styles.highlightOverlay, 
          { backgroundColor: dashboardBackground.highlight, opacity: 0.15 }
        ]} />
        
        {/* Metallic shadow overlay */}
        <View style={[
          styles.shadowOverlay,
          { backgroundColor: dashboardBackground.shadow, opacity: 0.1 }
        ]} />
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    );
  }
  
  // Fallback for themes without metallic styling
  return (
    <View style={[
      styles.container, 
      { backgroundColor: dashboardBackground?.base || currentTheme.colors.background }
    ]}>
      {children}
    </View>
  );
};

/**
 * To use this component, wrap your dashboard content:
 * 
 * <MetallicDashboardBackground>
 *   <YourDashboardContent />
 * </MetallicDashboardBackground>
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  content: {
    flex: 1,
    zIndex: 1,
  }
});

/**
 * For an even more metallic look, you could add these elements:
 * 
 * 1. Subtle pattern overlay using a repeating image
 * 2. Light shadow for depth
 * 3. Slight border highlight at the edges
 */
export const MetallicCard = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  const { currentTheme } = useTheme();
  // Safely access the background property which might not exist in all themes
  const dashboardBackground = currentTheme.colors.dashboard?.background as any;
  
  if (!dashboardBackground?.metallic) {
    return <View style={[cardStyles.card, style]}>{children}</View>;
  }
  
  return (
    <View style={[
      cardStyles.card,
      {
        backgroundColor: dashboardBackground.base,
        borderColor: dashboardBackground.highlight,
        shadowColor: dashboardBackground.shadow,
      },
      style
    ]}>
      <LinearGradient
        colors={[dashboardBackground.gradient.start, dashboardBackground.gradient.middle, dashboardBackground.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={cardStyles.cardGradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    margin: 8,
  },
  cardGradient: {
    padding: 16,
  },
}); 