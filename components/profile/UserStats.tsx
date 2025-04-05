import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface UserStatsProps {
  age: number;
  gender: string;
  height: number;
  weight: number;
}

export const UserStats = ({ age, gender, height, weight }: UserStatsProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={styles.statsRow}>
      {/* Age Stat */}
      <View style={[styles.statBox, {
        borderColor: currentTheme.colors.text,
        backgroundColor: '#1c1c2e'
      }]}>
        <View style={styles.statIcon}>
          <MaterialCommunityIcons name="calendar" size={20} color={currentTheme.colors.text} />
        </View>
        <ThemedText style={styles.statLabel}>Age</ThemedText>
        <ThemedText style={styles.statValue}>{age || 21} years</ThemedText>
      </View>
      
      {/* Gender Stat */}
      <View style={[styles.statBox, {
        borderColor: currentTheme.colors.accent,
        backgroundColor: '#1c1c2e'
      }]}>
        <View style={[styles.statIcon, {backgroundColor: currentTheme.colors.accent + '20'}]}>
          <MaterialCommunityIcons 
            name={gender === 'male' ? 'gender-male' : 'gender-female'} 
            size={20} 
            color={currentTheme.colors.accent} 
          />
        </View>
        <ThemedText style={[styles.statLabel, {color: currentTheme.colors.accent}]}>Gender</ThemedText>
        <ThemedText style={[styles.statValue, {color: currentTheme.colors.accent}]}>{gender || 'male'}</ThemedText>
      </View>
      
      {/* Height Stat */}
      <View style={[styles.statBox, {
        borderColor: currentTheme.colors.secondary,
        backgroundColor: '#1c1c2e'
      }]}>
        <View style={[styles.statIcon, {backgroundColor: currentTheme.colors.secondary + '20'}]}>
          <MaterialCommunityIcons name="human-male-height" size={20} color={currentTheme.colors.secondary} />
        </View>
        <ThemedText style={[styles.statLabel, {color: currentTheme.colors.secondary}]}>Height</ThemedText>
        <ThemedText style={[styles.statValue, {color: currentTheme.colors.secondary}]}>{height || 178} cm</ThemedText>
      </View>
      
      {/* Weight Stat */}
      <View style={[styles.statBox, {
        borderColor: currentTheme.colors.text,
        backgroundColor: '#1c1c2e'
      }]}>
        <View style={styles.statIcon}>
          <MaterialCommunityIcons name="weight" size={20} color={currentTheme.colors.text} />
        </View>
        <ThemedText style={styles.statLabel}>Weight</ThemedText>
        <ThemedText style={styles.statValue}>{weight || 84} kg</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    width: '23%',
    borderWidth: 1,
  },
  statIcon: {
    borderRadius: 10,
    padding: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  statValue: {
    fontSize: 14,
    textAlign: 'center',
  }
}); 