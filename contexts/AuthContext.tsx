import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, saveAuthToken, saveUserData, clearAuthData } from '@/utils/authService';

// Keys for AsyncStorage
const AUTH_STATE_KEY = 'auth_state';

// Define the context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth state on app startup
  useEffect(() => {
    const checkPersistedAuthState = async () => {
      try {
        // Check for token in AsyncStorage
        const token = await getAuthToken();
        const authStateData = await AsyncStorage.getItem(AUTH_STATE_KEY);
        
        // If we have auth data but Firebase auth state is empty,
        // we need to recover from the persisted state
        if (token && authStateData && !auth.currentUser) {
          console.log('Restoring auth state from persistent storage');
          // Wait for Firebase to initialize
          // The listener below will handle the user setting
        }
      } catch (err) {
        console.error('Error checking persisted auth state:', err);
      }
    };

    checkPersistedAuthState();
    
    // Set up a listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in
        setUser(authUser);
        
        // Persist auth state
        try {
          const token = await authUser.getIdToken();
          await saveAuthToken(token);
          
          // Save basic user data
          const userData = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          };
          await saveUserData(userData);
          
          // Save auth state flag
          await AsyncStorage.setItem(AUTH_STATE_KEY, 'true');
        } catch (err) {
          console.error('Error persisting auth state:', err);
        }
      } else {
        // User is signed out
        setUser(null);
        
        // Clear persisted auth state
        try {
          await clearAuthData();
          await AsyncStorage.removeItem(AUTH_STATE_KEY);
        } catch (err) {
          console.error('Error clearing persisted auth state:', err);
        }
      }
      
      // Auth initialization is complete
      setIsInitializing(false);
    });
    
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  // Signup function
  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      await clearAuthData();
      await AsyncStorage.removeItem(AUTH_STATE_KEY);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    signup,
    logout,
    error,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 