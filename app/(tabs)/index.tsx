import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, TextInput, Animated, Dimensions, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, DocumentReference, DocumentData } from 'firebase/firestore';
import { WorkoutProgress, UserStats, calculateLevel } from '@/types/workout';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { updateXpCalcData } from '@/utils/xpCalcService';

interface DashboardStats {
  username: string;
  coins: number;
  stats: UserStats;
  dailyWorkouts: WorkoutProgress[];
  additionalWorkouts: WorkoutProgress[];
  dailyCalories?: { [date: string]: number };
}

interface DailyProgress {
  [date: string]: {
    value: number;
    completed: boolean;
    timestamp: number;
    date: string;
    unit?: string;
    isAdditional?: boolean;
  };
}

interface ProgressData {
  [workoutName: string]: DailyProgress;
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
  const [refreshing, setRefreshing] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutProgress | null>(null);
  const [progressValue, setProgressValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showXPLimitToast, setShowXPLimitToast] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [additionalWorkoutType, setAdditionalWorkoutType] = useState('Running');
  const [additionalWorkoutValue, setAdditionalWorkoutValue] = useState('');
  const [additionalWorkoutUnit, setAdditionalWorkoutUnit] = useState('km');
  const celebrationOpacity = useState(new Animated.Value(0))[0];
  const celebrationScale = useState(new Animated.Value(0.3))[0];
  const xpLimitToastOpacity = useState(new Animated.Value(0))[0];
  const confettiAnimations = useState([...Array(20)].map(() => ({
    position: new Animated.ValueXY({ x: 0, y: 0 }),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
    rotation: new Animated.Value(0),
  })))[0];

  useEffect(() => {
    loadDashboardData();
    // Clean up incomplete workouts from previous days
    cleanupIncompleteWorkouts();
  }, []);

  // Add onRefresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (showXPLimitToast) {
      // Animate toast in
      Animated.sequence([
        Animated.timing(xpLimitToastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(xpLimitToastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowXPLimitToast(false);
      });
    }
  }, [showXPLimitToast]);

  const loadDashboardData = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const workoutsRef = doc(db, 'daily_workouts', auth.currentUser.uid);
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      
      const [userDoc, workoutsDoc, progressDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(workoutsRef),
        getDoc(progressRef)
      ]);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStats({
          username: userData.username,
          coins: userData.coins || 0,
          stats: {
            totalXP: userData.totalXP || 0,
            ...calculateLevel(userData.totalXP || 0),
          },
          dailyWorkouts: [],
          additionalWorkouts: [],
        });
        
        // Always recalculate XP to ensure accuracy
        if (progressDoc.exists()) {
          console.log("Recalculating XP on dashboard load...");
          await recalculateAllXP(progressDoc.data(), userRef, userData);
        }
      }

      // Get all workouts from daily_workouts collection
      if (workoutsDoc.exists()) {
        const workoutsData = workoutsDoc.data();
        const allWorkouts = workoutsData.workouts || [];

        // Get today's progress for these workouts
        const progressData = progressDoc.exists() ? progressDoc.data() as ProgressData : {};
        
        // Create a map of workout names to their latest values
        const latestWorkouts = new Map();
        allWorkouts.forEach((workout: any) => {
          const existingWorkout = latestWorkouts.get(workout.name);
          if (!existingWorkout || workout.timestamp > existingWorkout.timestamp) {
            latestWorkouts.set(workout.name, workout);
          }
        });

        // Convert to array and get today's progress if it exists
        const workoutProgress = Array.from(latestWorkouts.values()).map((workout: any) => {
          const todayProgress = progressData[workout.name]?.[today];
          return {
            name: workout.name,
            icon: workout.icon,
            metric: workout.metric,
            unit: workout.unit,
            targetValue: workout.value,
            currentValue: todayProgress?.value || 0,
            completed: todayProgress?.completed || false,
            timestamp: todayProgress?.timestamp || workout.timestamp,
            date: todayProgress?.date || today, // Use the date from progress data if available
            workoutId: workout.name.toLowerCase().replace(/\s+/g, '-'), // Generate workoutId from name
            isAdditional: false // Regular daily workout
          };
        });

        // Sort by timestamp, most recent first
        workoutProgress.sort((a, b) => b.timestamp - a.timestamp);
        
        // Now get additional workouts from today
        const additionalWorkouts: WorkoutProgress[] = [];
        
        // Look through progress data for any workouts that are not in the regular workouts
        // and are from today
        Object.entries(progressData).forEach(([workoutName, dateEntries]) => {
          const todayEntry = dateEntries[today];
          
          // Skip if no entry for today or if this is already in regular workouts
          if (!todayEntry || latestWorkouts.has(workoutName)) return;
          
          // Check if this is marked as an additional workout
          if (todayEntry.isAdditional) {
            additionalWorkouts.push({
              name: workoutName,
              icon: getIconForWorkoutType(workoutName),
              metric: '',
              unit: todayEntry.unit || 'reps',
              targetValue: todayEntry.value,
              currentValue: todayEntry.value,
              completed: todayEntry.completed,
              timestamp: todayEntry.timestamp,
              date: today,
              workoutId: workoutName.toLowerCase().replace(/\s+/g, '-'),
              isAdditional: true
            });
          }
        });
        
        // Sort additional workouts by timestamp, most recent first
        additionalWorkouts.sort((a, b) => b.timestamp - a.timestamp);
        
        setStats(prev => prev ? {
          ...prev,
          dailyWorkouts: workoutProgress,
          additionalWorkouts: additionalWorkouts,
        } : null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate XP from workout data and store in user document
  const recalculateAllXP = async (
    progressData: Record<string, any>, 
    userRef: DocumentReference, 
    userData: DocumentData
  ) => {
    // XP rates for different workout types based on their unit and value
    const workoutXPRates: Record<string, {unit: string, xpPerUnit: number}> = {
      'Running': { unit: 'km', xpPerUnit: 3 },
      'Cycling': { unit: 'km', xpPerUnit: 2 },
      'Swimming': { unit: 'km', xpPerUnit: 4 },
      'Walking': { unit: 'km', xpPerUnit: 1 },
      
      'Push-ups': { unit: 'reps', xpPerUnit: 0.1 },   // 1 XP per 10 reps
      'Pull-ups': { unit: 'reps', xpPerUnit: 0.2 },   // 1 XP per 5 reps
      'Squats': { unit: 'reps', xpPerUnit: 0.1 },     // 1 XP per 10 reps
      'Planks': { unit: 'minutes', xpPerUnit: 0.5 },  // 0.5 XP per minute
      
      'Static Stretching': { unit: 'minutes', xpPerUnit: 0.1 },    // 0.5 XP per 5 min
      'Dynamic Stretching': { unit: 'minutes', xpPerUnit: 0.1 },   // 0.5 XP per 5 min
      'Yoga': { unit: 'minutes', xpPerUnit: 0.2 },                 // 2 XP per 10 min
      'Pilates': { unit: 'minutes', xpPerUnit: 0.2 },              // 2 XP per 10 min
      'PNF Stretching': { unit: 'minutes', xpPerUnit: 0.1 },       // 0.5 XP per 5 min
      
      'Tai Chi': { unit: 'minutes', xpPerUnit: 0.2 },              // 2 XP per 10 min
      'Yoga Balance': { unit: 'minutes', xpPerUnit: 0.2 },         // 1 XP per 5 min
      'Single-Leg Stand': { unit: 'minutes', xpPerUnit: 0.25 },    // 0.5 XP per 2 min
      'Heel-to-Toe Walking': { unit: 'minutes', xpPerUnit: 0.1 },  // 0.5 XP per 5 min
      'Balance Board': { unit: 'minutes', xpPerUnit: 0.17 },       // 0.5 XP per 3 min
      
      'Sprint Intervals': { unit: 'meters', xpPerUnit: 0.03 },     // 3 XP per 100m
      'Circuit Training': { unit: 'minutes', xpPerUnit: 0.6 },     // 3 XP per 5 min
      'Tabata': { unit: 'minutes', xpPerUnit: 0.75 },              // 3 XP per 4 min
      'Burpees': { unit: 'reps', xpPerUnit: 0.2 },                 // 2 XP per 10 reps
      'Box Jumps': { unit: 'reps', xpPerUnit: 0.2 },               // 2 XP per 10 reps
      
      'Lunges': { unit: 'reps', xpPerUnit: 0.1 },                 // 1 XP per 10 reps
      'Step-Ups': { unit: 'reps', xpPerUnit: 0.1 },               // 1 XP per 10 reps
      'Medicine Ball Throws': { unit: 'reps', xpPerUnit: 0.1 },   // 1 XP per 10 reps
      'Kettlebell Swings': { unit: 'reps', xpPerUnit: 0.1 }       // 1 XP per 10 reps
    };

    try {
      // Start with a clean dailyXP object or use existing one
      const dailyXP: Record<string, number> = userData.dailyXP ? { ...userData.dailyXP } : {};
      
      // Track dates we're processing for logging purposes
      const datesProcessed = new Set<string>();
      
      // First, reset XP for all dates found in our current progress data
      // This ensures we're not carrying over stale values
      Object.entries(progressData).forEach(([workoutName, dateEntries]) => {
        if (typeof dateEntries !== 'object' || dateEntries === null) return;
        
        Object.keys(dateEntries).forEach(date => {
          // Track this date for processing
          datesProcessed.add(date);
          
          // Reset XP for this date - we'll recalculate it
          dailyXP[date] = 0;
        });
      });
      
      console.log(`Recalculating XP for ${datesProcessed.size} dates: ${Array.from(datesProcessed).join(', ')}`);
      
      // Now calculate XP for each workout and date
      Object.entries(progressData).forEach(([workoutName, dateEntries]) => {
        if (typeof dateEntries !== 'object' || dateEntries === null) {
          console.log(`Skipping invalid workout: ${workoutName} (not an object)`);
          return;
        }
        
        // Get XP rate for this workout type (default to a reasonable value if not found)
        const xpRate = workoutXPRates[workoutName] || { unit: 'reps', xpPerUnit: 0.1 };
        console.log(`Processing workout: ${workoutName} (XP rate: ${xpRate.xpPerUnit} per ${xpRate.unit})`);
        
        // Process each date entry for this workout
        Object.entries(dateEntries).forEach(([date, entry]) => {
          // Skip if entry is not valid or not completed
          if (!entry || typeof entry !== 'object') {
            console.log(`Skipping invalid entry for ${workoutName} on ${date}`);
            return;
          }
          
          // Strict check for completed=true (not just truthy)
          if ((entry as any).completed !== true) {
            console.log(`Skipping non-completed workout: ${workoutName} on ${date}`);
            return;
          }
          
          // Initialize this date's XP if not exists
          if (!dailyXP[date]) dailyXP[date] = 0;
          
          // Get workout value
          const value = (entry as any).value || 0;
          
          // Calculate XP based on workout value and XP rate
          const earnedXP = Math.floor(value * xpRate.xpPerUnit);
          
          // Add XP for completed workout
          dailyXP[date] += earnedXP;
          console.log(`Added ${earnedXP} XP for ${workoutName} on ${date} (${value} ${xpRate.unit}), total for day: ${dailyXP[date]}`);
        });
      });
      
      // Cap daily XP at 100 for each day
      Object.keys(dailyXP).forEach(date => {
        if (dailyXP[date] > 100) {
          console.log(`Capping XP for ${date} at 100 (was ${dailyXP[date]})`);
          dailyXP[date] = 100;
        }
        
        // Ensure XP is a number (convert any non-numeric values)
        if (typeof dailyXP[date] !== 'number') {
          console.log(`Converting non-numeric XP value for ${date}: ${dailyXP[date]} to 0`);
          dailyXP[date] = 0;
        }
      });
      
      // Calculate total XP by summing all daily XP
      const totalXP = Object.values(dailyXP).reduce((sum: number, xp: number) => {
        // Ensure we're only adding numbers
        return sum + (typeof xp === 'number' ? xp : 0);
      }, 0);
      
      console.log('Final dailyXP:', dailyXP);
      console.log(`Final totalXP: ${totalXP}`);
      
      // Only update if XP values have changed
      if (totalXP !== userData.totalXP || !isEqualDailyXP(dailyXP, userData.dailyXP)) {
        console.log(`Updating XP in database: Total XP ${userData.totalXP} -> ${totalXP}`);
        await updateDoc(userRef, {
          totalXP,
          dailyXP
        });
      } else {
        console.log("XP values unchanged, not updating database");
      }
      
      // Update xpCalc collection
      await updateXpCalcData(auth.currentUser.uid);

      return { totalXP, dailyXP };
    } catch (error) {
      console.error("Error calculating XP:", error);
      return { totalXP: userData.totalXP || 0, dailyXP: userData.dailyXP || {} };
    }
  };

  // Helper function to compare dailyXP objects
  const isEqualDailyXP = (obj1: Record<string, number> | undefined, obj2: Record<string, number> | undefined): boolean => {
    // If either object is undefined, they're different
    if (!obj1 || !obj2) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // If they have different number of dates, they're different
    if (keys1.length !== keys2.length) {
      console.log("dailyXP objects have different number of keys");
      return false;
    }
    
    // Check that all keys exist in both objects with the same values
    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
        console.log(`Difference in dailyXP for date ${key}: ${obj1[key]} vs ${obj2[key]}`);
        return false;
      }
    }
    
    // If we got here, the objects are identical
    return true;
  };

  const updateXPAfterWorkoutChange = async () => {
    if (!auth.currentUser) return;
    
    try {
      console.log("Updating XP after workout change...");
      
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const [progressDoc, userDoc] = await Promise.all([
        getDoc(progressRef),
        getDoc(userRef)
      ]);
      
      if (progressDoc.exists() && userDoc.exists()) {
        console.log("Found progress and user documents, recalculating XP...");
        const result = await recalculateAllXP(progressDoc.data(), userRef, userDoc.data());
        console.log(`XP recalculation complete. New total XP: ${result.totalXP}`);
      } else {
        console.log("Missing required documents for XP calculation");
      }
    } catch (error) {
      console.error('Error updating XP after workout change:', error);
    }
  };

  const handleUpdateProgress = async () => {
    if (!auth.currentUser || !stats || !editingWorkout || !progressValue) return;

    try {
      let value = parseFloat(progressValue);
      if (isNaN(value)) return;

      // Cap the value at targetValue if it exceeds it
      if (value > editingWorkout.targetValue) {
        value = editingWorkout.targetValue;
      }

      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      // Get reference to user's progress document
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      // Check if this update completes the workout
      const isCompleted = value >= editingWorkout.targetValue;
      
      // Create new progress entry
      const newProgress = {
        value: value,
        completed: isCompleted,
        timestamp,
        date: today,
        unit: editingWorkout.unit
      };
      
      // Update or create the progress document
      if (progressDoc.exists()) {
        await updateDoc(progressRef, {
          [`${editingWorkout.name}.${today}`]: newProgress
        });
      } else {
        await setDoc(progressRef, {
          [editingWorkout.name]: {
            [today]: newProgress
          }
        });
      }

      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reset state and reload data
      setShowEditModal(false);
      setProgressValue('');
      setEditingWorkout(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating progress:', error);
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
      // Calculate base XP from workout metrics
      xp = workout.currentValue * xpRate.xpPerUnit;
      
      // Calculate calories based on workout type and value
      let calories = 0;
      if (workout.unit === 'minutes') {
        if (workout.name.toLowerCase().includes('running')) {
          calories = Math.round(workout.currentValue * 10); // Higher intensity
        } else if (workout.name.toLowerCase().includes('cycling')) {
          calories = Math.round(workout.currentValue * 8);
        } else if (workout.name.toLowerCase().includes('walking')) {
          calories = Math.round(workout.currentValue * 5); // Lower intensity
        } else if (workout.name.toLowerCase().includes('strength') || 
                  workout.name.toLowerCase().includes('weight')) {
          calories = Math.round(workout.currentValue * 7);
        } else {
          calories = Math.round(workout.currentValue * 6); // Default for time-based
        }
      } else if (workout.unit === 'km') {
        if (workout.name.toLowerCase().includes('running')) {
          calories = Math.round(workout.currentValue * 70); // ~70 calories per km running
        } else if (workout.name.toLowerCase().includes('cycling')) {
          calories = Math.round(workout.currentValue * 40); // ~40 calories per km cycling
        } else if (workout.name.toLowerCase().includes('walking')) {
          calories = Math.round(workout.currentValue * 50); // ~50 calories per km walking
        } else {
          calories = Math.round(workout.currentValue * 60); // Default
        }
      } else if (workout.unit === 'reps') {
        calories = Math.round(workout.currentValue * 0.5); // Rep-based workouts
      }
      
      // Apply 0.1 multiplier to make XP progression harder
      xp = calories * 0.1;
    }
    
    return Math.floor(xp); // Round down to nearest integer
  };

  const updateUserXP = async (newXP: number) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error("User document not found");
        return;
      }
      
      const userData = userDoc.data();
      
      // Get the dailyXP map - it stores XP for all days
      const dailyXP = userData.dailyXP || {};
      let todayXP = dailyXP[today] || 0;
      
      console.log("Current daily XP for today:", todayXP);
      
      // Calculate how much more XP the user can earn today (cap at 100)
      const maxAdditionalXP = Math.max(0, 100 - todayXP);
      
      // Limit the new XP to the maximum allowed for today
      const limitedNewXP = Math.min(newXP, maxAdditionalXP);
      
      // If there's no more XP to be gained today, return early
      if (limitedNewXP <= 0) {
        console.log("Daily XP limit already reached, no additional XP awarded");
        setShowXPLimitToast(true);
        return;
      }
      
      // Update the dailyXP map for today
      const updatedDailyXP = {
        ...dailyXP,
        [today]: todayXP + limitedNewXP
      };
      
      // Calculate total XP as the sum of all daily XP values
      let totalXP = 0;
      Object.values(updatedDailyXP).forEach(xp => {
        totalXP += (typeof xp === 'number') ? xp : 0;
      });
      
      const levelData = calculateLevel(totalXP);

      // Update the user document with both daily and total XP
      await updateDoc(userRef, {
        totalXP: totalXP,
        dailyXP: updatedDailyXP
      });

      console.log(`XP updated: +${limitedNewXP} XP (daily total: ${updatedDailyXP[today]}/100, overall total: ${totalXP})`);

      // Update local state
      setStats(prev => prev ? {
        ...prev,
        stats: {
          totalXP: totalXP,
          ...levelData,
        },
      } : null);
      
      // If the user hit their daily limit, provide feedback
      if (updatedDailyXP[today] >= 100) {
        console.log("Daily XP limit of 100 reached!");
        setShowXPLimitToast(true);
      }

      // Update xpCalc collection
    } catch (error) {
      console.error('Error updating user XP:', error);
    }
  };

  const handleCompleteWorkout = async (workout: WorkoutProgress) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log(`Completing workout: ${workout.name} for today (${today})`);
      
      // Get reference to user's progress document
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      // Create new progress entry for completion
      const newProgress = {
        value: workout.targetValue,
        completed: true,
        timestamp,
        date: today,
        unit: workout.unit // Store the unit for accurate XP calculation
      };
      
      // Update or create the progress document
      if (progressDoc.exists()) {
        // Update the specific workout's progress
        await updateDoc(progressRef, {
          [`${workout.name}.${today}`]: newProgress
        });
        console.log(`Updated progress for ${workout.name} to completed with value ${workout.targetValue} ${workout.unit}`);
      } else {
        // Create new document with initial progress
        await setDoc(progressRef, {
          [workout.name]: {
            [today]: newProgress
          }
        });
        console.log(`Created new progress document for ${workout.name}`);
      }

      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleResetWorkout = async (workout: WorkoutProgress) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log("Resetting workout:", workout.name, "Completed status:", workout.completed, "Date:", workout.date);
      
      // Get reference to user's progress document and user document
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      
      // Only reset workouts from today
      if (workout.date !== today) {
        console.log(`Cannot reset workout from ${workout.date} - only today's workouts can be reset`);
        return;
      }
      
      // Create new progress entry with reset values
      const resetProgress = {
        value: 0,
        completed: false,
        timestamp,
        date: today,
        unit: workout.unit
      };
      
      // Update progress document
      await updateDoc(progressRef, {
        [`${workout.name}.${today}`]: resetProgress
      });
      
      console.log(`Reset workout: ${workout.name} completed status to false`);
      
      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error resetting workout:', error);
    }
  };

  const handleCompleteAllWorkouts = async () => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log("Starting complete all workouts process for today:", today);
      
      // Get progress document reference
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      // Prepare batch updates for progress document
      const progressUpdates: Record<string, any> = {};
      
      // Mark each workout as completed with target value
      stats.dailyWorkouts.forEach(workout => {
        // Create completed entry for this workout
        const newProgress = {
          value: workout.targetValue,
          completed: true,
          timestamp,
          date: today,
          unit: workout.unit
        };
        
        // Add to updates
        progressUpdates[`${workout.name}.${today}`] = newProgress;
        console.log(`Marking ${workout.name} as completed with value ${workout.targetValue} ${workout.unit}`);
      });
      
      // Update or create the progress document
      if (progressDoc.exists()) {
        await updateDoc(progressRef, progressUpdates);
      } else {
        // Build document structure if it doesn't exist
        const initialData: Record<string, any> = {};
        
        stats.dailyWorkouts.forEach(workout => {
          initialData[workout.name] = {
            [today]: {
              value: workout.targetValue,
              completed: true,
              timestamp,
              date: today,
              unit: workout.unit
            }
          };
        });
        
        await setDoc(progressRef, initialData);
      }
      
      console.log("All workouts marked as completed");
      
      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reload dashboard data
      await loadDashboardData();
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

  const renderXPLimitToast = () => {
    if (!showXPLimitToast) return null;
    
    return (
      <Animated.View style={[styles.toastContainer, { opacity: xpLimitToastOpacity }]}>
        <View style={[styles.toast, { backgroundColor: currentTheme.colors.accent }]}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
          <Text style={styles.toastText}>Daily XP limit reached! Come back tomorrow for more.</Text>
        </View>
      </Animated.View>
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

  const handleRemoveAdditionalWorkout = async (workout: WorkoutProgress) => {
    if (!auth.currentUser || !stats) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log("Removing additional workout:", workout.name, "Date:", workout.date);
      
      // Get reference to user's progress document
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        console.log("Progress document doesn't exist");
        return;
      }
      
      const progressData = progressDoc.data();
      
      // Check if this workout exists in progress
      if (!progressData[workout.name] || !progressData[workout.name][today]) {
        console.log("Workout not found in progress data");
        return;
      }
      
      // Create updated progress data without this workout for today
      const updatedWorkoutData = { ...progressData[workout.name] };
      delete updatedWorkoutData[today];
      
      // If there are no more dates for this workout, remove the entire workout
      if (Object.keys(updatedWorkoutData).length === 0) {
        const updatedProgressData = { ...progressData };
        delete updatedProgressData[workout.name];
        await setDoc(progressRef, updatedProgressData);
      } else {
        // Otherwise, just update this workout's data
        await updateDoc(progressRef, {
          [`${workout.name}`]: updatedWorkoutData
        });
      }
      
      console.log(`Removed additional workout: ${workout.name}`);
      
      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error removing additional workout:', error);
    }
  };

  const handleAddAdditionalWorkout = async () => {
    if (!auth.currentUser || !stats || !additionalWorkoutValue || !additionalWorkoutType) return;

    try {
      const value = parseFloat(additionalWorkoutValue);
      if (isNaN(value) || value <= 0) {
        console.log("Invalid workout value");
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log(`Adding additional workout: ${additionalWorkoutType} with value ${value} ${additionalWorkoutUnit}`);
      
      // Get reference to user's progress document
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      // Create new progress entry
      const newProgress = {
        value: value,
        completed: true,  // Additional workouts are always completed
        timestamp,
        date: today,
        unit: additionalWorkoutUnit,
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

      console.log(`Added additional workout: ${additionalWorkoutType}`);
      
      // Recalculate XP after workout change
      await updateXPAfterWorkoutChange();
      
      // Reset state and reload data
      setShowAddWorkoutModal(false);
      setAdditionalWorkoutValue('');
      await loadDashboardData();
    } catch (error) {
      console.error('Error adding additional workout:', error);
    }
  };

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

  const renderAdditionalWorkouts = () => {
    if (!stats || !stats.additionalWorkouts || stats.additionalWorkouts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No additional workouts recorded today</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.workoutsList}>
        {stats.additionalWorkouts.map((workout) => (
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
                <ThemedText style={[styles.additionalWorkoutValue, { color: currentTheme.colors.accent }]}>
                  {workout.currentValue} {workout.unit}
                </ThemedText>
              </View>
            </View>
            <View style={styles.workoutRight}>
              <TouchableOpacity
                onPress={() => handleRemoveAdditionalWorkout(workout)}
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
                modalStyles.pickerItem,
                additionalWorkoutType === option.name && {
                  backgroundColor: currentTheme.colors.accent,
                },
              ]}
              onPress={() => {
                setAdditionalWorkoutType(option.name);
                const defaultUnit = getUnitForWorkoutType(option.name);
                setAdditionalWorkoutUnit(defaultUnit);
              }}
            >
              <Text
                style={[
                  modalStyles.pickerItemText,
                  additionalWorkoutType === option.name && { color: '#fff' },
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

  // Update modal styles with improvements for the workout type picker
  const modalStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center' as const,
      padding: 20,
    },
    modalContent: {
      width: '90%' as const,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.accent,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: currentTheme.colors.text,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      borderColor: currentTheme.colors.accent,
    },
    picker: {
      flexDirection: 'row' as const,
      marginBottom: 16,
    },
    pickerItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginRight: 4,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.accent,
    },
    pickerItemText: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: currentTheme.colors.text,
    },
    modalButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'flex-end',
      gap: 12,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center' as const,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600' as const,
      fontSize: 16,
    },
  });

  const cleanupIncompleteWorkouts = async () => {
    if (!auth.currentUser) return;

    try {
      const progressRef = doc(db, 'daily_workout_progress', auth.currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check each workout's progress
        const updatedData: { [key: string]: any } = {};
        let hasChanges = false;
        
        Object.entries(data).forEach(([workoutName, workoutData]: [string, any]) => {
          const filteredDates: { [key: string]: any } = {};
          
          Object.entries(workoutData).forEach(([date, progress]: [string, any]) => {
            // Keep the progress if:
            // 1. It's not from yesterday or before, or
            // 2. It has a value greater than 0 or is marked as completed
            if (
              date > yesterdayStr || 
              (progress.value > 0 || progress.completed)
            ) {
              filteredDates[date] = progress;
            } else {
              hasChanges = true;
            }
          });
          
          if (Object.keys(filteredDates).length > 0) {
            updatedData[workoutName] = filteredDates;
          } else {
            hasChanges = true;
          }
        });
        
        // Only update if we removed any data
        if (hasChanges) {
          await setDoc(progressRef, updatedData);
        }
      }
    } catch (error) {
      console.error('Error cleaning up incomplete workouts:', error);
    }
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={currentTheme.colors.accent} />
          <ThemedText style={{ marginTop: 16, fontSize: 16 }}>Loading dashboard...</ThemedText>
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
      {renderXPLimitToast()}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
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
              nestedScrollEnabled={true}
            >
              {renderDailyWorkouts()}
            </ScrollView>
          </View>

          {/* Additional Workouts */}
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
          </View>
      </ThemedView>
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
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>
              Update {editingWorkout?.name} Progress
            </Text>
            <TextInput
              style={modalStyles.input}
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
              placeholder={`Enter value in ${editingWorkout?.unit}`}
              placeholderTextColor={`${currentTheme.colors.text}50`}
            />
            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.button, { backgroundColor: currentTheme.colors.error }]}
                onPress={() => {
                  setShowEditModal(false);
                  setProgressValue('');
                  setEditingWorkout(null);
                }}
              >
                <Text style={modalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, { backgroundColor: currentTheme.colors.accent }]}
                onPress={handleUpdateProgress}
              >
                <Text style={modalStyles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>
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
              style={[modalStyles.input, { fontSize: 18 }]}
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
                {getAvailableUnitsForWorkoutType(additionalWorkoutType).map((unit) => (
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
            
            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.button, { backgroundColor: currentTheme.colors.error }]}
                onPress={() => {
                  setShowAddWorkoutModal(false);
                  setAdditionalWorkoutValue('');
                }}
              >
                <Text style={modalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, { backgroundColor: currentTheme.colors.accent }]}
                onPress={handleAddAdditionalWorkout}
              >
                <Text style={modalStyles.buttonText}>Add</Text>
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
    marginBottom: 12,
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
  mainScrollView: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    flexShrink: 1,
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
  additionalWorkoutValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  additionalWorkoutsScrollView: {
    height: 200, // Fixed height to show approximately 2 workouts
  },
});
