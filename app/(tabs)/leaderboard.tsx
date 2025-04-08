import { StyleSheet, View, SafeAreaView, Platform, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { LocationPermission } from '@/components/leaderboard/LocationPermission';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { saveUserLocation } from '@/utils/locationService';

export default function LeaderboardScreen() {
  const { currentTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const [showGlobal, setShowGlobal] = useState(true);
  
  const { 
    globalUsers, 
    nearbyUsers, 
    loading,
    error,
    currentUserId,
    refreshLeaderboard 
  } = useLeaderboard();

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
    
    await refreshLeaderboard();
    setRefreshing(false);
  }, [locationPermission, refreshLeaderboard]);

  const handleUserPress = (userId: string) => {
    // Navigate to user profile or show user details
    console.log(`Pressed user with ID: ${userId}`);
  };

  const toggleView = () => {
    setShowGlobal(!showGlobal);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={currentTheme.colors.background}
      />
      <ThemedView style={styles.container}>
        <LeaderboardHeader 
          showGlobal={showGlobal} 
          onToggleView={toggleView} 
        />
        
        {!hasCheckedPermission ? (
          <View style={styles.contentContainer}>
            {/* Loading state handled by LeaderboardList */}
          </View>
        ) : locationPermission !== 'granted' && !showGlobal ? (
          <LocationPermission onRequestPermission={requestLocationPermission} />
        ) : (
          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[currentTheme.colors.accent]}
                  tintColor={currentTheme.colors.accent}
                />
              }
            >
              <LeaderboardList
                users={showGlobal ? globalUsers : nearbyUsers}
                currentUserId={currentUserId || ''}
                loading={loading}
                onUserPress={handleUserPress}
              />
            </ScrollView>
          </View>
        )}
      </ThemedView>
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
  },
}); 