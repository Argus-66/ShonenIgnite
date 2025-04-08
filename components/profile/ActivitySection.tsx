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
  onMonthChange: (date: Date) => void;
  onDayPress: (date: string) => void;
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

  // Ensure selectedMonth is always a Date object
  const currentMonth = selectedMonth instanceof Date ? new Date(selectedMonth) : new Date();
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  // Format month name and year
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  return (
    <View style={[styles.activitySection, { 
      backgroundColor: `${currentTheme.colors.accent}10`, 
      borderRadius: 16, 
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: `${currentTheme.colors.accent}30`,
    }]}>
      <ThemedText style={styles.activityTitle}>Activity</ThemedText>
      <View style={[styles.activityContent, { backgroundColor: `${currentTheme.colors.accent}15`, borderRadius: 16 }]}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity 
            onPress={handlePrevMonth} 
            style={[
              styles.navButton, 
              { 
                backgroundColor: `${currentTheme.colors.accent}20`,
                borderRadius: 8,
                padding: 8,
              }
            ]}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={currentTheme.colors.accent} />
          </TouchableOpacity>
          
          <View style={styles.monthTextContainer}>
            <ThemedText style={[styles.monthText, { color: currentTheme.colors.accent }]}>
              {`${monthName} ${year}`}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            onPress={handleNextMonth} 
            style={[
              styles.navButton, 
              { 
                backgroundColor: `${currentTheme.colors.accent}20`,
                borderRadius: 8,
                padding: 8,
              }
            ]}
          >
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
          month={currentMonth}
          workoutData={workoutData}
          maxWorkouts={maxWorkouts}
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});
