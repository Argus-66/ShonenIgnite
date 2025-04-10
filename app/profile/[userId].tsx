import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Modal, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '@/config/firebase';
import { collection, query, doc, getDoc, getDocs, updateDoc, where, orderBy, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { format, parseISO, isValid } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import getProfileImageByTheme from '@/utils/profileImages';
import { ActivitySection } from '@/components/profile/ActivitySection';
import ProfileImage from '@/components/ProfileImage';

interface UserProfile {
  username: string;
  bio: string;
  theme: string;
  streak: number;
  bestStreak: number;
  followers: string[];
  following: string[];
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const { currentTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string, following: string[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<{ [date: string]: number }>({});
  const [maxWorkouts, setMaxWorkouts] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayWorkouts, setDayWorkouts] = useState<any[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
    loadCurrentUser();
  }, [userId]);

  // Update workout data when month changes
  useEffect(() => {
    if (userProfile) {
      loadWorkoutData();
    }
  }, [selectedMonth, userProfile]);

  async function loadCurrentUser() {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          id: auth.currentUser.uid,
          following: userData.following || []
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  async function loadUserProfile() {
    if (!userId) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId.toString()));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          username: userData.username,
          bio: userData.bio || 'No bio yet',
          theme: userData.theme || 'default',
          streak: userData.streak || 0,
          bestStreak: userData.bestStreak || 0,
          followers: userData.followers || [],
          following: userData.following || [],
          age: userData.age,
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkoutData() {
    if (!userId) return;

    try {
      console.log('Loading workout data for month:', selectedMonth);
      
      // Get actual workout data from the database
      const progressRef = doc(db, 'daily_workout_progress', userId.toString());
      const progressDoc = await getDoc(progressRef);
      
      const workoutsData: { [date: string]: number } = {};
      
      // Make sure we have a Date object for the month
      const currentMonth = selectedMonth instanceof Date 
        ? selectedMonth.getMonth() 
        : new Date().getMonth();
        
      const currentYear = selectedMonth instanceof Date 
        ? selectedMonth.getFullYear() 
        : new Date().getFullYear();
      
      console.log(`Processing data for ${currentYear}-${currentMonth + 1}`);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        console.log('Workout progress data keys:', Object.keys(data));
        
        // Process all workouts for the month
        Object.entries(data).forEach(([workoutName, dateEntries]: [string, any]) => {
          console.log(`Processing workout: ${workoutName}, dates:`, Object.keys(dateEntries));
          
          Object.entries(dateEntries).forEach(([dateStr, workoutData]: [string, any]) => {
            // Parse the date from the format YYYY-MM-DD
            const [year, month, day] = dateStr.split('-').map(Number);
            
            console.log(`Checking date: ${dateStr}, year: ${year}, month: ${month}, targetMonth: ${currentMonth + 1}`);
            
            // Check if this workout belongs to the selected month
            if (year === currentYear && month - 1 === currentMonth) {
              // If this date already has workouts, increment the count
              if (workoutsData[dateStr]) {
                workoutsData[dateStr] += 1;
              } else {
                workoutsData[dateStr] = 1;
              }
              
              // Track the maximum number of workouts for scaling the heat map
              if (workoutsData[dateStr] > maxWorkouts) {
                setMaxWorkouts(workoutsData[dateStr]);
              }
              
              console.log(`Added workout for ${dateStr}, count: ${workoutsData[dateStr]}`);
            }
          });
        });
      }
      
      console.log('Final workout data:', workoutsData);
      setWorkoutData(workoutsData);
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  }

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  const handleFollowUser = async () => {
    if (!auth.currentUser || !currentUser || !userProfile || userId.toString() === auth.currentUser.uid) return;

    try {
      // Update current user's following list
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: arrayUnion(userId.toString())
      });
      
      // Update target user's followers list
      await updateDoc(doc(db, 'users', userId.toString()), {
        followers: arrayUnion(auth.currentUser.uid)
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        following: [...currentUser.following, userId.toString()]
      });
      
      setUserProfile({
        ...userProfile,
        followers: [...userProfile.followers, auth.currentUser.uid]
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async () => {
    if (!auth.currentUser || !currentUser || !userProfile || userId.toString() === auth.currentUser.uid) return;

    try {
      // Update current user's following list
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: arrayRemove(userId.toString())
      });
      
      // Update target user's followers list
      await updateDoc(doc(db, 'users', userId.toString()), {
        followers: arrayRemove(auth.currentUser.uid)
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        following: currentUser.following.filter(id => id !== userId.toString())
      });
      
      setUserProfile({
        ...userProfile,
        followers: userProfile.followers.filter(id => id !== auth.currentUser?.uid)
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const isFollowing = () => {
    return currentUser?.following.includes(userId.toString());
  };

  const handleViewFollowers = async () => {
    if (!userProfile || !userProfile.followers.length) {
      // No followers to display
      setFollowersList([]);
      setShowFollowersModal(true);
      return;
    }
    
    try {
      const followerProfiles = [];
      
      // Fetch each follower's profile data
      for (const followerId of userProfile.followers) {
        const followerDoc = await getDoc(doc(db, 'users', followerId));
        if (followerDoc.exists()) {
          followerProfiles.push({
            id: followerId,
            username: followerDoc.data().username,
            theme: followerDoc.data().theme || 'default'
          });
        }
      }
      
      setFollowersList(followerProfiles);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };
  
  const handleViewFollowing = async () => {
    if (!userProfile || !userProfile.following.length) {
      // No following users to display
      setFollowingList([]);
      setShowFollowingModal(true);
      return;
    }
    
    try {
      const followingProfiles = [];
      
      // Fetch each followed user's profile data
      for (const followingId of userProfile.following) {
        const followingDoc = await getDoc(doc(db, 'users', followingId));
        if (followingDoc.exists()) {
          followingProfiles.push({
            id: followingId,
            username: followingDoc.data().username,
            theme: followingDoc.data().theme || 'default'
          });
        }
      }
      
      setFollowingList(followingProfiles);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error loading following users:', error);
    }
  };

  const loadWorkoutsForDate = async (date: string) => {
    if (!userId) return;

    try {
      setDayWorkouts([]); // Clear previous workouts first
      
      console.log(`Loading workouts for date: ${date}`);
      
      // Get workout data from daily_workout_progress
      const progressRef = doc(db, 'daily_workout_progress', userId.toString());
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        console.log('Data structure keys:', Object.keys(data));
        
        const workoutsForDate: any[] = [];
        
        // Process all workouts for the selected date
        Object.entries(data).forEach(([workoutType, dateEntries]: [string, any]) => {
          if (typeof dateEntries === 'object' && dateEntries !== null) {
            // Try to get workout data for the exact date
            const workoutData = dateEntries[date];
            
            // If we found workout data for this date
            if (workoutData) {
              // Get the workout icon from the workout name
              let icon = "dumbbell";
              if (workoutType.includes("Running")) icon = "run";
              else if (workoutType.includes("Cycling")) icon = "bike";
              else if (workoutType.includes("Walking")) icon = "walk";
              else if (workoutType.includes("Push-ups")) icon = "human";
              else if (workoutType.includes("Squats")) icon = "human-handsdown";
              else if (workoutType.includes("Swimming")) icon = "swim";
              
              // Add this workout to our list
              workoutsForDate.push({
                name: workoutType,
                icon: icon,
                value: workoutData.value || 0,
                unit: workoutData.unit || '',
                date: workoutData.date || date,
                timestamp: workoutData.timestamp || Date.now(),
                completed: true,
              });
            }
          }
        });
        
        // Calculate calories for each workout
        const workoutsWithCalories = workoutsForDate.map((workout) => {
          let calories = 0;
          
          // Simple calories calculation based on workout type and duration/distance
          if (workout.unit === 'minutes') {
            if (workout.name.includes('Running')) {
              calories = Math.round(workout.value * 10);
            } else if (workout.name.includes('Cycling')) {
              calories = Math.round(workout.value * 8);
            } else if (workout.name.includes('Walking')) {
              calories = Math.round(workout.value * 5);
            } else {
              calories = Math.round(workout.value * 6);
            }
          } else if (workout.unit === 'km') {
            if (workout.name.includes('Running')) {
              calories = Math.round(workout.value * 70);
            } else if (workout.name.includes('Cycling')) {
              calories = Math.round(workout.value * 40);
            } else if (workout.name.includes('Walking')) {
              calories = Math.round(workout.value * 50);
            } else {
              calories = Math.round(workout.value * 60);
            }
          } else if (workout.unit === 'reps') {
            calories = Math.round(workout.value * 0.5);
          }
          
          return {
            ...workout,
            calories
          };
        });
        
        // Sort workouts by timestamp, most recent first
        workoutsWithCalories.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`Found ${workoutsWithCalories.length} workouts for date ${date}`);
        setDayWorkouts(workoutsWithCalories);
      } else {
        console.log('No workout progress document exists');
        setDayWorkouts([]);
      }
    } catch (error) {
      console.error('Error loading workouts for date:', error);
      setDayWorkouts([]);
    }
  };

  const handleDayPress = (date: string) => {
    console.log(`Day pressed: ${date}`);
    setSelectedDate(date);
    loadWorkoutsForDate(date);
    setShowDayModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="account-question" size={64} color={currentTheme.colors.text} />
            <ThemedText style={styles.errorText}>User not found</ThemedText>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.screenTitle}>Profile</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={[styles.profileHeader, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
            <View style={styles.profileInfo}>
              <TouchableOpacity 
                style={[styles.avatarContainer, { 
                  borderColor: currentTheme.colors.accent,
                }]}
                onPress={() => setImageViewerVisible(true)}
                activeOpacity={0.8}
              >
                <Image 
                  source={getProfileImageByTheme(userProfile.theme)}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <ThemedText style={styles.username}>{userProfile.username}</ThemedText>
              
              {userId.toString() !== auth.currentUser?.uid && (
                <TouchableOpacity 
                  style={[
                    styles.followButton, 
                    { 
                      backgroundColor: isFollowing() 
                        ? `${currentTheme.colors.border}50` 
                        : currentTheme.colors.accent 
                    }
                  ]}
                  onPress={isFollowing() ? handleUnfollowUser : handleFollowUser}
                >
                  <ThemedText style={[
                    styles.followButtonText, 
                    { color: isFollowing() ? currentTheme.colors.text : '#fff' }
                  ]}>
                    {isFollowing() ? 'Following' : 'Follow'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => handleViewFollowers()}
              >
                <ThemedText style={styles.statValue}>{userProfile.followers.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Followers</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => handleViewFollowing()}
              >
                <ThemedText style={styles.statValue}>{userProfile.following.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Following</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Details Section */}
          <View style={[styles.detailsSection, { backgroundColor: `${currentTheme.colors.accent}10` }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="card-account-details" size={20} color={currentTheme.colors.accent} />
              <ThemedText style={styles.sectionTitle}>Personal Details</ThemedText>
            </View>
            
            <View style={styles.detailsGrid}>
              {userProfile.age && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="calendar-account" size={20} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.detailLabel}>Age</ThemedText>
                  <ThemedText style={styles.detailValue}>{userProfile.age}</ThemedText>
                </View>
              )}
              
              {userProfile.gender && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons 
                    name={userProfile.gender.toLowerCase() === 'male' ? 'gender-male' : 'gender-female'} 
                    size={20} 
                    color={currentTheme.colors.accent} 
                  />
                  <ThemedText style={styles.detailLabel}>Gender</ThemedText>
                  <ThemedText style={styles.detailValue}>{userProfile.gender}</ThemedText>
                </View>
              )}
              
              {userProfile.height && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="human-male-height" size={20} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.detailLabel}>Height</ThemedText>
                  <ThemedText style={styles.detailValue}>{userProfile.height} cm</ThemedText>
                </View>
              )}
              
              {userProfile.weight && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="weight" size={20} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.detailLabel}>Weight</ThemedText>
                  <ThemedText style={styles.detailValue}>{userProfile.weight} kg</ThemedText>
                </View>
              )}
              
              {!userProfile.age && !userProfile.gender && !userProfile.height && !userProfile.weight && (
                <ThemedText style={styles.noDetailsText}>No personal details available</ThemedText>
              )}
            </View>
          </View>

          <BioSection bio={userProfile.bio} />

          <ActivitySection
            selectedMonth={selectedMonth}
            workoutData={workoutData}
            maxWorkouts={maxWorkouts}
            totalWorkouts={Object.values(workoutData).reduce((a, b) => a + b, 0)}
            currentStreak={userProfile.streak || 0}
            bestStreak={userProfile.bestStreak || 0}
            onMonthChange={handleMonthChange}
            onDayPress={handleDayPress}
          />
        </ThemedView>
      </ScrollView>

      {/* Full-screen Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setImageViewerVisible(false)}
          >
            <Image 
              source={getProfileImageByTheme(userProfile?.theme || 'default')}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Day Workouts Modal */}
      <Modal
        visible={showDayModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.dayModalContent, 
            { 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.accent,
              borderWidth: 1,
            }
          ]}>
            <View style={[
              styles.dayModalHeader,
              { 
                borderBottomColor: `${currentTheme.colors.accent}30`
              }
            ]}>
              <View style={styles.dayModalTitleContainer}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={24} 
                  color={currentTheme.colors.accent} 
                  style={styles.dayModalIcon}
                />
                <ThemedText style={styles.dayModalTitle}>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Workouts'}
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={[styles.closeModalButton, { backgroundColor: `${currentTheme.colors.accent}20` }]}
                onPress={() => setShowDayModal(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {dayWorkouts.length > 0 ? (
              <ScrollView style={styles.dayWorkoutsList}>
                {dayWorkouts.map((workout, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.workoutItem, 
                      { 
                        backgroundColor: `${currentTheme.colors.accent}10`,
                        borderLeftColor: currentTheme.colors.accent,
                        borderLeftWidth: 3,
                        marginBottom: 12,
                        borderRadius: 8,
                      }
                    ]}
                  >
                    <View style={styles.workoutHeader}>
                      <View style={[
                        styles.workoutIcon, 
                        { 
                          backgroundColor: `${currentTheme.colors.accent}20`,
                          shadowColor: currentTheme.colors.accent,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.5,
                          shadowRadius: 4,
                          elevation: 3,
                        }
                      ]}>
                        <MaterialCommunityIcons 
                          name={workout.icon} 
                          size={24} 
                          color={currentTheme.colors.accent}
                        />
                      </View>
                      <View style={styles.workoutDetails}>
                        <ThemedText style={[styles.workoutName, { fontWeight: '700' }]}>
                          {workout.name}
                        </ThemedText>
                        <ThemedText style={styles.workoutValue}>
                          {workout.value} {workout.unit}
                        </ThemedText>
                      </View>
                      <View style={[
                        styles.workoutCalories,
                        {
                          backgroundColor: `${currentTheme.colors.accent}20`,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 12,
                        }
                      ]}>
                        <ThemedText style={[styles.caloriesText, { fontWeight: '600' }]}>
                          {workout.calories} cal
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyWorkouts}>
                <MaterialCommunityIcons 
                  name="dumbbell" 
                  size={64}
                  color={`${currentTheme.colors.text}30`} 
                />
                <ThemedText style={styles.emptyWorkoutsText}>
                  No workouts found for this date
                </ThemedText>
                <ThemedText style={[styles.emptyWorkoutsSubtext, { color: `${currentTheme.colors.text}70` }]}>
                  Rest days are important too!
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Followers Modal */}
      <Modal
        visible={showFollowersModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFollowersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.listModalContent, 
            { 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.accent,
              borderWidth: 1,
            }
          ]}>
            <View style={[
              styles.modalHeader,
              { 
                borderBottomColor: `${currentTheme.colors.accent}30`
              }
            ]}>
              <ThemedText style={styles.modalTitle}>Followers</ThemedText>
              <TouchableOpacity 
                style={[styles.closeModalButton, { backgroundColor: `${currentTheme.colors.accent}20` }]}
                onPress={() => setShowFollowersModal(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.userList}>
              {followersList.length > 0 ? (
                followersList.map((follower) => (
                  <TouchableOpacity 
                    key={follower.id} 
                    style={[
                      styles.userItem, 
                      { borderBottomColor: `${currentTheme.colors.border}30` }
                    ]}
                    onPress={() => {
                      setShowFollowersModal(false);
                      router.push({
                        pathname: "/profile/[userId]",
                        params: { userId: follower.id }
                      });
                    }}
                  >
                    <View style={styles.userItemLeft}>
                      <View style={[styles.userAvatar, { borderColor: currentTheme.colors.accent }]}>
                        <ProfileImage 
                          themeName={follower.theme || 'Dragon Ball'}
                          size={40}
                        />
                      </View>
                      <ThemedText style={styles.username}>{follower.username}</ThemedText>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyList}>
                  <MaterialCommunityIcons 
                    name="account-group" 
                    size={64}
                    color={`${currentTheme.colors.text}30`} 
                  />
                  <ThemedText style={styles.emptyListText}>
                    No followers yet
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Following Modal */}
      <Modal
        visible={showFollowingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFollowingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.listModalContent, 
            { 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.accent,
              borderWidth: 1,
            }
          ]}>
            <View style={[
              styles.modalHeader,
              { 
                borderBottomColor: `${currentTheme.colors.accent}30`
              }
            ]}>
              <ThemedText style={styles.modalTitle}>Following</ThemedText>
              <TouchableOpacity 
                style={[styles.closeModalButton, { backgroundColor: `${currentTheme.colors.accent}20` }]}
                onPress={() => setShowFollowingModal(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.userList}>
              {followingList.length > 0 ? (
                followingList.map((following) => (
                  <TouchableOpacity 
                    key={following.id} 
                    style={[
                      styles.userItem, 
                      { borderBottomColor: `${currentTheme.colors.border}30` }
                    ]}
                    onPress={() => {
                      setShowFollowingModal(false);
                      router.push({
                        pathname: "/profile/[userId]",
                        params: { userId: following.id }
                      });
                    }}
                  >
                    <View style={styles.userItemLeft}>
                      <View style={[styles.userAvatar, { borderColor: currentTheme.colors.accent }]}>
                        <ProfileImage 
                          themeName={following.theme || 'Dragon Ball'}
                          size={40}
                        />
                      </View>
                      <ThemedText style={styles.username}>{following.username}</ThemedText>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyList}>
                  <MaterialCommunityIcons 
                    name="account-group" 
                    size={64}
                    color={`${currentTheme.colors.text}30`} 
                  />
                  <ThemedText style={styles.emptyListText}>
                    Not following anyone yet
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHeader: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 4,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  detailsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  noDetailsText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 16,
    width: '100%',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  dayModalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  dayModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  dayModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayModalIcon: {
    marginRight: 8,
  },
  dayModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeModalButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayWorkoutsList: {
    marginTop: 8,
  },
  workoutItem: {
    padding: 12,
    borderBottomWidth: 0,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    marginBottom: 2,
  },
  workoutValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  workoutCalories: {
    marginLeft: 16,
  },
  caloriesText: {
    fontSize: 14,
  },
  emptyWorkouts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyWorkoutsText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.6,
  },
  emptyWorkoutsSubtext: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  listModalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userList: {
    marginTop: 8,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyListText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.6,
  },
}); 