import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { ActivityStats } from './ActivityStats';
import { WorkoutHeatmap } from './WorkoutHeatmap';

interface ActivitySectionProps {
  selectedMonth: Date;
  workoutData: { [date: string]: number };
  maxWorkouts: number;
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  onMonthChange: (increment: number) => void;
  onDayPress: (date: string, count: number) => void;
}

export const ActivitySection = ({ 
  selectedMonth, 
  workoutData, 
  maxWorkouts,
  totalWorkouts,
  currentStreak,
  bestStreak,
  onMonthChange,
  onDayPress
}: ActivitySectionProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.activitySection, { 
      backgroundColor: `${currentTheme.colors.accent}10`, 
      borderRadius: 16, 
      padding: 16,
      marginTop: 24,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: `${currentTheme.colors.accent}30`,
    }]}>
      <ThemedText style={styles.activityTitle}>Activity</ThemedText>
      <View style={[styles.activityContent, { backgroundColor: `${currentTheme.colors.accent}15`, borderRadius: 16 }]}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => onMonthChange(-1)}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={currentTheme.colors.accent} />
          </TouchableOpacity>
          <ThemedText style={styles.monthText}>
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </ThemedText>
          <TouchableOpacity onPress={() => onMonthChange(1)}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={currentTheme.colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Activity Stats */}
        <ActivityStats 
          totalWorkouts={totalWorkouts}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
        />

        {/* Workout Heatmap */}
        <WorkoutHeatmap
          month={selectedMonth}
          data={workoutData}
          maxValue={maxWorkouts}
          onDayPress={onDayPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activitySection: {
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityContent: {
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
  }
});
