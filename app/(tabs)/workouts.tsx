import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, StatusBar, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc, setDoc, arrayUnion } from 'firebase/firestore';

// Workout categories and their exercises
const workoutCategories = {
  cardiovascular: {
    title: 'Cardiovascular',
    icon: 'run',
    exercises: [
      { name: 'Running', metric: 'Distance', icon: 'run', unit: 'km' },
      { name: 'Cycling', metric: 'Distance', icon: 'bike', unit: 'km' },
      { name: 'Swimming', metric: 'Distance', icon: 'swim', unit: 'km' },
      { name: 'Walking', metric: 'Distance', icon: 'walk', unit: 'km' },
    ],
  },
  strength: {
    title: 'Strength Training',
    icon: 'weight-lifter',
    exercises: [
      { name: 'Push-ups', metric: 'Reps', icon: 'human', unit: 'reps' },
      { name: 'Pull-ups', metric: 'Reps', icon: 'human-handsup', unit: 'reps' },
      { name: 'Squats', metric: 'Reps', icon: 'human-handsdown', unit: 'reps' },
      { name: 'Planks', metric: 'Time', icon: 'human', unit: 'minutes' },
    ],
  },
  flexibility: {
    title: 'Flexibility & Mobility',
    icon: 'yoga',
    exercises: [
      { name: 'Static Stretching', metric: 'Time', icon: 'human', unit: 'minutes' },
      { name: 'Dynamic Stretching', metric: 'Time', icon: 'run', unit: 'minutes' },
      { name: 'Yoga', metric: 'Time/Session', icon: 'yoga', unit: 'minutes' },
      { name: 'Pilates', metric: 'Time/Session', icon: 'human', unit: 'minutes' },
      { name: 'PNF Stretching', metric: 'Time', icon: 'human', unit: 'minutes' },
    ],
  },
  balance: {
    title: 'Balance & Stability',
    icon: 'human-balance',
    exercises: [
      { name: 'Tai Chi', metric: 'Time/Session', icon: 'human', unit: 'minutes' },
      { name: 'Yoga Balance Poses', metric: 'Time/Session', icon: 'yoga', unit: 'minutes' },
      { name: 'Single-Leg Stand', metric: 'Time', icon: 'human', unit: 'minutes' },
      { name: 'Heel-to-Toe Walking', metric: 'Distance/Time', icon: 'walk', unit: 'minutes' },
      { name: 'Balance Board', metric: 'Time', icon: 'human-balance', unit: 'minutes' },
    ],
  },
  hiit: {
    title: 'HIIT',
    icon: 'lightning-bolt',
    exercises: [
      { name: 'Sprint Intervals', metric: 'Distance', icon: 'run-fast', unit: 'km' },
      { name: 'Circuit Training', metric: 'Time', icon: 'sync', unit: 'minutes' },
      { name: 'Tabata', metric: 'Time', icon: 'timer', unit: 'minutes' },
      { name: 'Burpees', metric: 'Reps/Time', icon: 'human', unit: 'reps' },
      { name: 'Box Jumps', metric: 'Reps', icon: 'arrow-up-box', unit: 'reps' },
    ],
  },
  functional: {
    title: 'Functional Training',
    icon: 'dumbbell',
    exercises: [
      { name: 'Squats', metric: 'Reps', icon: 'human', unit: 'reps' },
      { name: 'Lunges', metric: 'Reps', icon: 'human', unit: 'reps' },
      { name: 'Step-Ups', metric: 'Reps', icon: 'stairs-up', unit: 'reps' },
      { name: 'Medicine Ball Throws', metric: 'Reps', icon: 'basketball', unit: 'reps' },
      { name: 'Kettlebell Swings', metric: 'Reps', icon: 'weight', unit: 'reps' },
    ],
  },
};

interface Exercise {
  name: string;
  metric: string;
  icon: string;
  unit: string;
  value: number;
  timestamp: number;
  date: string;
}

interface ExerciseTemplate {
  name: string;
  metric: string;
  icon: string;
  unit: string;
}

export default function WorkoutsScreen() {
  const { currentTheme } = useTheme();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseValue, setExerciseValue] = useState('');
  const [todayWorkouts, setTodayWorkouts] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodayWorkouts();
  }, []);

  const loadTodayWorkouts = async () => {
    if (!auth.currentUser) return;

    try {
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const allWorkouts = data.workouts || [];
        
        // Sort by timestamp, most recent first
        const sortedWorkouts = allWorkouts.sort((a: Exercise, b: Exercise) => 
          (b.timestamp || 0) - (a.timestamp || 0)
        );
        
        setTodayWorkouts(sortedWorkouts);
      } else {
        // Create the document if it doesn't exist
        await setDoc(userWorkoutsRef, { workouts: [] });
        setTodayWorkouts([]);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const handleDeleteWorkout = async (timestamp: number) => {
    if (!auth.currentUser) return;

    try {
      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const updatedWorkouts = data.workouts.filter((w: Exercise) => w.timestamp !== timestamp);
        
        await updateDoc(userWorkoutsRef, {
          workouts: updatedWorkouts
        });
        
        setTodayWorkouts(prev => prev.filter(w => w.timestamp !== timestamp));
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const handleAddWorkout = () => {
    setShowWorkoutModal(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleExerciseSelect = (exercise: ExerciseTemplate) => {
    // Add default values for the required properties
    const exerciseWithDefaults: Exercise = {
      ...exercise,
      value: 0,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setSelectedExercise(exerciseWithDefaults);
    setShowWorkoutModal(false);
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async () => {
    if (!auth.currentUser || !selectedExercise || !exerciseValue) return;

    try {
      const value = parseFloat(exerciseValue);
      if (isNaN(value)) return;

      const finalValue = selectedExercise.unit === 'miles' ? value * 1.60934 : value;
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      const newWorkout = {
        ...selectedExercise,
        value: finalValue,
        timestamp,
        date: today,
      };

      const userWorkoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const userWorkoutsDoc = await getDoc(userWorkoutsRef);
      
      if (userWorkoutsDoc.exists()) {
        const data = userWorkoutsDoc.data();
        const workouts = data.workouts || [];
        
        // Check for duplicate workouts more thoroughly
        const todaysWorkouts = workouts.filter((w: Exercise) => w.date === today);
        const hasDuplicate = todaysWorkouts.some((w: Exercise) => 
          w.name === newWorkout.name && 
          w.value === newWorkout.value
        );

        if (hasDuplicate) {
          // Don't add duplicate workout
          setShowExerciseModal(false);
          setExerciseValue('');
          setSelectedExercise(null);
          return;
        }

        await updateDoc(userWorkoutsRef, {
          workouts: arrayUnion(newWorkout)
        });
      } else {
        await setDoc(userWorkoutsRef, {
          workouts: [newWorkout]
        });
      }
      
      setTodayWorkouts(prev => [newWorkout, ...prev]);
      setShowExerciseModal(false);
      setExerciseValue('');
      setSelectedExercise(null);
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const renderWorkoutItem = (exercise: Exercise) => {
    return (
      <View
        key={`workout-${exercise.name}-${exercise.timestamp}`}
        style={[styles.workoutItem, {
          backgroundColor: `${currentTheme.colors.accent}15`,
          borderColor: currentTheme.colors.accent,
        }]}
      >
        <View style={styles.workoutItemLeft}>
          <View style={[styles.workoutIcon, { backgroundColor: `${currentTheme.colors.accent}20` }]}>
            <MaterialCommunityIcons
              name={exercise.icon as any}
              size={24}
              color={currentTheme.colors.accent}
            />
          </View>
          <View>
            <ThemedText style={[styles.workoutName, { color: currentTheme.colors.accent }]}>{exercise.name}</ThemedText>
            <ThemedText style={[styles.workoutTime, { color: `${currentTheme.colors.accent}99` }]}>
              {new Date(exercise.timestamp).toLocaleTimeString()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.workoutRight}>
          <ThemedText style={[styles.workoutValue, { color: currentTheme.colors.accent }]}>
            {exercise.value} {exercise.unit}
          </ThemedText>
          <TouchableOpacity
            onPress={() => handleDeleteWorkout(exercise.timestamp)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete" size={20} color={currentTheme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodayWorkouts();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle="light-content"
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
          {/* Daily Workouts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Daily Workout</ThemedText>
            </View>
            
            <View style={styles.workoutsList}>
              {todayWorkouts.length > 0 ? (
                todayWorkouts.map(renderWorkoutItem)
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={32}
                    color={currentTheme.colors.accent}
                  />
                  <ThemedText style={styles.emptyStateText}>
                    No workouts added today
                  </ThemedText>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: currentTheme.colors.accent }]}
              onPress={handleAddWorkout}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <ThemedText style={styles.addButtonText}>Add Workout</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showWorkoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWorkoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Choose Workout Type</ThemedText>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {Object.entries(workoutCategories).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryButton, {
                    backgroundColor: selectedCategory === key ? currentTheme.colors.accent : 'rgba(255, 255, 255, 0.1)',
                  }]}
                  onPress={() => handleCategorySelect(key)}
                >
                  <MaterialCommunityIcons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === key ? '#fff' : currentTheme.colors.accent}
                  />
                  <ThemedText style={[
                    styles.categoryText,
                    selectedCategory === key && { color: '#fff' }
                  ]}>
                    {category.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedCategory && (
              <View style={styles.exercisesList}>
                <ThemedText style={styles.exercisesTitle}>Exercises</ThemedText>
                {workoutCategories[selectedCategory as keyof typeof workoutCategories].exercises.map((exercise) => {
                  const isExerciseAdded = todayWorkouts.some(w => w.name === exercise.name);
                  return (
                    <TouchableOpacity
                      key={exercise.name}
                      style={[
                        styles.exerciseButton,
                        {
                          backgroundColor: isExerciseAdded ? `${currentTheme.colors.error}20` : 'rgba(255, 255, 255, 0.1)',
                          borderColor: isExerciseAdded ? currentTheme.colors.error : currentTheme.colors.accent,
                          opacity: isExerciseAdded ? 0.7 : 1,
                        }
                      ]}
                      onPress={() => {
                        if (!isExerciseAdded) {
                          handleExerciseSelect(exercise);
                        }
                      }}
                      disabled={isExerciseAdded}
                    >
                      <View style={styles.exerciseLeft}>
                        <MaterialCommunityIcons
                          name={exercise.icon as any}
                          size={24}
                          color={isExerciseAdded ? currentTheme.colors.error : currentTheme.colors.accent}
                        />
                        <View>
                          <ThemedText style={[
                            styles.exerciseName,
                            isExerciseAdded && { color: currentTheme.colors.error }
                          ]}>
                            {exercise.name}
                          </ThemedText>
                          {isExerciseAdded && (
                            <ThemedText style={[styles.exerciseAdded, { color: currentTheme.colors.error }]}>
                              Already added today
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <ThemedText style={[
                        styles.exerciseMetric,
                        isExerciseAdded && { color: currentTheme.colors.error }
                      ]}>
                        {exercise.metric}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Exercise Value Input Modal */}
      <Modal
        visible={showExerciseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{selectedExercise?.name}</ThemedText>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                Enter {selectedExercise?.metric.toLowerCase()}:
              </ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, {
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  }]}
                  value={exerciseValue}
                  onChangeText={setExerciseValue}
                  keyboardType="numeric"
                  placeholder={`Enter ${selectedExercise?.metric.toLowerCase()}`}
                  placeholderTextColor={currentTheme.colors.text + '80'}
                />
                <ThemedText style={styles.unitText}>{selectedExercise?.unit}</ThemedText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentTheme.colors.error }]}
                onPress={() => setShowExerciseModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentTheme.colors.accent }]}
                onPress={handleSaveExercise}
              >
                <ThemedText style={styles.modalButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutsList: {
    flex: 1,
    marginBottom: 16,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 88, // Ensure consistent height
  },
  workoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
  },
  workoutTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  workoutValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesList: {
    maxHeight: 200,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exercisesList: {
    marginTop: 20,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseMetric: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    marginVertical: 20,
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
    gap: 12,
    marginTop: 20,
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
  workoutRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  exerciseAdded: {
    fontSize: 12,
    marginTop: 2,
  },
}); 