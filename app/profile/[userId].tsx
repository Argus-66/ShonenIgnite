import { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ActivitySection } from '@/components/profile/ActivitySection';
import { BioSection } from '@/components/profile/BioSection';
import getProfileImageByTheme from '@/utils/profileImages';

interface UserProfile {
  username: string;
  bio: string;
  theme: string;
  streak: number;
  bestStreak: number;
  followers: string[];
  following: string[];
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

  useEffect(() => {
    loadUserProfile();
    loadCurrentUser();
    loadWorkoutData();
  }, [userId]);

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
      // You would typically load this from the daily_workout_progress collection
      // This is a simplified version
      const workoutsData: { [date: string]: number } = {};
      const currentMonth = selectedMonth.getMonth();
      const currentYear = selectedMonth.getFullYear();
      
      // Generate some placeholder data
      for (let day = 1; day <= 28; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (Math.random() > 0.7) { // 30% chance of having workouts
          const count = Math.floor(Math.random() * 5) + 1;
          workoutsData[dateStr] = count;
          if (count > maxWorkouts) {
            setMaxWorkouts(count);
          }
        }
      }
      
      setWorkoutData(workoutsData);
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  }

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
    // In a real app, you would reload workout data for the new month
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
    return currentUser?.following.includes(userId.toString()) || false;
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
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{userProfile.followers.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Followers</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{userProfile.following.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Following</ThemedText>
              </View>
            </View>
          </View>

          <BioSection bio={userProfile.bio} />

          <ActivitySection
            selectedMonth={selectedMonth}
            workoutData={workoutData}
            maxWorkouts={maxWorkouts}
            totalWorkouts={Object.values(workoutData).reduce((a, b) => a + b, 0)}
            currentStreak={userProfile.streak}
            bestStreak={userProfile.bestStreak}
            onMonthChange={handleMonthChange}
            onDayPress={() => {}}
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
}); 