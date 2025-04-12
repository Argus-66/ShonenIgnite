import { StyleSheet, View, SafeAreaView, Platform, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { LocationPermission } from '@/components/leaderboard/LocationPermission';
import useLeaderboard, { RankingLevel, TimePeriod } from '@/hooks/useLeaderboard';
import { saveUserLocation } from '@/utils/locationService';
import { updateCurrentUserXpCalc } from '@/utils/xpCalcService';
import { useRouter } from 'expo-router';
import { auth } from '@/config/firebase';
import { LeaderboardUser } from '@/components/leaderboard/LeaderboardItem';

export default function LeaderboardScreen() {
  const { currentTheme, isDarkMode } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  
  const { 
    users: leaderboardData,
    loading,
    error,
    noUsersFound,
    currentRankingLevel,
    currentTimePeriod,
    selectedContinent,
    selectedCountry,
    hasLocationPermission,
    changeRankingLevel,
    changeTimePeriod,
    changeSelectedCountry,
    changeSelectedContinent,
    toggleFollowUser: handleFollowToggle
  } = useLeaderboard();

  const currentUserId = auth.currentUser?.uid || '';

  // Function to request location permission and get location
  const requestLocationPermission = async () => {
    try {
      // Check if we've already gotten permission before
      const hasAskedBefore = await AsyncStorage.getItem('hasAskedLocationPermission');
      const hasLocation = await AsyncStorage.getItem('hasLocationStored');
      
      // If we've already asked and user has given permission previously, don't ask again
      if (hasAskedBefore === 'true' && hasLocation === 'true') {
        setHasCheckedPermission(true);
        return;
      }
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      // Mark that we've asked for permission
      await AsyncStorage.setItem('hasAskedLocationPermission', 'true');
      
      if (status === 'granted') {
        // Save user location to database
        const success = await saveUserLocation();
        if (success) {
          await AsyncStorage.setItem('hasLocationStored', 'true');
          // Update the xpCalc collection with location data
          await updateCurrentUserXpCalc();
        }
      }
      
      setHasCheckedPermission(true);
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setHasCheckedPermission(true);
    }
  };

  // Check permission when component mounts
  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // If permission was denied before, ask again on refresh
    if (locationPermission !== 'granted') {
      await requestLocationPermission();
    }
    
    // Update xpCalc data to ensure it's current
    await updateCurrentUserXpCalc();
    
    setRefreshing(false);
  }, [locationPermission]);

  const handleUserPress = (userId: string) => {
    // Navigate to user profile
    router.push(`/profile/${userId}` as const);
  };

  const handleRankingTypeChange = (level: RankingLevel) => {
    changeRankingLevel(level);
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    changeTimePeriod(period);
  };

  const handleCountryChange = (country: string) => {
    // First ensure we're on the country ranking level, then update the selected country
    changeRankingLevel('country');
    // Short delay to ensure ranking level change is processed first
    setTimeout(() => {
      changeSelectedCountry(country);
    }, 100);
  };

  const handleContinentChange = (continent: string) => {
    // First ensure we're on the continental ranking level, then update the selected continent
    changeRankingLevel('continental');
    // Short delay to ensure ranking level change is processed first
    setTimeout(() => {
      changeSelectedContinent(continent);
    }, 100);
  };

  const isLocationNeeded = () => {
    return currentRankingLevel === 'regional' && !hasLocationPermission;
  };

  const toggleFollowUser = async (userId: string) => {
    await handleFollowToggle(userId);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colors.background}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.accent]}
            tintColor={currentTheme.colors.accent}
            progressBackgroundColor={currentTheme.colors.background}
          />
        }
      >
        <ThemedView style={styles.container}>
          <LeaderboardHeader 
            rankingLevel={currentRankingLevel}
            timePeriod={currentTimePeriod}
            onRankingLevelChange={handleRankingTypeChange}
            onTimePeriodChange={handleTimePeriodChange}
            currentUserLocation={null} // This will be fetched from the xpCalc collection
            onCountryChange={handleCountryChange} 
            onContinentChange={handleContinentChange}
            selectedCountry={selectedCountry}
            selectedContinent={selectedContinent}
          />
          
          {!hasCheckedPermission ? (
            <View style={styles.contentContainer}>
              {/* Loading state handled by LeaderboardList */}
            </View>
          ) : isLocationNeeded() ? (
            <LocationPermission onRequestPermission={requestLocationPermission} />
          ) : (
            <View style={{ flex: 1 }}>
              <LeaderboardList
                users={leaderboardData}
                currentUserId={currentUserId}
                loading={loading}
                error={error}
                noUsersFound={noUsersFound}
                onUserPress={handleUserPress}
                onFollowToggle={toggleFollowUser}
              />
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
}); 