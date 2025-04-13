import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WorkoutProgress } from '@/types/workout';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AdditionalWorkoutsProps {
  additionalWorkouts: WorkoutProgress[];
  currentTheme: any;
  onWorkoutAdded: () => Promise<void>;
  onWorkoutRemoved: (workout: WorkoutProgress) => Promise<void>;
  updateXPAfterWorkoutChange: () => Promise<void>;
  userWeight: number;
}

export const AdditionalWorkouts = ({
  additionalWorkouts,
  currentTheme,
  onWorkoutAdded,
  onWorkoutRemoved,
  updateXPAfterWorkoutChange,
  userWeight
}: AdditionalWorkoutsProps) => {
  // State variables
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [additionalWorkoutType, setAdditionalWorkoutType] = useState('Running');
  const [additionalWorkoutValue, setAdditionalWorkoutValue] = useState('');
  const [additionalWorkoutUnit, setAdditionalWorkoutUnit] = useState('km');
  const [additionalWorkoutIntensity, setAdditionalWorkoutIntensity] = useState('Medium');

  // Helper functions
  const getIconForWorkoutType = (workoutType: string): string => {
    // Map workout types to icons
    const iconMap: Record<string, string> = {
      'Running': 'run',
      'Cycling': 'bike',
      'Swimming': 'swim',
      'Walking': 'walk',
      'Push-ups': 'human-handsup',
      'Pull-ups': 'arm-flex',
      'Squats': 'human-male-height-variant',
      'Planks': 'yoga',
      'Static Stretching': 'yoga',
      'Dynamic Stretching': 'yoga',
      'Yoga': 'yoga',
      'Pilates': 'yoga',
      'Tai Chi': 'yoga',
      'Circuit Training': 'weight-lifter',
      'Burpees': 'arm-flex',
      'Lunges': 'human-male-height-variant',
      'Jumping Jacks': 'run',
      'Sit-ups': 'human-handsup',
    };
    
    return iconMap[workoutType] || 'dumbbell';
  };

  const getUnitForWorkoutType = (workoutType: string): string => {
    // Map workout types to their default units
    const workoutTypeUnitMap: Record<string, string> = {
      'Running': 'km',
      'Cycling': 'km',
      'Swimming': 'km',
      'Walking': 'km',
      'Push-ups': 'reps',
      'Pull-ups': 'reps',
      'Squats': 'reps',
      'Planks': 'minutes',
      'Static Stretching': 'minutes',
      'Dynamic Stretching': 'minutes',
      'Yoga': 'minutes',
      'Pilates': 'minutes',
      'PNF Stretching': 'minutes',
      'Tai Chi': 'minutes',
      'Yoga Balance': 'minutes',
      'Single-Leg Stand': 'minutes',
      'Heel-to-Toe Walking': 'minutes',
      'Balance Board': 'minutes',
      'Sprint Intervals': 'meters',
      'Circuit Training': 'minutes',
      'Tabata': 'minutes',
      'Burpees': 'reps',
      'Box Jumps': 'reps',
      'Lunges': 'reps',
      'Step-Ups': 'reps',
      'Medicine Ball Throws': 'reps',
      'Kettlebell Swings': 'reps'
    };
    
    return workoutTypeUnitMap[workoutType] || 'reps';
  };

  const getAvailableUnitsForWorkoutType = (workoutType: string): string[] => {
    // Define which units are available for each workout type
    const workoutTypeUnitsMap: Record<string, string[]> = {
      'Running': ['km', 'minutes'],
      'Cycling': ['km', 'minutes'],
      'Swimming': ['km', 'minutes'],
      'Walking': ['km', 'minutes'],
      'Push-ups': ['reps'],
      'Pull-ups': ['reps'],
      'Squats': ['reps'],
      'Planks': ['minutes', 'seconds'],
      'Static Stretching': ['minutes'],
      'Dynamic Stretching': ['minutes'],
      'Yoga': ['minutes'],
      'Pilates': ['minutes'],
      'PNF Stretching': ['minutes'],
      'Tai Chi': ['minutes'],
      'Yoga Balance': ['minutes'],
      'Single-Leg Stand': ['minutes', 'seconds'],
      'Heel-to-Toe Walking': ['minutes', 'meters'],
      'Balance Board': ['minutes'],
      'Sprint Intervals': ['meters', 'minutes'],
      'Circuit Training': ['minutes'],
      'Tabata': ['minutes'],
      'Burpees': ['reps'],
      'Box Jumps': ['reps'],
      'Lunges': ['reps'],
      'Step-Ups': ['reps'],
      'Medicine Ball Throws': ['reps'],
      'Kettlebell Swings': ['reps']
    };
    
    return workoutTypeUnitsMap[workoutType] || ['reps', 'minutes', 'km'];
  };

  const getAvailableIntensitiesForWorkoutType = (workoutType: string): string[] => {
    // Default intensities for all workouts
    const defaultIntensities = ['Light', 'Medium', 'High'];
    
    // Customize intensities for specific workout types
    const workoutTypeIntensitiesMap: Record<string, string[]> = {
      'Running': ['Slow (5-6 km/h)', 'Medium (8-10 km/h)', 'Fast (12+ km/h)'],
      'Walking': ['Slow (3 km/h)', 'Medium (4-5 km/h)', 'Fast (6+ km/h)'],
      'Cycling': ['Slow (10-15 km/h)', 'Medium (15-25 km/h)', 'Fast (25+ km/h)'],
      'Swimming': ['Slow', 'Medium', 'Fast'],
      'Circuit Training': ['Light', 'Medium', 'Intense'],
      'Yoga': ['Gentle', 'Regular', 'Power'],
      'Pilates': ['Beginner', 'Intermediate', 'Advanced'],
    };
    
    return workoutTypeIntensitiesMap[workoutType] || defaultIntensities;
  };

  // Calculate calories based on workout type, unit, value, intensity, and user weight
  const calculateCaloriesForWorkout = (
    workoutType: string,
    value: number,
    unit: string,
    intensity: string = 'Medium',
    weight: number = 70 // Default weight if not provided
  ): number => {
    const userWeightKg = weight > 0 ? weight : 70; // Use default if weight is invalid
    let intensityMultiplier = 1.0;
    
    // Set intensity multipliplier based on the intensity level
    if (intensity.includes('Low') || intensity.includes('Slow') || intensity.includes('Light') || intensity.includes('Gentle') || intensity.includes('Beginner')) {
      intensityMultiplier = 0.8;
    } else if (intensity.includes('High') || intensity.includes('Fast') || intensity.includes('Intense') || intensity.includes('Power') || intensity.includes('Advanced')) {
      intensityMultiplier = 1.2;
    }
    
    let baseCalories = 0;
    
    if (unit === 'minutes') {
      // MET values (Metabolic Equivalent of Task)
      let metValue = 1.0;
      
      if (workoutType.toLowerCase().includes('running')) {
        // Running MET varies from 7-15 depending on speed
        metValue = intensity.includes('Slow') ? 7.0 : intensity.includes('Fast') ? 12.0 : 9.0;
      } else if (workoutType.toLowerCase().includes('cycling')) {
        // Cycling MET varies from 4-14 depending on intensity
        metValue = intensity.includes('Slow') ? 4.0 : intensity.includes('Fast') ? 10.0 : 6.0;
      } else if (workoutType.toLowerCase().includes('walking')) {
        // Walking MET varies from 2-5 depending on speed
        metValue = intensity.includes('Slow') ? 2.5 : intensity.includes('Fast') ? 4.0 : 3.0;
      } else if (workoutType.toLowerCase().includes('swimming')) {
        // Swimming MET varies from 5-10
        metValue = intensity.includes('Slow') ? 5.0 : intensity.includes('Fast') ? 8.0 : 6.0;
      } else if (workoutType.toLowerCase().includes('yoga') || 
                workoutType.toLowerCase().includes('pilates')) {
        metValue = 2.5; // Yoga/Pilates MET ~2.5
      } else if (workoutType.toLowerCase().includes('circuit') || 
                workoutType.toLowerCase().includes('hiit')) {
        metValue = 6.0; // Circuit/HIIT training MET ~6
      } else if (workoutType.toLowerCase().includes('strength') || 
                workoutType.toLowerCase().includes('weight')) {
        metValue = 3.5; // Strength training MET ~3.5
      } else {
        metValue = 3.0; // Default MET
      }
      
      // Calories = MET × weight (kg) × time (hours)
      // Formula: Calories = MET * weight (kg) * time (hours)
      baseCalories = metValue * userWeightKg * (value / 60);
    } else if (unit === 'km') {
      if (workoutType.toLowerCase().includes('running')) {
        // ~1.0 calories per kg of body weight per km running
        baseCalories = userWeightKg * 1.0 * value;
      } else if (workoutType.toLowerCase().includes('cycling')) {
        // ~0.5 calories per kg of body weight per km cycling
        baseCalories = userWeightKg * 0.5 * value;
      } else if (workoutType.toLowerCase().includes('walking')) {
        // ~0.6 calories per kg of body weight per km walking
        baseCalories = userWeightKg * 0.6 * value;
      } else if (workoutType.toLowerCase().includes('swimming')) {
        // ~2.0 calories per kg of body weight per km swimming
        baseCalories = userWeightKg * 2.0 * value;
      } else {
        // Default: ~0.8 calories per kg of body weight per km
        baseCalories = userWeightKg * 0.8 * value;
      }
    } else if (unit === 'reps') {
      // For rep-based exercises, weight has less impact on calorie burn
      // These are rough estimates that still factor in weight slightly
      if (workoutType.toLowerCase().includes('push')) {
        baseCalories = 0.1 * (1 + userWeightKg/100) * value; // Push-ups
      } else if (workoutType.toLowerCase().includes('pull')) {
        baseCalories = 0.15 * (1 + userWeightKg/100) * value; // Pull-ups
      } else if (workoutType.toLowerCase().includes('squat')) {
        baseCalories = 0.15 * (1 + userWeightKg/100) * value; // Squats
      } else if (workoutType.toLowerCase().includes('burpee')) {
        baseCalories = 0.3 * (1 + userWeightKg/100) * value; // Burpees
      } else if (workoutType.toLowerCase().includes('lunge')) {
        baseCalories = 0.1 * (1 + userWeightKg/100) * value; // Lunges
      } else {
        baseCalories = 0.12 * (1 + userWeightKg/100) * value; // Default for rep-based
      }
    } else if (unit === 'meters') {
      baseCalories = 0.06 * (1 + userWeightKg/100) * value; // 0.06 calories per meter, slightly adjusted for weight
    } else if (unit === 'seconds') {
      baseCalories = (userWeightKg/70) * 0.05 * value; // 0.05 calories per second, adjusted for weight
    }
    
    // Apply intensity multiplier and round to the nearest integer
    return Math.round(baseCalories * intensityMultiplier);
  };

  // Event Handlers
  const handleAddAdditionalWorkout = async () => {
    if (!auth.currentUser || !additionalWorkoutValue || !additionalWorkoutType) return;

    try {
      const value = parseFloat(additionalWorkoutValue);
      if (isNaN(value) || value <= 0) {
        console.log("Invalid workout value");
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log(`Adding additional workout: ${additionalWorkoutType} with value ${value} ${additionalWorkoutUnit} at intensity ${additionalWorkoutIntensity}`);
      
      // Get reference to user's progress document
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('User is not authenticated');
        return;
      }
      
      const progressRef = doc(db, 'daily_workout_progress', userId);
      const progressDoc = await getDoc(progressRef);
      
      // Calculate calories for this workout
      const calories = calculateCaloriesForWorkout(
        additionalWorkoutType, 
        value, 
        additionalWorkoutUnit, 
        additionalWorkoutIntensity,
        userWeight
      );
      
      // Create new progress entry with calories
      const newProgress = {
        value: value,
        completed: true,  // Additional workouts are always completed
        timestamp,
        date: today,
        unit: additionalWorkoutUnit,
        intensity: additionalWorkoutIntensity, // Store intensity level
        calories: calories, // Store calculated calories
        isAdditional: true  // Mark as an additional workout
      };
      
      // Update or create the progress document
      if (progressDoc.exists()) {
        await updateDoc(progressRef, {
          [`${additionalWorkoutType}.${today}`]: newProgress
        });
      } else {
        await setDoc(progressRef, {
          [additionalWorkoutType]: {
            [today]: newProgress
          }
        });
      }

      console.log(`Added additional workout: ${additionalWorkoutType} (${calories} calories)`);
      
      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reset state and reload data
      setShowAddWorkoutModal(false);
      setAdditionalWorkoutValue('');
      setAdditionalWorkoutIntensity('Medium'); // Reset intensity to default
      await onWorkoutAdded();
    } catch (error) {
      console.error('Error adding additional workout:', error);
    }
  };

  // Add a function to group workout options by category
  const renderWorkoutOptionsByCategory = () => {
    // Create a list of all workout types
    const workoutOptions = [
      // Cardiovascular
      { name: 'Running', category: 'Cardiovascular' },
      { name: 'Cycling', category: 'Cardiovascular' },
      { name: 'Swimming', category: 'Cardiovascular' },
      { name: 'Walking', category: 'Cardiovascular' },
      
      // Strength Training
      { name: 'Push-ups', category: 'Strength' },
      { name: 'Pull-ups', category: 'Strength' },
      { name: 'Squats', category: 'Strength' },
      { name: 'Planks', category: 'Strength' },
      
      // Flexibility & Mobility
      { name: 'Static Stretching', category: 'Flexibility' },
      { name: 'Dynamic Stretching', category: 'Flexibility' },
      { name: 'Yoga', category: 'Flexibility' },
      { name: 'Pilates', category: 'Flexibility' },
      { name: 'PNF Stretching', category: 'Flexibility' },
      
      // Balance & Stability
      { name: 'Tai Chi', category: 'Balance' },
      { name: 'Yoga Balance', category: 'Balance' },
      { name: 'Single-Leg Stand', category: 'Balance' },
      { name: 'Heel-to-Toe Walking', category: 'Balance' },
      { name: 'Balance Board', category: 'Balance' },
      
      // HIIT
      { name: 'Sprint Intervals', category: 'HIIT' },
      { name: 'Circuit Training', category: 'HIIT' },
      { name: 'Tabata', category: 'HIIT' },
      { name: 'Burpees', category: 'HIIT' },
      { name: 'Box Jumps', category: 'HIIT' },
      
      // Functional Training
      { name: 'Lunges', category: 'Functional' },
      { name: 'Step-Ups', category: 'Functional' },
      { name: 'Medicine Ball Throws', category: 'Functional' },
      { name: 'Kettlebell Swings', category: 'Functional' },
    ];
    
    // Group by category
    const groupedOptions: Record<string, { name: string, category: string }[]> = {};
    workoutOptions.forEach(option => {
      if (!groupedOptions[option.category]) {
        groupedOptions[option.category] = [];
      }
      groupedOptions[option.category].push(option);
    });
    
    // Return JSX for each category
    return Object.entries(groupedOptions).map(([category, options]) => (
      <View key={category} style={{ marginBottom: 12 }}>
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          color: currentTheme.colors.accent, 
          marginBottom: 8,
          marginLeft: 4
        }}>
          {category}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {options.map(option => (
            <TouchableOpacity
              key={option.name}
              style={[
                styles.pickerItem,
                {
                  borderColor: currentTheme.colors.accent,
                  backgroundColor: additionalWorkoutType === option.name ? currentTheme.colors.accent : 'transparent',
                }
              ]}
              onPress={() => {
                setAdditionalWorkoutType(option.name);
                const defaultUnit = getUnitForWorkoutType(option.name);
                setAdditionalWorkoutUnit(defaultUnit);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  {
                    color: additionalWorkoutType === option.name ? '#fff' : currentTheme.colors.text,
                  }
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ));
  };

  const renderAdditionalWorkouts = () => {
    if (!additionalWorkouts || additionalWorkouts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No additional workouts recorded today</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.workoutsList}>
        {additionalWorkouts.map((workout) => (
          <View
            key={`additional-${workout.name}-${workout.timestamp}`}
            style={[styles.workoutItem, {
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderColor: currentTheme.colors.accent,
            }]}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <ThemedText style={[styles.additionalWorkoutValue, { color: currentTheme.colors.accent }]}>
                    {workout.currentValue} {workout.unit}
                  </ThemedText>
                  {workout.intensity && (
                    <View style={{ 
                      backgroundColor: `${currentTheme.colors.accent}30`, 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 12,
                      marginLeft: 8
                    }}>
                      <ThemedText style={{ fontSize: 12, color: currentTheme.colors.accent }}>
                        {workout.intensity}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.caloriesText, { color: `${currentTheme.colors.accent}99` }]}>
                  ~{workout.calories || calculateCaloriesForWorkout(
                    workout.name, 
                    workout.currentValue, 
                    workout.unit, 
                    workout.intensity || 'Medium',
                    userWeight
                  )} cal
                </ThemedText>
              </View>
            </View>
            <View style={styles.workoutRight}>
              <TouchableOpacity
                onPress={() => onWorkoutRemoved(workout)}
                style={[styles.actionButton, { borderColor: currentTheme.colors.accent, borderWidth: 1 }]}
              >
                <MaterialCommunityIcons name="delete" size={20} color={currentTheme.colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.section, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="plus-circle" size={24} color={currentTheme.colors.accent} />
        <ThemedText style={[styles.sectionTitle, { color: currentTheme.colors.accent }]}>
          Additional Workouts
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[
          styles.addWorkoutButton,
          { backgroundColor: currentTheme.colors.accent }
        ]}
        onPress={() => setShowAddWorkoutModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <ThemedText style={[styles.addWorkoutButtonText, { color: '#fff' }]}>
          Add Workout
        </ThemedText>
      </TouchableOpacity>
      <ScrollView 
        style={styles.additionalWorkoutsScrollView} 
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {renderAdditionalWorkouts()}
      </ScrollView>

      {/* Add Workout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddWorkoutModal}
        onRequestClose={() => {
          setShowAddWorkoutModal(false);
          setAdditionalWorkoutValue('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
              Add Additional Workout
            </Text>
            
            <Text style={{ fontSize: 16, marginBottom: 8, color: currentTheme.colors.text }}>
              Workout Type
            </Text>
            <ScrollView 
              style={{ maxHeight: 200, marginBottom: 16 }} 
              showsVerticalScrollIndicator={true}
            >
              {renderWorkoutOptionsByCategory()}
            </ScrollView>
            
            <Text style={{ fontSize: 16, marginBottom: 8, color: currentTheme.colors.text }}>
              Value
            </Text>
            <TextInput
              style={[styles.input, { 
                fontSize: 18, 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent
              }]}
              value={additionalWorkoutValue}
              onChangeText={setAdditionalWorkoutValue}
              keyboardType="numeric"
              placeholder={`Enter value in ${additionalWorkoutUnit}`}
              placeholderTextColor={`${currentTheme.colors.text}50`}
            />
            
            <Text style={{ fontSize: 16, marginBottom: 8, color: currentTheme.colors.text }}>
              Unit
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getAvailableUnitsForWorkoutType(additionalWorkoutType).map((unit: string) => (
                  <TouchableOpacity
                    key={unit}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 24,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.accent,
                      backgroundColor: additionalWorkoutUnit === unit ? currentTheme.colors.accent : 'transparent',
                    }}
                    onPress={() => setAdditionalWorkoutUnit(unit)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: additionalWorkoutUnit === unit ? '#fff' : currentTheme.colors.text,
                      }}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={{ fontSize: 16, marginBottom: 8, color: currentTheme.colors.text }}>
              Intensity
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getAvailableIntensitiesForWorkoutType(additionalWorkoutType).map((intensity: string) => (
                  <TouchableOpacity
                    key={intensity}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 24,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.accent,
                      backgroundColor: additionalWorkoutIntensity === intensity ? currentTheme.colors.accent : 'transparent',
                    }}
                    onPress={() => setAdditionalWorkoutIntensity(intensity)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: additionalWorkoutIntensity === intensity ? '#fff' : currentTheme.colors.text,
                      }}
                    >
                      {intensity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.colors.error }]}
                onPress={() => {
                  setShowAddWorkoutModal(false);
                  setAdditionalWorkoutValue('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
                onPress={handleAddAdditionalWorkout}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalWorkoutValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  additionalWorkoutsScrollView: {
    height: 200, // Fixed height to show approximately 2 workouts
  },
  addWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  addWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
  },
  caloriesText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
}); 