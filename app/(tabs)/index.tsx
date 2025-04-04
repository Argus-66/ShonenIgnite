import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, TextInput, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { WorkoutProgress, UserStats, calculateLevel } from '@/types/workout';

interface DailyWorkout {
  id: string;
  name: string;
  icon: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  completed: boolean;
  lastUpdated: number;
}

interface DashboardStats {
  username: string;
  coins: number;
  stats: UserStats;
  dailyWorkouts: DailyWorkout[];
}

// Default daily workouts
const DEFAULT_DAILY_WORKOUTS: DailyWorkout[] = [
  {
    id: 'pushups',
    name: 'Push-ups',
    icon: 'human',
    currentValue: 0,
    targetValue: 30,
    unit: 'reps',
    completed: false,
    lastUpdated: 0,
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: 'bike',
    currentValue: 0,
    targetValue: 5,
    unit: 'km',
    completed: false,
    lastUpdated: 0,
  },
  {
    id: 'running',
    name: 'Running',
    icon: 'run',
    currentValue: 0,
    targetValue: 10,
    unit: 'km',
    completed: false,
    lastUpdated: 0,
  },
];

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<DailyWorkout | null>(null);
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

      // Load or initialize daily workouts
      const today = new Date().toISOString().split('T')[0];
      const dailyProgressRef = doc(db, 'daily_workout_progress', `${auth.currentUser.uid}_${today}`);
      const dailyProgressDoc = await getDoc(dailyProgressRef);
      
      let dailyWorkouts: DailyWorkout[];
      
      if (dailyProgressDoc.exists()) {
        dailyWorkouts = dailyProgressDoc.data().workouts;
      } else {
        // Initialize with default workouts
        dailyWorkouts = DEFAULT_DAILY_WORKOUTS;
        await setDoc(dailyProgressRef, { 
          userId: auth.currentUser.uid,
          date: today,
          workouts: dailyWorkouts 
        });
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

  const checkAllWorkoutsCompleted = (workouts: DailyWorkout[]) => {
    const allCompleted = workouts.every(w => w.completed);
    if (allCompleted && !showCelebration) {
      setShowCelebration(true);
      
      // Reset animations
      confettiAnimations.forEach((confetti) => {
        confetti.position.setValue({ x: 0, y: 0 });
        confetti.opacity.setValue(1);
        confetti.scale.setValue(1);
        confetti.rotation.setValue(0);
      });

      Animated.parallel([
        Animated.sequence([
          Animated.timing(celebrationOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(1500),
          Animated.timing(celebrationOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(celebrationScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.delay(1500),
          Animated.timing(celebrationScale, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        animateConfetti(),
      ]).start(() => {
        setShowCelebration(false);
        celebrationScale.setValue(0.3);
      });
    }
  };

  const handleUpdateProgress = async () => {
    if (!auth.currentUser || !stats || !editingWorkout || !progressValue) return;

    try {
      const value = parseFloat(progressValue);
      if (isNaN(value)) return;

      const cappedValue = Math.min(value, editingWorkout.targetValue);
      const today = new Date().toISOString().split('T')[0];
      const dailyProgressRef = doc(db, 'daily_workout_progress', `${auth.currentUser.uid}_${today}`);

      const updatedWorkouts = stats.dailyWorkouts.map(w =>
        w.id === editingWorkout.id
          ? {
              ...w,
              currentValue: cappedValue,
              completed: cappedValue >= w.targetValue,
              lastUpdated: Date.now(),
            }
          : w
      );

      await updateDoc(dailyProgressRef, { workouts: updatedWorkouts });

      setStats(prev => prev ? {
        ...prev,
        dailyWorkouts: updatedWorkouts,
      } : null);

      checkAllWorkoutsCompleted(updatedWorkouts);

      setShowEditModal(false);
      setProgressValue('');
      setEditingWorkout(null);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleCompleteWorkout = async (workout: DailyWorkout) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyProgressRef = doc(db, 'daily_workout_progress', `${auth.currentUser.uid}_${today}`);

      const updatedWorkouts = stats.dailyWorkouts.map(w =>
        w.id === workout.id
          ? {
              ...w,
              currentValue: workout.targetValue,
              completed: true,
              lastUpdated: Date.now(),
            }
          : w
      );

      await updateDoc(dailyProgressRef, { workouts: updatedWorkouts });

      setStats(prev => prev ? {
        ...prev,
        dailyWorkouts: updatedWorkouts,
      } : null);

      checkAllWorkoutsCompleted(updatedWorkouts);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleResetProgress = async (workout: DailyWorkout) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyProgressRef = doc(db, 'daily_workout_progress', `${auth.currentUser.uid}_${today}`);

      const updatedWorkouts = stats.dailyWorkouts.map(w =>
        w.id === workout.id
          ? {
              ...w,
              currentValue: 0,
              completed: false,
              lastUpdated: Date.now(),
            }
          : w
      );

      await updateDoc(dailyProgressRef, { workouts: updatedWorkouts });

      setStats(prev => prev ? {
        ...prev,
        dailyWorkouts: updatedWorkouts,
      } : null);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const handleCompleteAllWorkouts = async () => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyProgressRef = doc(db, 'daily_workout_progress', `${auth.currentUser.uid}_${today}`);

      const updatedWorkouts = stats.dailyWorkouts.map(w => ({
        ...w,
        currentValue: w.targetValue,
        completed: true,
        lastUpdated: Date.now(),
      }));

      await updateDoc(dailyProgressRef, { workouts: updatedWorkouts });

      setStats(prev => prev ? {
        ...prev,
        dailyWorkouts: updatedWorkouts,
      } : null);

      checkAllWorkoutsCompleted(updatedWorkouts);
    } catch (error) {
      console.error('Error completing all workouts:', error);
    }
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
        {showCelebration && (
          <View style={styles.celebrationOverlay}>
            {confettiAnimations.map((confetti, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    transform: [
                      { translateX: confetti.position.x },
                      { translateY: confetti.position.y },
                      { scale: confetti.scale },
                      {
                        rotate: confetti.rotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                    opacity: confetti.opacity,
                    backgroundColor: [
                      '#4CAF50', // Green
                      '#66BB6A', // Light Green
                      '#81C784', // Lighter Green
                      '#A5D6A7', // Very Light Green
                      '#2E7D32', // Dark Green
                    ][index % 5],
                  },
                ]}
              />
            ))}
            <Animated.View
              style={[
                styles.celebrationContainer,
                {
                  opacity: celebrationOpacity,
                  transform: [{ scale: celebrationScale }],
                },
              ]}
            >
              <MaterialCommunityIcons 
                name="party-popper" 
                size={64}
                color="#4CAF50"
              />
              <ThemedText style={styles.celebrationText}>
                Completed!
              </ThemedText>
            </Animated.View>
          </View>
        )}

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
              <ThemedText style={[styles.sectionTitle, { color: currentTheme.colors.accent }]}>
                Level {stats.stats.level}
              </ThemedText>
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
            <ThemedText style={[styles.xpText, { color: currentTheme.colors.accent }]}>
              {stats.stats.currentLevelXP} / {stats.stats.xpForNextLevel} XP
            </ThemedText>
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
              <View style={styles.workoutsList}>
                {stats.dailyWorkouts.map((workout) => (
                  <TouchableOpacity 
                    key={workout.id}
                    style={[
                      styles.workoutItem,
                      { 
                        backgroundColor: workout.completed 
                          ? `${currentTheme.colors.accent}30`
                          : `${currentTheme.colors.accent}10`,
                        borderRadius: 12,
                      }
                    ]}
                    onPress={() => {
                      setEditingWorkout(workout);
                      setProgressValue(workout.currentValue.toString());
                      setShowEditModal(true);
                    }}
                  >
                    <View style={styles.workoutHeader}>
                      <View style={styles.workoutInfo}>
                        <MaterialCommunityIcons 
                          name={workout.icon as any}
                          size={24}
                          color={currentTheme.colors.accent}
                        />
                        <ThemedText style={[styles.workoutName, { color: currentTheme.colors.text }]}>
                          {workout.name}
                        </ThemedText>
                      </View>
                      <View style={styles.workoutProgress}>
                        <ThemedText style={[styles.workoutValue, { color: currentTheme.colors.text }]}>
                          {workout.currentValue}/{workout.targetValue} {workout.unit}
                        </ThemedText>
                        <View style={styles.workoutActions}>
                          {!workout.completed && (
                            <TouchableOpacity
                              style={[styles.completeButton, { backgroundColor: currentTheme.colors.accent }]}
                              onPress={() => handleCompleteWorkout(workout)}
                            >
                              <MaterialCommunityIcons 
                                name="check"
                                size={16}
                                color="#fff"
                              />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => handleResetProgress(workout)}
                          >
                            <MaterialCommunityIcons 
                              name="refresh"
                              size={20}
                              color={currentTheme.colors.accent}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
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
                  </TouchableOpacity>
                ))}
                
                {/* Complete All Button */}
                <TouchableOpacity
                  style={[
                    styles.completeAllButton,
                    { 
                      backgroundColor: currentTheme.colors.accent,
                      opacity: stats.dailyWorkouts.every(w => w.completed) ? 0.5 : 1,
                      marginTop: 12,
                      marginBottom: 8,
                    }
                  ]}
                  onPress={handleCompleteAllWorkouts}
                  disabled={stats.dailyWorkouts.every(w => w.completed)}
                >
                  <MaterialCommunityIcons 
                    name="check-all"
                    size={24}
                    color="#fff"
                  />
                  <ThemedText style={styles.completeAllText}>
                    Complete All Workouts
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Edit Progress Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.background }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Update Progress
                </ThemedText>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <MaterialCommunityIcons 
                    name="close"
                    size={24}
                    color={currentTheme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  Enter your progress for {editingWorkout?.name}
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: currentTheme.colors.text,
                        borderColor: currentTheme.colors.border,
                      }
                    ]}
                    value={progressValue}
                    onChangeText={setProgressValue}
                    keyboardType="numeric"
                    placeholder="Enter value"
                    placeholderTextColor={`${currentTheme.colors.text}50`}
                  />
                  <ThemedText style={styles.unitText}>
                    {editingWorkout?.unit}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: currentTheme.colors.accent }]}
                  onPress={handleUpdateProgress}
                >
                  <ThemedText style={styles.modalButtonText}>
                    Save
                  </ThemedText>
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
    height: 380,
  },
  workoutsList: {
    gap: 12,
    paddingBottom: 8,
  },
  workoutItem: {
    padding: 16,
    gap: 12,
    minHeight: 96,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
  },
  workoutProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    width: 60,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '15%',
    flexDirection: 'column',
    gap: 24,
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
    marginTop: 0,
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
  },
  completeAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
