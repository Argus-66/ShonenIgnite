import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface WorkoutHeatmapProps {
  month: Date;
  data: { [date: string]: number };
  maxValue: number;
  onDayPress?: (date: string, count: number) => void;
}

export const WorkoutHeatmap = ({ month, data, maxValue, onDayPress }: WorkoutHeatmapProps) => {
  const { currentTheme } = useTheme();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getColor = (count: number) => {
    if (count === 0) return `${currentTheme.colors.accent}15`;
    const intensity = Math.min((count / maxValue) * 0.8 + 0.2, 1);
    const color = `${currentTheme.colors.accent}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    return color;
  };

  const renderCalendar = () => {
    const cellSize = Math.min((Dimensions.get('window').width - 150) / 7, 35);
    const cellGap = 6;
    
    // Create a 7×6 matrix representing each day cell (7 days per week, max 6 weeks)
    const dayMatrix = Array(7).fill(null).map(() => Array(6).fill(null));
    
    let day = 1;
    for (let week = 0; week < 6; week++) { // 6 possible weeks in a month view
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < firstDay) || day > daysInMonth) {
          // Empty cell - before first day or after last day
          dayMatrix[dayOfWeek][week] = null;
        } else {
          dayMatrix[dayOfWeek][week] = day++;
        }
      }
    }
    
    // Render each row (representing a day of the week)
    return weekDays.map((weekDayName, dayOfWeek) => {
      // Check if this row has any days
      if (dayMatrix[dayOfWeek].every(d => d === null)) return null;
      
      const dayCells = dayMatrix[dayOfWeek].map((dayNum, week) => {
        if (dayNum === null) {
          return (
            <View 
              key={`empty-${dayOfWeek}-${week}`} 
              style={[
                styles.dayCell, 
                { 
                  width: cellSize, 
                  height: cellSize, 
                  margin: cellGap/2,
                  backgroundColor: 'transparent',
                }
              ]} 
            />
          );
        }
        
        const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const count = data[date] || 0;
        const color = getColor(count);
        
        return (
          <TouchableOpacity
            key={`day-${dayNum}`}
            style={[
              styles.dayCell,
              {
                width: cellSize,
                height: cellSize,
                margin: cellGap/2,
                backgroundColor: color,
                borderColor: count > 0 ? `${currentTheme.colors.accent}60` : 'transparent',
                shadowColor: count > 0 ? color : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: count > 0 ? 0.9 : 0,
                shadowRadius: count > 0 ? Math.min(count * 3, 12) : 0,
                elevation: count > 0 ? Math.min(count * 3, 12) : 0,
              },
            ]}
            onPress={() => {
              if (onDayPress) onDayPress(date, count);
            }}
          >
            <ThemedText style={[
              styles.dayText, 
              { 
                opacity: count > 0 ? 1 : 0.7, 
                fontSize: cellSize * 0.4,
                color: count > 0 ? '#FFFFFF' : `${currentTheme.colors.text}80`,
                fontWeight: count > 0 ? 'bold' : 'normal',
                textShadowColor: count > 0 ? color : 'transparent',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: count > 0 ? 5 : 0,
              }
            ]}>
              {dayNum}
            </ThemedText>
          </TouchableOpacity>
        );
      });
      
      return (
        <View key={`row-${dayOfWeek}`} style={styles.weekRow}>
          <View style={styles.weekDayLabelContainer}>
            <ThemedText style={[styles.weekDayLabel, { color: `${currentTheme.colors.text}80` }]}>
              {weekDayName}
            </ThemedText>
          </View>
          <View style={styles.daysRow}>
            {dayCells}
          </View>
        </View>
      );
    }).filter(Boolean); // Remove null rows
  };

  const renderColumnHeaders = () => {
    const cellSize = Math.min((Dimensions.get('window').width - 150) / 7, 35);
    const cellGap = 6;
    
    // Calculate the number of weeks in the current month view
    const weeksCount = Math.ceil((firstDay + daysInMonth) / 7);
    
    // Generate week numbers or labels
    const weekLabels = Array(weeksCount).fill(0).map((_, i) => `W${i+1}`);
    
    return (
      <View style={styles.columnHeaders}>
        <View style={styles.weekDayLabelContainer}>
          {/* Empty cell for the left corner where row/column headers meet */}
        </View>
        <View style={styles.daysRow}>
          {weekLabels.map((label, index) => (
            <View
              key={`header-${index}`}
              style={[
                styles.columnHeader,
                {
                  width: cellSize,
                  margin: cellGap/2,
                }
              ]}
            >
              <ThemedText style={[styles.columnHeaderText, { color: `${currentTheme.colors.text}80` }]}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[
      { 
        width: '100%',
        backgroundColor: `${currentTheme.colors.accent}20`,
        borderRadius: 12,
        padding: 16,
        marginTop: 16 
      }
    ]}>
      {renderColumnHeaders()}
      {renderCalendar()}
    </View>
  );
};

const styles = StyleSheet.create({
  columnHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center'
  },
  columnHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekDayLabelContainer: {
    width: 40,
    justifyContent: 'center',
    paddingRight: 8,
  },
  weekDayLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    flex: 1,
  },
  dayCell: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    opacity: 0.7,
    fontWeight: '500',
  }
}); 