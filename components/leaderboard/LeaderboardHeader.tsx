import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface LeaderboardHeaderProps {
  showGlobal: boolean;
  onToggleView: () => void;
}

export const LeaderboardHeader = ({ 
  showGlobal,
  onToggleView
}: LeaderboardHeaderProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={styles.header}>
      <ThemedText style={styles.title}>Leaderboard</ThemedText>
      
      <View style={styles.tabs}>
        <View 
          style={[
            styles.tab,
            showGlobal ? styles.activeTab : {},
            { borderColor: currentTheme.colors.accent }
          ]}
          onTouchEnd={onToggleView}
        >
          <MaterialCommunityIcons 
            name="earth" 
            size={18} 
            color={showGlobal ? currentTheme.colors.accent : currentTheme.colors.textSecondary} 
          />
          <ThemedText 
            style={[
              styles.tabText,
              showGlobal ? { color: currentTheme.colors.accent } : {}
            ]}
          >
            Global
          </ThemedText>
        </View>
        
        <View 
          style={[
            styles.tab,
            !showGlobal ? styles.activeTab : {},
            { borderColor: currentTheme.colors.accent }
          ]}
          onTouchEnd={onToggleView}
        >
          <MaterialCommunityIcons 
            name="map-marker" 
            size={18} 
            color={!showGlobal ? currentTheme.colors.accent : currentTheme.colors.textSecondary} 
          />
          <ThemedText 
            style={[
              styles.tabText,
              !showGlobal ? { color: currentTheme.colors.accent } : {}
            ]}
          >
            Nearby
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    marginLeft: 6,
    fontWeight: '500',
  },
}); 