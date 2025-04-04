import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, Modal, TextInput, ScrollView, StatusBar, Dimensions, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Theme, themes } from '@/constants/Themes';

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

interface WorkoutHeatmapProps {
  month: Date;
  data: { [date: string]: number };
  maxValue: number;
  onDayPress?: (date: string, count: number) => void;
}

const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({ month, data, maxValue, onDayPress }) => {
  const { currentTheme } = useTheme();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  
  const getColor = (count: number) => {
    if (count === 0) return `${currentTheme.colors.accent}15`;
    const intensity = Math.min((count / maxValue) * 0.8 + 0.2, 1);
    const color = `${currentTheme.colors.accent}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    return color;
  };

  const renderDays = () => {
    const days = [];
    const cellSize = (Dimensions.get('window').width - 64) / 7;

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={[styles.dayCell, { width: cellSize, height: cellSize }]} />);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const count = data[date] || 0;
      const color = getColor(count);
      
      days.push(
        <TouchableOpacity
          key={date}
          style={[
            styles.dayCell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: count > 0 ? 0.8 : 0,
              shadowRadius: Math.min(count * 2, 8),
              elevation: count > 0 ? Math.min(count * 2, 8) : 0,
            },
          ]}
          onPress={() => onDayPress?.(date, count)}
        >
          <ThemedText style={[styles.dayText, { opacity: count > 0 ? 1 : 0.7 }]}>{i}</ThemedText>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.heatmapContainer}>
      <View style={styles.daysGrid}>
        {renderDays()}
      </View>
    </View>
  );
};

// Helper function to check if a color is dark
function isColorDark(color: string) {
  // Remove the '#' if present
  const hex = color.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (perceived brightness formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if the color is dark (brightness < 128)
  return brightness < 128;
}

const DetailCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => {
  return (
    <View style={[styles.detailCard, { 
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: color,
      shadowColor: color,
    }]}>
      <View style={[styles.iconContainer, { 
        backgroundColor: `${color}20`, 
        borderColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
      }]}>
        <MaterialCommunityIcons 
          name={icon as any} 
          size={24} 
          color={color} 
          style={[styles.cardIcon, {
            textShadowColor: color,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          }]} 
        />
      </View>
      <View style={styles.cardTextContainer}>
        <ThemedText style={[styles.cardLabel, { 
          color: `${color}CC`,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 4,
        }]}>{label}</ThemedText>
        <ThemedText style={[styles.cardValue, { 
          color: color,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
        }]}>{value}</ThemedText>
      </View>
    </View>
  );
};

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
      
      // Only update fields that have changed
      const updates: Partial<UserProfile> = {};
      if (editableProfile.age) updates.age = editableProfile.age;
      if (editableProfile.height) updates.height = editableProfile.height;
      if (editableProfile.weight) updates.weight = editableProfile.weight;
      if (editableProfile.bio) updates.bio = editableProfile.bio;
      if (editableProfile.streak) updates.streak = editableProfile.streak;
      if (editableProfile.bestStreak) updates.bestStreak = editableProfile.bestStreak;

      await updateDoc(userRef, updates);
      await loadUserProfile(); // Reload the profile after update
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
      await loadUserProfile(); // Reload the profile after update
      setShowThemeModal(false);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const calculateStreaks = async (progressData: any) => {
    if (!auth.currentUser) return;

    try {
      // Get all dates where workouts were completed
      const workoutDates = new Set<string>();
      Object.values(progressData).forEach((workoutData: any) => {
        Object.entries(workoutData).forEach(([date, progress]: [string, any]) => {
          if (progress.value > 0 || progress.completed) {
            workoutDates.add(date);
          }
        });
      });

      // Convert to array and sort
      const sortedDates = Array.from(workoutDates).sort();
      if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

      // Calculate current streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let currentStreak = 0;
      let i = sortedDates.length - 1;
      
      // If last workout was today or yesterday, start counting streak
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

      // Calculate best streak
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

      // Update user profile with new streak values
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

        // Process all workouts
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

        // Calculate and update streaks
        await calculateStreaks(data);
        await loadUserProfile(); // Reload profile to get updated streak values
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
          {/* Header with User Info */}
          <View style={[styles.header, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarContainer, { 
                backgroundColor: `${currentTheme.colors.accent}20`,
                borderColor: currentTheme.colors.accent 
              }]}>
                <MaterialCommunityIcons 
                  name="account" 
                  size={40} 
                  color={currentTheme.colors.accent}
                />
              </View>
              <ThemedText style={[styles.username, { color: currentTheme.colors.accent }]}>
                {userProfile?.username}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
                onPress={() => setShowEditModal(true)}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: currentTheme.colors.error }]}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons name="logout" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <DetailCard
              icon="calendar"
              label="Age"
              value={`${userProfile?.age || 0} years`}
              color={currentTheme.colors.primary}
            />
            <DetailCard
              icon={userProfile?.gender === 'male' ? 'gender-male' : 'gender-female'}
              label="Gender"
              value={userProfile?.gender || ''}
              color={currentTheme.colors.accent}
            />
            <DetailCard
              icon="human-male-height"
              label="Height"
              value={`${userProfile?.height || 0} cm`}
              color={currentTheme.colors.secondary}
            />
            <DetailCard
              icon="weight"
              label="Weight"
              value={`${userProfile?.weight || 0} kg`}
              color={currentTheme.colors.primary}
            />
          </View>

          {/* Bio Section */}
          <View style={[styles.bioSection, { 
            backgroundColor: `${currentTheme.colors.accent}15`,
            borderColor: currentTheme.colors.accent,
            shadowColor: currentTheme.colors.accent,
          }]}>
            <View style={styles.bioHeader}>
              <MaterialCommunityIcons 
                name="card-text-outline" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={[styles.bioTitle, { color: currentTheme.colors.accent }]}>
                Bio
              </ThemedText>
            </View>
            <ThemedText style={[styles.bioText, { color: currentTheme.colors.accent }]}>
              {userProfile?.bio || 'No bio yet'}
            </ThemedText>
          </View>

          {/* Theme Button */}
          <TouchableOpacity 
            style={[styles.themeButton, { 
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderColor: currentTheme.colors.accent,
              shadowColor: currentTheme.colors.accent,
            }]}
            onPress={() => setShowThemeModal(true)}
          >
            <MaterialCommunityIcons name="palette" size={24} color={currentTheme.colors.accent} />
            <ThemedText style={[styles.themeButtonText, { color: currentTheme.colors.accent }]}>
              Current Theme: {userProfile?.theme}
            </ThemedText>
          </TouchableOpacity>

          {/* Theme Selection Modal */}
          <Modal
            visible={showThemeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.themeModalContent, { backgroundColor: currentTheme.colors.background }]}>
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

          {/* Edit Profile Modal */}
          <Modal
            visible={showEditModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.editModalContent, { backgroundColor: currentTheme.colors.background }]}>
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

          {/* Activity Section */}
          <View style={styles.activitySection}>
            <ThemedText style={styles.activityTitle}>Activity</ThemedText>
            <View style={styles.activityContent}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={currentTheme.colors.accent} />
                </TouchableOpacity>
                <ThemedText style={styles.monthText}>
                  {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </ThemedText>
                <TouchableOpacity onPress={() => handleMonthChange(1)}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={currentTheme.colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Activity Stats */}
              <View style={styles.activityStats}>
                <View style={[styles.statBox, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.statValue}>{Object.values(workoutData).reduce((a, b) => a + b, 0)}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Workouts</ThemedText>
                </View>
                <View style={[styles.statBox, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
                  <MaterialCommunityIcons name="fire" size={24} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.statValue}>{userProfile?.streak || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
                </View>
                <View style={[styles.statBox, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
                  <MaterialCommunityIcons name="trophy" size={24} color={currentTheme.colors.accent} />
                  <ThemedText style={styles.statValue}>{userProfile?.bestStreak || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
                </View>
              </View>

              {/* Workout Heatmap */}
              <View style={[styles.heatmapSection, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
                <WorkoutHeatmap
                  month={selectedMonth}
                  data={workoutData}
                  maxValue={maxWorkouts}
                  onDayPress={(date, count) => {
                    if (count > 0) {
                      console.log(`${count} workouts completed on ${date}`);
                    }
                  }}
                />
              </View>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  detailCard: {
    width: '23%',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginBottom: 0,
  },
  cardTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bioSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  themeModalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },
  editModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  themeList: {
    maxHeight: '90%',
  },
  editForm: {
    maxHeight: '80%',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeColorPreviews: {
    flexDirection: 'row',
    gap: 8,
  },
  themeColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWithValue: {
    gap: 5,
  },
  currentValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  activitySection: {
    marginTop: 24,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityContent: {
    padding: 16,
    borderRadius: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  heatmapSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  heatmapContainer: {
    width: '100%',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 12,
    opacity: 0.7,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 