import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface WorkoutHeatmapProps {
  month: Date;
  workoutData: { [date: string]: number };
  maxWorkouts: number;
  onDayPress: (date: string) => void;
}

export const WorkoutHeatmap = ({
  month,
  workoutData,
  maxWorkouts,
  onDayPress
}: WorkoutHeatmapProps) => {
  const { currentTheme } = useTheme();

  // Ensure month is a Date object to avoid "month.getFullYear is not a function" error
  const currentMonth = month instanceof Date ? month : new Date();
  
  // Get the current month's data
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth(); // 0-based (0 = January, 11 = December)

  // Get the first day of the month
  const firstDay = new Date(year, monthIndex, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  // Get current date for today's highlight
  const today = new Date();
  const isCurrentMonth = today.getMonth() === monthIndex && today.getFullYear() === year;

  // Generate calendar weeks
  const weeks = [];
  let currentWeek = [];
  
  // Add empty days for the first week
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= lastDay; day++) {
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  // Fill the last week with empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Function to handle day press
  const handleDayPress = (day: number | null) => {
    if (day === null) return;
    
    // Format date string as YYYY-MM-DD, ensuring month and day are padded with zeros
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log(`WorkoutHeatmap selected date: ${dateStr}`);
    onDayPress(dateStr);
  };

  // Function to get color intensity based on workout count
  const getColorIntensity = (day: number | null) => {
    if (day === null) return 'transparent';
    
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = workoutData[dateStr] || 0;
    
    if (count === 0) {
      // Light neutral background for days with no activity
      return `${currentTheme.colors.background}80`; 
    }
    
    // Calculate intensity based on the max workout value
    const maxValue = Math.max(1, maxWorkouts);
    const intensity = count / maxValue;
    
    // Create vibrant color intensity gradients based on theme accent color
    if (intensity < 0.2) {
      // Lighter shade - low intensity
      return `${currentTheme.colors.accent}30`;
    } else if (intensity < 0.4) {
      // Medium-light shade
      return `${currentTheme.colors.accent}50`;
    } else if (intensity < 0.6) {
      // Medium shade
      return `${currentTheme.colors.accent}70`;
    } else if (intensity < 0.8) {
      // Medium-high shade
      return `${currentTheme.colors.accent}90`;
    } else {
      // Highest intensity
      return currentTheme.colors.accent;
    }
  };

  // Enhanced shadow style for days with workouts
  const getDayShadowStyle = (day: number | null) => {
    if (day === null) return {};
    
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = workoutData[dateStr] || 0;
    
    if (count === 0) {
      return {}; // No shadow for days with no activity
    }
    
    // Calculate shadow intensity based on the workout count
    const maxValue = Math.max(1, maxWorkouts);
    const intensity = count / maxValue;
    
    // Enhanced shadow effect for more visual pop using theme accent color
    return {
      shadowColor: currentTheme.colors.accent,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.8, // Strong shadow
      shadowRadius: 5 + (intensity * 5), // Larger blur radius
      elevation: 4 + Math.floor(intensity * 6), // Higher elevation for Android
    };
  };

  // Day labels
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.container, {
      backgroundColor: `${currentTheme.colors.background}90`,
      borderWidth: 1,
      borderColor: `${currentTheme.colors.border}40`,
      borderRadius: 14,
      padding: 14,
    }]}>
      {/* Day labels */}
      <View style={styles.labelRow}>
        {dayLabels.map((label, index) => (
          <ThemedText key={`label-${index}`} style={[styles.dayLabel, {
            color: `${currentTheme.colors.text}90`,
            fontWeight: 'bold',
          }]}>
            {label}
          </ThemedText>
        ))}
      </View>
      
      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.week}>
          {week.map((day, dayIndex) => {
            const dateStr = day !== null ? `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const hasWorkout = day !== null && (workoutData[dateStr] || 0) > 0;
            const isToday = isCurrentMonth && day === today.getDate();
            
            return (
              <TouchableOpacity
                key={`day-${dayIndex}`}
                style={[
                  styles.day,
                  {
                    backgroundColor: getColorIntensity(day),
                    borderColor: isToday ? currentTheme.colors.accent : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    opacity: day === null ? 0 : 1,
                    transform: hasWorkout ? [{ scale: 1.1 }] : [],
                  },
                  hasWorkout && getDayShadowStyle(day),
                  hasWorkout && styles.workoutDayGlow
                ]}
                onPress={() => handleDayPress(day)}
                disabled={day === null}
              >
                {day !== null && (
                  <ThemedText 
                    style={[
                      styles.dayText, 
                      hasWorkout && styles.workoutDayText,
                      isToday && [styles.todayText, { 
                        color: hasWorkout ? '#FFFFFF' : currentTheme.colors.text, 
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1
                      }]
                    ]}
                  >
                    {day}
                  </ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 12,
    width: 30,
    textAlign: 'center',
    fontWeight: '700',
    opacity: 0.8,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 8, // More rounded corners for modern look
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600', // Slightly bolder
    color: 'rgba(255, 255, 255, 0.85)',
  },
  workoutDayGlow: {
    overflow: 'visible', // Allow shadow to expand beyond bounds
  },
  workoutDayText: {
    fontWeight: '800', // Extra bold for days with workouts
    fontSize: 14, // Larger text
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  todayText: {
    fontWeight: '900',
  }
}); 