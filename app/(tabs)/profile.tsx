import { StyleSheet, View, TouchableOpacity, SafeAreaView, Modal, TextInput, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Theme, themes } from '@/constants/Themes';
import { ActivitySection } from '@/components/profile/ActivitySection';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserStats } from '@/components/profile/UserStats';
import { BioSection } from '@/components/profile/BioSection';
import { ThemeSelector } from '@/components/profile/ThemeSelector';

interface UserProfile {
  username: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bio: string;
  theme: string;
  streak: number;
  bestStreak: number;
}

interface DetailCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value, color }) => {
  const { currentTheme } = useTheme();
  return (
    <View style={[
      styles.detailCard, 
      { 
        backgroundColor: currentTheme.colors.card,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 10,
        margin: 4,
        width: '46%',
        padding: 12
      }
    ]}>
      <ThemedText style={[styles.detailLabel, { color: color, textAlign: 'center', marginBottom: 4 }]}>
        {label}
      </ThemedText>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
      }}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        <ThemedText style={[styles.detailValue, { color: currentTheme.colors.text, marginLeft: 8, fontWeight: 'bold' }]}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
};

// Helper function to determine if a color is dark
const isColorDark = (color: string): boolean => {
  // Handle rgba format
  if (color.startsWith('rgba')) {
    const values = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
    if (values) {
      const r = parseInt(values[1]);
      const g = parseInt(values[2]);
      const b = parseInt(values[3]);
      // Calculate relative luminance
      return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    }
  }
  
  // Handle hex format with alpha
  if (color.startsWith('#') && (color.length === 9 || color.length === 5)) {
    color = color.substring(0, 7); // Remove alpha component
  }
  
  // Handle hex format
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    // Calculate relative luminance
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  }
  
  // Default to assuming light color if format is unknown
  return false;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    width: '23%',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1c1c2e',
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
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 8,
  },
  bioSection: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'transparent',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 16,
  },
  themeButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'transparent',
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'transparent',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeColorPreviews: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  themeColorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  themeOptionText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activitySection: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityContent: {
    padding: 16,
    borderRadius: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
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
  },
  dayDetailHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  workoutItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F9DDE'
  },
  detailCard: {
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    width: '48%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailContent: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeList: {
    maxHeight: 400,
  },
  editModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editForm: {
    marginVertical: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWithValue: {
    width: '100%',
  },
  currentValue: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default function ProfileScreen() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfile>>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [workoutData, setWorkoutData] = useState<{ [date: string]: number }>({});
  const [maxWorkouts, setMaxWorkouts] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserProfile(),
      loadWorkoutData()
    ]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadUserProfile();
    loadWorkoutData();
  }, []);

  async function loadUserProfile() {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          username: userData.username,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          bio: userData.bio || 'No bio yet',
          theme: userData.theme || 'default',
          streak: userData.streak || 0,
          bestStreak: userData.bestStreak || 0,
        });
        setEditableProfile({
          age: userData.age,
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          bio: userData.bio || 'No bio yet',
          streak: userData.streak || 0,
          bestStreak: userData.bestStreak || 0,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser || !editableProfile) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const updates: Partial<UserProfile> = {};
      if (editableProfile.age) updates.age = editableProfile.age;
      if (editableProfile.height) updates.height = editableProfile.height;
      if (editableProfile.weight) updates.weight = editableProfile.weight;
      if (editableProfile.bio) updates.bio = editableProfile.bio;
      if (editableProfile.streak) updates.streak = editableProfile.streak;
      if (editableProfile.bestStreak) updates.bestStreak = editableProfile.bestStreak;

      await updateDoc(userRef, updates);
      await loadUserProfile();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleThemeChange = async (themeName: string) => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        theme: themeName
      });
      setTheme(themeName);
      await loadUserProfile();
      setShowThemeModal(false);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const calculateStreaks = async (progressData: any) => {
    if (!auth.currentUser) return;

    try {
      const workoutDates = new Set<string>();
      Object.values(progressData).forEach((workoutData: any) => {
        Object.entries(workoutData).forEach(([date, progress]: [string, any]) => {
          if (progress.value > 0 || progress.completed) {
            workoutDates.add(date);
          }
        });
      });

      const sortedDates = Array.from(workoutDates).sort();
      if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let currentStreak = 0;
      let i = sortedDates.length - 1;
      
      if (sortedDates[i] === today || sortedDates[i] === yesterdayStr) {
        currentStreak = 1;
        let prevDate = new Date(sortedDates[i]);
        i--;

        while (i >= 0) {
          const currentDate = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
            prevDate = currentDate;
          } else {
            break;
          }
          i--;
        }
      }

      let bestStreak = currentStreak;
      let tempStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i - 1]);
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        streak: currentStreak,
        bestStreak: Math.max(bestStreak, userProfile?.bestStreak || 0)
      });

      return { currentStreak, bestStreak };
    } catch (error) {
      console.error('Error calculating streaks:', error);
      return { currentStreak: 0, bestStreak: 0 };
    }
  };

  const loadWorkoutData = async () => {
    if (!auth.currentUser) return;

    try {
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        const monthData: { [date: string]: number } = {};
        let max = 0;

        Object.values(data).forEach((workoutData: any) => {
          Object.entries(workoutData).forEach(([date, progress]: [string, any]) => {
            const progressDate = new Date(date);
            if (
              progressDate.getMonth() === selectedMonth.getMonth() &&
              progressDate.getFullYear() === selectedMonth.getFullYear() &&
              (progress.value > 0 || progress.completed)
            ) {
              monthData[date] = (monthData[date] || 0) + 1;
              max = Math.max(max, monthData[date]);
            }
          });
        });

        setWorkoutData(monthData);
        setMaxWorkouts(max);

        await calculateStreaks(data);
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedMonth(newDate);
  };

  const handleDayPress = (date: string, count: number) => {
    setSelectedDay({ date, count });
    console.log(`Selected day: ${date}, workout count: ${count}`);
  };

  // Helper function to format date for the modal title
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!currentTheme || !availableThemes) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading theme...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderThemeOption = (themeName: string, theme: Theme) => {
    if (!theme?.colors) return null;
    
    const isSelected = themeName === userProfile?.theme;
    
    return (
      <TouchableOpacity
        key={themeName}
        style={[
          styles.themeOption,
          { 
            backgroundColor: theme.colors.background,
            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
            borderRadius: 12
          }
        ]}
        onPress={() => handleThemeChange(themeName)}
      >
        <View style={styles.themeOptionLeft}>
          <View style={styles.themeColorPreviews}>
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.accent }]} />
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.secondary }]} />
          </View>
          <ThemedText style={[styles.themeOptionText, { color: theme.colors.text }]}>{themeName}</ThemedText>
        </View>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle={isColorDark(currentTheme.colors.background) ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colors.background}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.accent]}
            tintColor={currentTheme.colors.accent}
          />
        }
      >
        <ThemedView style={styles.container}>
          <ProfileHeader
            username={userProfile?.username || ""}
            onEditPress={() => setShowEditModal(true)}
            onLogoutPress={handleLogout}
          />

          <UserStats
            age={userProfile?.age || 0}
            gender={userProfile?.gender || "male"}
            height={userProfile?.height || 0}
            weight={userProfile?.weight || 0}
          />

          <BioSection bio={userProfile?.bio || ""} />

          <ThemeSelector
            currentThemeName={userProfile?.theme || "default"}
            onPress={() => setShowThemeModal(true)}
          />

          <ActivitySection
            selectedMonth={selectedMonth}
            workoutData={workoutData}
            maxWorkouts={maxWorkouts}
            totalWorkouts={Object.values(workoutData).reduce((a, b) => a + b, 0)}
            currentStreak={userProfile?.streak || 0}
            bestStreak={userProfile?.bestStreak || 0}
            onMonthChange={handleMonthChange}
            onDayPress={handleDayPress}
          />

          <Modal
            visible={showThemeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.themeModalContent, { backgroundColor: currentTheme.colors.background, borderRadius: 16 }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Choose Your Theme</ThemedText>
                  <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.themeList} showsVerticalScrollIndicator={false}>
                  {Object.entries(themes).map(([themeName, theme]) => 
                    renderThemeOption(themeName, theme as Theme)
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showEditModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.editModalContent, { backgroundColor: currentTheme.colors.background, borderRadius: 16 }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>Age</ThemedText>
                    <View style={styles.inputWithValue}>
                      <ThemedText style={styles.currentValue}>Current: {userProfile?.age} years</ThemedText>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.colors.text, 
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.card,
                        }]}
                        value={String(editableProfile.age)}
                        onChangeText={(text) => setEditableProfile(prev => ({ ...prev, age: parseInt(text) || prev.age }))}
                        keyboardType="numeric"
                        placeholder="Enter new age"
                        placeholderTextColor={currentTheme.colors.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
                    <View style={styles.inputWithValue}>
                      <ThemedText style={styles.currentValue}>Current: {userProfile?.height} cm</ThemedText>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.colors.text, 
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.card,
                        }]}
                        value={String(editableProfile.height)}
                        onChangeText={(text) => setEditableProfile(prev => ({ ...prev, height: parseInt(text) || prev.height }))}
                        keyboardType="numeric"
                        placeholder="Enter new height"
                        placeholderTextColor={currentTheme.colors.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
                    <View style={styles.inputWithValue}>
                      <ThemedText style={styles.currentValue}>Current: {userProfile?.weight} kg</ThemedText>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.colors.text, 
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.card,
                        }]}
                        value={String(editableProfile.weight)}
                        onChangeText={(text) => setEditableProfile(prev => ({ ...prev, weight: parseInt(text) || prev.weight }))}
                        keyboardType="numeric"
                        placeholder="Enter new weight"
                        placeholderTextColor={currentTheme.colors.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>Bio</ThemedText>
                    <View style={styles.inputWithValue}>
                      <ThemedText style={styles.currentValue}>Current: {userProfile?.bio}</ThemedText>
                      <TextInput
                        style={[styles.input, styles.bioInput, { 
                          color: currentTheme.colors.text, 
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.card,
                        }]}
                        value={editableProfile.bio}
                        onChangeText={(text) => setEditableProfile(prev => ({ ...prev, bio: text }))}
                        multiline
                        placeholder="Enter new bio"
                        placeholderTextColor={currentTheme.colors.textSecondary}
                      />
                    </View>
                  </View>
                </ScrollView>

                <View style={[styles.modalActions, { borderTopColor: currentTheme.colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: currentTheme.colors.error }]}
                    onPress={() => setShowEditModal(false)}
                  >
                    <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: currentTheme.colors.accent }]}
                    onPress={handleSaveProfile}
                  >
                    <ThemedText style={styles.modalButtonText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedDay}
            onRequestClose={() => setSelectedDay(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.card, borderRadius: 16 }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>
                    {selectedDay && formatDate(selectedDay.date)}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedDay(null)}>
                    <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
                  </TouchableOpacity>
                </View>
                {selectedDay && (
                  <ScrollView style={{ maxHeight: 400 }}>
                    <View style={styles.dayDetailHeader}>
                      <MaterialCommunityIcons name="dumbbell" size={24} color={currentTheme.colors.text} />
                      <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {selectedDay.count} {selectedDay.count === 1 ? 'Workout' : 'Workouts'}
                      </ThemedText>
                    </View>
                    
                    {selectedDay.count > 0 ? (
                      // Here you'd normally fetch workouts for this day and display them
                      // For now, we'll show placeholders
                      Array(selectedDay.count).fill(0).map((_, index) => (
                        <View key={index} style={styles.workoutItem}>
                          <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>Workout {index + 1}</ThemedText>
                          <ThemedText style={{ fontSize: 14, marginTop: 4 }}>
                            {index % 2 === 0 ? "Strength Training" : "Cardio"}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                            {45 + index * 10} minutes • {index % 2 === 0 ? "220 calories" : "350 calories"}
                          </ThemedText>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="dumbbell" size={48} color={`${currentTheme.colors.text}50`} />
                        <ThemedText style={styles.emptyStateText}>
                          No workouts on this day
                        </ThemedText>
                        <ThemedText style={styles.emptyStateSubtext}>
                          Rest days are important too!
                        </ThemedText>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}