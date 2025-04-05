import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface ActivityStatsProps {
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
}

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
          <MaterialCommunityIcons 
            name={item.icon as any} 
            size={24} 
            color={currentTheme.colors.accent} 
            style={styles.statIcon} 
          />
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
  statIcon: {
    marginBottom: 4,
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