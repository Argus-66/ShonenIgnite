import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { router } from 'expo-router';

// Keys for AsyncStorage
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Save authentication token to AsyncStorage
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

/**
 * Get authentication token from AsyncStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Save user data to AsyncStorage
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Get user data from AsyncStorage
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clear authentication data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Handle user logout
 */
export const handleLogout = async (): Promise<void> => {
  try {
    await signOut(auth);
    await clearAuthData();
    router.replace('/');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

/**
 * Set up authentication state listener
 * This should be called when the app starts
 */
export const setupAuthListener = (): (() => void) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // User is signed in
      const token = await user.getIdToken();
      await saveAuthToken(token);
      
      // Save basic user data
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      await saveUserData(userData);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } else {
      // User is signed out
      await clearAuthData();
      router.replace('/');
    }
  });
}; 