import { View, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useRef, useEffect } from 'react';

interface ActivityStatsProps {
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
}

// Glowing icon component for the stats
const GlowingStatsIcon = ({ name, color }: { name: any, color: string }) => {
  const { isDarkMode } = useTheme();
  const pulseValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create a pulsing animation for the glow
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    );
    
    // Start the animation
    pulseAnimation.start();
    
    // Clean up animation when component unmounts
    return () => {
      pulseAnimation.stop();
    };
  }, []);
  
  // Interpolate the shadow opacity for the pulse effect
  const glowIntensity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1]
  });
  
  // Interpolate the shadow radius for the pulse effect
  const glowSize = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 15]
  });
  
  return (
    <View style={styles.iconContainer}>
      {/* Glow layer */}
      <Animated.View style={[
        styles.glowLayer,
        {
          backgroundColor: 'transparent',
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowIntensity,
          shadowRadius: glowSize,
          opacity: isDarkMode ? 0.9 : 0.7,
        }
      ]} />
      
      {/* Icon with its own shadow for extra definition */}
      <MaterialCommunityIcons
        name={name}
        size={28}
        color={color}
        style={[styles.iconWithShadow, {
          textShadowColor: color,
          textShadowRadius: isDarkMode ? 15 : 10,
          textShadowOffset: { width: 0, height: 0 },
        }]}
      />
    </View>
  );
};

export const ActivityStats = ({ 
  totalWorkouts, 
  currentStreak, 
  bestStreak 
}: ActivityStatsProps) => {
  const { currentTheme } = useTheme();

  const statItems = [
    {
      icon: 'dumbbell',
      label: 'Total Workouts',
      value: totalWorkouts,
    },
    {
      icon: 'fire',
      label: 'Current Streak',
      value: currentStreak,
    },
    {
      icon: 'trophy',
      label: 'Best Streak',
      value: bestStreak,
    },
  ];

  return (
    <View style={styles.statsContainer}>
      {statItems.map((item, index) => (
        <View 
          key={index} 
          style={[
            styles.statItem, 
            { 
              backgroundColor: `${currentTheme.colors.card}80`,
              borderColor: `${currentTheme.colors.border}40`,
              width: `${(100 / statItems.length) - 3}%`, // Distribute evenly with spacing
            }
          ]}
        >
          <GlowingStatsIcon name={item.icon} color={currentTheme.colors.accent} />
          <ThemedText style={styles.statValue}>{item.value}</ThemedText>
          <ThemedText style={styles.statLabel}>{item.label}</ThemedText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  glowLayer: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    zIndex: 1,
    elevation: 20,
  },
  iconWithShadow: {
    position: 'absolute',
    zIndex: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  }
}); 