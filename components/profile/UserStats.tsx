import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UserStatsProps {
  age: number;
  gender: string;
  height: number;
  weight: number;
}

export const UserStats = ({ age, gender, height, weight }: UserStatsProps) => {
  const { currentTheme } = useTheme();

  const statItems = [
    {
      icon: 'calendar-month',
      label: 'Age',
      value: `${age}`,
    },
    {
      icon: gender === 'female' ? 'gender-female' : 'gender-male',
      label: 'Gender',
      value: gender === 'female' ? 'female' : 'male',
    },
    {
      icon: 'human-male-height',
      label: 'Height',
      value: `${height} cm`,
    },
    {
      icon: 'weight',
      label: 'Weight',
      value: `${weight} kg`,
    },
  ];

  return (
    <View style={[styles.container, { borderColor: `${currentTheme.colors.border}30` }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="card-account-details" 
          size={20} 
          color={currentTheme.colors.accent} 
        />
        <ThemedText style={styles.title}>Personal Details</ThemedText>
      </View>
      
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.statItem, 
              { 
                backgroundColor: `${currentTheme.colors.card}70`,
                borderColor: `${currentTheme.colors.accent}30`,
                shadowColor: currentTheme.colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${currentTheme.colors.accent}20` }]}>
              <MaterialCommunityIcons 
                name={item.icon} 
                size={22} 
                color={currentTheme.colors.accent} 
              />
            </View>
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <ThemedText style={styles.value}>{item.value}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%', // 2 items per row with small gap
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 