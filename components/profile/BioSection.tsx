import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface BioSectionProps {
  bio: string;
}

export const BioSection = ({ bio }: BioSectionProps) => {
  const { currentTheme } = useTheme();
  const defaultBio = "No bio yet. Tell others about yourself!";

  return (
    <View style={[styles.container, { 
      borderColor: `${currentTheme.colors.border}30`,
      backgroundColor: `${currentTheme.colors.background}70`,
    }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="text-box-outline" 
          size={20} 
          color={currentTheme.colors.accent} 
        />
        <ThemedText style={styles.title}>Bio</ThemedText>
      </View>
      
      <View style={[styles.bioContent, { 
        backgroundColor: `${currentTheme.colors.card}60`,
        borderColor: `${currentTheme.colors.accent}20`,
      }]}>
        <ThemedText style={[
          styles.bioText, 
          !bio && { fontStyle: 'italic', opacity: 0.7 }
        ]}>
          {bio || defaultBio}
        </ThemedText>
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
  bioContent: {
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 