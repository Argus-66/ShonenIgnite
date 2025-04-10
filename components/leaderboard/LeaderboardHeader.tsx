import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { RankingLevel, TimePeriod } from '@/hooks/useLeaderboard';
import { LeaderboardFilters } from './LeaderboardFilters';

interface LeaderboardHeaderProps {
  rankingLevel: RankingLevel;
  timePeriod: TimePeriod;
  onRankingLevelChange: (level: RankingLevel) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
  currentUserLocation: {country: string, continent: string, region: string} | null;
  onCountryChange: (country: string) => void;
  onContinentChange: (continent: string) => void;
  selectedCountry: string | null;
  selectedContinent: string | null;
}

export const LeaderboardHeader = ({ 
  rankingLevel,
  timePeriod,
  onRankingLevelChange,
  onTimePeriodChange,
  currentUserLocation,
  onCountryChange,
  onContinentChange,
  selectedCountry,
  selectedContinent
}: LeaderboardHeaderProps) => {
  const { currentTheme } = useTheme();

  const getHeaderTitle = () => {
    let locationLabel = '';
    
    if (rankingLevel === 'continental' && selectedContinent && selectedContinent !== 'Unknown') {
      locationLabel = selectedContinent;
    } else if (rankingLevel === 'country' && selectedCountry && selectedCountry !== 'Unknown') {
      locationLabel = selectedCountry;
    } else if (rankingLevel === 'regional') {
      locationLabel = 'Regional';
    } else if (rankingLevel === 'global') {
      locationLabel = 'Global';
    } else if (rankingLevel === 'followers') {
      locationLabel = 'Following';
    }
    
    return `${locationLabel} Leaderboard`;
  };

  const getSubtitle = () => {
    const timePeriodLabel = timePeriod === 'overall' ? 'All Time' : 
                         timePeriod === 'monthly' ? 'This Month' :
                         timePeriod === 'weekly' ? 'This Week' : 'Today';
    
    return timePeriodLabel;
  };

  return (
    <View style={styles.header}>
      <ThemedText style={styles.title}>{getHeaderTitle()}</ThemedText>
      <ThemedText style={styles.subtitle}>{getSubtitle()}</ThemedText>
      
      <LeaderboardFilters
        currentRankingLevel={rankingLevel}
        currentTimePeriod={timePeriod}
        onRankingLevelChange={onRankingLevelChange}
        onTimePeriodChange={onTimePeriodChange}
        currentUserLocation={currentUserLocation}
        onCountryChange={onCountryChange}
        onContinentChange={onContinentChange}
        selectedCountry={selectedCountry}
        selectedContinent={selectedContinent}
      />
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 15,
  }
}); 