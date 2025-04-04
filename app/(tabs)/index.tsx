import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, TextInput, Animated, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { WorkoutProgress, UserStats, calculateLevel } from '@/types/workout';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

interface DashboardStats {
  username: string;
  coins: number;
  stats: UserStats;
  dailyWorkouts: WorkoutProgress[];
}

// Add XP calculation constants
const XP_RATES = {
  // Cardiovascular
  running: { unit: 'km', xpPerUnit: 2 },
  cycling: { unit: 'km', xpPerUnit: 2 },
  swimming: { unit: 'km', xpPerUnit: 2 },
  walking: { unit: 'km', xpPerUnit: 2 },

  // Strength Training
  pushups: { unit: 'reps', xpPerUnit: 0.1 }, // 1 XP per 10 reps
  pullups: { unit: 'reps', xpPerUnit: 0.1 },
  squats: { unit: 'reps', xpPerUnit: 0.1 },
  planks: { unit: 'minutes', xpPerUnit: 0.25 }, // 0.5 XP per 2 minutes

  // Flexibility & Mobility
  'static-stretching': { unit: 'minutes', xpPerUnit: 0.1 }, // 0.5 XP per 5 minutes
  'dynamic-stretching': { unit: 'minutes', xpPerUnit: 0.1 },
  yoga: { unit: 'session', xpPerUnit: 0.2 }, // 1 XP per 5 minute session
  pilates: { unit: 'session', xpPerUnit: 0.2 },
  'pnf-stretching': { unit: 'minutes', xpPerUnit: 0.1 },

  // Balance & Stability
  'tai-chi': { unit: 'session', xpPerUnit: 0.2 },
  'yoga-balance': { unit: 'session', xpPerUnit: 0.2 },
  'single-leg-stand': { unit: 'minutes', xpPerUnit: 0.1 },
  'heel-toe-walking': { unit: 'minutes', xpPerUnit: 0.1 },
  'balance-board': { unit: 'minutes', xpPerUnit: 0.1 },

  // HIIT
  'sprint-intervals': { unit: '100m', xpPerUnit: 2 },
  'circuit-training': { unit: 'minutes', xpPerUnit: 2 },
  tabata: { unit: 'minutes', xpPerUnit: 2 },
  burpees: { unit: 'reps', xpPerUnit: 1 },
  'box-jumps': { unit: 'reps', xpPerUnit: 1 },

  // Functional Training
  lunges: { unit: 'reps', xpPerUnit: 0.1 },
  'step-ups': { unit: 'reps', xpPerUnit: 0.1 },
  'medicine-ball-throws': { unit: 'reps', xpPerUnit: 0.1 },
  'kettlebell-swings': { unit: 'reps', xpPerUnit: 0.1 },

};

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutProgress | null>(null);
  const [progressValue, setProgressValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationOpacity = useState(new Animated.Value(0))[0];
  const celebrationScale = useState(new Animated.Value(0.3))[0];
  const confettiAnimations = useState([...Array(20)].map(() => ({
    position: new Animated.ValueXY({ x: 0, y: 0 }),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
    rotation: new Animated.Value(0),
  })))[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!auth.currentUser) return;

    try {
      // Load user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();

      // Load workouts from daily_workouts collection
      const today = new Date().toISOString().split('T')[0];
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      let dailyWorkouts: WorkoutProgress[] = [];
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Get today's workouts
        const todaysWorkouts = allWorkouts.filter((w: any) => w.date === today);
        
        // Group workouts by name and process each group
        const workoutGroups = new Map<string, any[]>();
        todaysWorkouts.forEach((workout: any) => {
          const workouts = workoutGroups.get(workout.name) || [];
          workouts.push(workout);
          workoutGroups.set(workout.name, workouts);
        });
        
        // Process each group to create WorkoutProgress objects
        workoutGroups.forEach((workouts, name) => {
          // Sort by timestamp to get the latest entry
          workouts.sort((a: any, b: any) => b.timestamp - a.timestamp);
          const latestWorkout = workouts[0];
          
          // Find the first workout of the day (for target value)
          const firstWorkout = workouts[workouts.length - 1];
          
          // Create WorkoutProgress object
          const workoutProgress: WorkoutProgress = {
            workoutId: name,
            name: name,
            icon: latestWorkout.icon,
            metric: latestWorkout.metric,
            unit: latestWorkout.unit,
            targetValue: firstWorkout.value,
            currentValue: latestWorkout.value,
            completed: latestWorkout.completed || false,
            date: today,
            timestamp: latestWorkout.timestamp,
          };
          
          dailyWorkouts.push(workoutProgress);
        });
        
        // Sort by timestamp
        dailyWorkouts.sort((a, b) => b.timestamp - a.timestamp);
      } else {
        // Create the document if it doesn't exist
        await setDoc(userWorkoutsRef, { workouts: [] });
      }

      setStats({
        username: userData.username,
        coins: userData.coins || 0,
        stats: {
          totalXP: userData.totalXP || 0,
          ...calculateLevel(userData.totalXP || 0),
        },
        dailyWorkouts,
      });

      // Check if all workouts are completed
      if (dailyWorkouts.length > 0) {
        checkAllWorkoutsCompleted(dailyWorkouts);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateConfetti = () => {
    const { width, height } = Dimensions.get('window');
    const animations = confettiAnimations.map((confetti) => {
      const randomX = Math.random() * width - width / 2;
      const randomY = -Math.random() * height / 2;
      const randomRotation = Math.random() * 360;
      const randomDuration = 1000 + Math.random() * 1000;

      return Animated.parallel([
        Animated.timing(confetti.position, {
          toValue: { x: randomX, y: randomY },
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.opacity, {
          toValue: 0,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.rotation, {
          toValue: randomRotation,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.scale, {
          toValue: 0.5,
          duration: randomDuration,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.stagger(50, animations);
  };

  const checkAllWorkoutsCompleted = (workouts: WorkoutProgress[]) => {
    const today = new Date().toISOString().split('T')[0];
    const allCompleted = workouts.every(workout =>
      workouts.some(w => w.workoutId === workout.workoutId && w.date === today)
    );

    if (allCompleted) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const calculateWorkoutXP = (workout: WorkoutProgress): number => {
    const xpRate = XP_RATES[workout.workoutId as keyof typeof XP_RATES];
    if (!xpRate) return 0;

    let xp = 0;
    if (workout.unit === xpRate.unit) {
      xp = workout.currentValue * xpRate.xpPerUnit;
    }
    return Math.floor(xp); // Round down to nearest integer
  };

  const updateUserXP = async (newXP: number) => {
    if (!auth.currentUser || !stats) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const currentTotalXP = stats.stats.totalXP + newXP;
      const levelData = calculateLevel(currentTotalXP);

      await updateDoc(userRef, {
        totalXP: currentTotalXP,
      });

      setStats(prev => prev ? {
        ...prev,
        stats: {
          totalXP: currentTotalXP,
          ...levelData,
        },
      } : null);
    } catch (error) {
      console.error('Error updating user XP:', error);
    }
  };

  const handleUpdateProgress = async () => {
    if (!auth.currentUser || !stats || !editingWorkout || !progressValue) return;

    try {
      const value = parseFloat(progressValue);
      if (isNaN(value)) return;

      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Convert to Exercise format for storage
        const newWorkout = {
          name: editingWorkout.name,
          icon: editingWorkout.icon,
          metric: editingWorkout.metric,
          unit: editingWorkout.unit,
          value: value,
          timestamp,
          date: today,
        };
        
        await updateDoc(userWorkoutsRef, {
          workouts: [...allWorkouts, newWorkout]
        });
        
        // Reload dashboard data to ensure consistency
        await loadDashboardData();
      }

      setShowEditModal(false);
      setProgressValue('');
      setEditingWorkout(null);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleCompleteWorkout = async (workout: WorkoutProgress) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Convert to Exercise format for storage
        const newWorkout = {
          name: workout.name,
          icon: workout.icon,
          metric: workout.metric,
          unit: workout.unit,
          value: workout.targetValue,
          completed: true, // Mark as completed
          timestamp,
          date: today,
        };
        
        await updateDoc(userWorkoutsRef, {
          workouts: [...allWorkouts, newWorkout]
        });

        // Calculate and update XP
        const xpGained = calculateWorkoutXP({
          ...workout,
          currentValue: workout.targetValue,
          completed: true
        });

        if (xpGained > 0) {
          await updateUserXP(xpGained);
        }
        
        // Reload dashboard data
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleResetWorkout = async (workout: WorkoutProgress) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Keep all workouts that are not from today or have a different name
        const filteredWorkouts = allWorkouts.filter(
          (w: any) => !(w.name === workout.name && w.date === today)
        );
        
        // Add a new reset workout entry
        const resetWorkout = {
          name: workout.name,
          icon: workout.icon,
          metric: workout.metric,
          unit: workout.unit,
          value: 0,
          completed: false,
          timestamp,
          date: today,
        };
        
        await updateDoc(userWorkoutsRef, { 
          workouts: [...filteredWorkouts, resetWorkout] 
        });
        
        // Reload dashboard data
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error resetting workout:', error);
    }
  };

  const handleCompleteAllWorkouts = async () => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Convert all workouts to Exercise format for storage
        const newWorkouts = stats.dailyWorkouts.map(workout => ({
          name: workout.name,
          icon: workout.icon,
          metric: workout.metric,
          unit: workout.unit,
          value: workout.targetValue,
          timestamp,
          date: today,
        }));
        
        await updateDoc(userWorkoutsRef, {
          workouts: [...allWorkouts, ...newWorkouts]
        });
        
        // Reload dashboard data
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error completing all workouts:', error);
    }
  };

  const isWorkoutCompleted = (workout: WorkoutProgress, dailyWorkouts: WorkoutProgress[]) => {
    const today = new Date().toISOString().split('T')[0];
    return dailyWorkouts.some(w => w.workoutId === workout.workoutId && w.date === today);
  };

  const getWorkoutIcon = (workoutId: string): string => {
    // Use the icon directly from the workout data
    const workout = stats?.dailyWorkouts.find(w => w.workoutId === workoutId);
    return workout?.icon || 'dumbbell';
  };

  const renderWorkoutItem = (workout: WorkoutProgress) => {
    return (
      <TouchableOpacity
        key={`${workout.workoutId}-${workout.timestamp}`}
        style={[styles.workoutItem, {
          backgroundColor: `${currentTheme.colors.accent}15`,
          borderColor: currentTheme.colors.accent,
        }]}
        onPress={() => {
          setEditingWorkout(workout);
          setProgressValue(workout.currentValue.toString());
          setShowEditModal(true);
        }}
      >
        <View style={styles.workoutItemLeft}>
          <View style={[styles.workoutIcon, { backgroundColor: `${currentTheme.colors.accent}20` }]}>
            <MaterialCommunityIcons
              name={workout.icon as any}
              size={24}
              color={currentTheme.colors.accent}
            />
          </View>
          <View style={styles.workoutInfo}>
            <ThemedText style={[styles.workoutName, { color: currentTheme.colors.accent }]}>
              {workout.name}
            </ThemedText>
            <ThemedText style={[styles.workoutTime, { color: `${currentTheme.colors.accent}99` }]}>
              {new Date(workout.timestamp).toLocaleTimeString()}
            </ThemedText>
            <View style={[styles.progressBarContainer, { marginTop: 8 }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${(workout.currentValue / workout.targetValue) * 100}%`,
                    backgroundColor: currentTheme.colors.accent 
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        <View style={styles.workoutRight}>
          <ThemedText style={[styles.workoutValue, { color: currentTheme.colors.accent }]}>
            {workout.currentValue}/{workout.targetValue} {workout.unit}
          </ThemedText>
          <View style={styles.workoutActions}>
            {!workout.completed && (
              <TouchableOpacity
                onPress={() => handleCompleteWorkout(workout)}
                style={[styles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleResetWorkout(workout)}
              style={[styles.actionButton, { borderColor: currentTheme.colors.accent, borderWidth: 1 }]}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={currentTheme.colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCelebration = () => {
    if (!showCelebration) return null;

    return (
      <View style={styles.celebrationContainer}>
        <Text style={styles.celebrationText}>Completed!</Text>
      </View>
    );
  };

  const renderDailyWorkouts = () => {
    if (!stats || !stats.dailyWorkouts.length) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No workouts planned for today</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.workoutsList}>
        {stats.dailyWorkouts.map((workout) => renderWorkoutItem(workout))}
        
        {/* Complete All Button */}
        <TouchableOpacity
          style={[
            styles.completeAllButton,
            { backgroundColor: currentTheme.colors.accent }
          ]}
          onPress={handleCompleteAllWorkouts}
        >
          <MaterialCommunityIcons name="check-all" size={24} color="#fff" />
          <ThemedText style={[styles.completeAllButtonText, { color: '#fff' }]}>
            Complete All
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading dashboard...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={currentTheme.colors.background}
      />
      <ThemedView style={styles.container}>
        {/* Celebration Animation */}
        {renderCelebration()}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.welcomeText, { color: currentTheme.colors.accent }]}>
              Welcome back,
            </ThemedText>
            <ThemedText style={[styles.username, { color: currentTheme.colors.accent }]}>
              {stats.username}
            </ThemedText>
          </View>
          <View style={[styles.coinsContainer, { backgroundColor: `${currentTheme.colors.accent}20` }]}>
            <MaterialCommunityIcons name="currency-usd" size={20} color={currentTheme.colors.accent} />
            <ThemedText style={[styles.coinsText, { color: currentTheme.colors.accent }]}>
              {stats.coins}
            </ThemedText>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Level Progress */}
          <View style={[styles.section, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="star" size={24} color={currentTheme.colors.accent} />
              <View style={styles.levelInfo}>
                <ThemedText style={[styles.sectionTitle, { color: currentTheme.colors.accent }]}>
                  Level {stats.stats.level}
                </ThemedText>
                <ThemedText style={[styles.totalXP, { color: currentTheme.colors.accent }]}>
                  Total XP: {stats.stats.totalXP}
                </ThemedText>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${(stats.stats.currentLevelXP / stats.stats.xpForNextLevel) * 100}%`,
                    backgroundColor: currentTheme.colors.accent 
                  }
                ]} 
              />
            </View>
            <View style={styles.xpInfoContainer}>
              <ThemedText style={[styles.xpText, { color: currentTheme.colors.accent }]}>
                {stats.stats.currentLevelXP} / {stats.stats.xpForNextLevel} XP
              </ThemedText>
              <ThemedText style={[styles.xpNeeded, { color: currentTheme.colors.accent }]}>
                {stats.stats.xpForNextLevel - stats.stats.currentLevelXP} XP needed for Level {stats.stats.level + 1}
              </ThemedText>
            </View>
          </View>

          {/* Daily Workouts */}
          <View style={[styles.section, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="dumbbell" size={24} color={currentTheme.colors.accent} />
              <ThemedText style={[styles.sectionTitle, { color: currentTheme.colors.accent }]}>
                Daily Workouts
              </ThemedText>
            </View>
            <ScrollView 
              style={styles.workoutsScrollView} 
              showsVerticalScrollIndicator={false}
            >
              {renderDailyWorkouts()}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Edit Progress Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEditModal}
          onRequestClose={() => {
            setShowEditModal(false);
            setProgressValue('');
            setEditingWorkout(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Update {editingWorkout?.name} Progress
              </Text>
              <TextInput
                style={styles.input}
                value={progressValue}
                onChangeText={setProgressValue}
                keyboardType="numeric"
                placeholder={`Enter value in ${editingWorkout?.unit}`}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    setProgressValue('');
                    setEditingWorkout(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateProgress}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutsScrollView: {
    maxHeight: 380,
  },
  workoutsList: {
    gap: 12,
    paddingBottom: 8,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  workoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  workoutRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  workoutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E53E3E',
  },
  saveButton: {
    backgroundColor: '#48BB78',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '25%',
    flexDirection: 'column',
    gap: 48,
  },
  celebrationText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 24,
    position: 'relative',
    zIndex: 1001,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  completeAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  levelInfo: {
    flex: 1,
  },
  totalXP: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  xpInfoContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpNeeded: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
});
