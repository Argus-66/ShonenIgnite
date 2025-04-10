import { auth, db } from '@/config/firebase';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { availableThemes } from './profileImages';

/**
 * Update a user's theme in both the users and xpCalc collections
 * @param themeName The name of the theme to set
 * @returns A promise that resolves when the theme is updated
 */
export const updateUserTheme = async (themeName: string): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is signed in');
      return false;
    }

    // Validate theme name
    if (!availableThemes.includes(themeName)) {
      console.error(`Invalid theme name: ${themeName}. Available themes: ${availableThemes.join(', ')}`);
      return false;
    }

    const userId = currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const xpCalcRef = doc(db, 'xpCalc', userId);

    // Update user document
    await updateDoc(userRef, {
      theme: themeName,
      lastUpdated: serverTimestamp()
    });

    // Check if xpCalc document exists
    const xpCalcDoc = await getDoc(xpCalcRef);
    
    if (xpCalcDoc.exists()) {
      // Update xpCalc document if it exists
      await updateDoc(xpCalcRef, {
        theme: themeName,
        lastUpdated: serverTimestamp()
      });
    } else {
      // Get user data to create xpCalc document
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData) {
        console.error('User data not found');
        return false;
      }
      
      // Create xpCalc document with basic user data
      await setDoc(xpCalcRef, {
        username: userData.username || 'User',
        theme: themeName,
        totalXP: userData.totalXP || 0,
        level: userData.level || 1,
        country: userData.location?.country || 'Unknown',
        continent: userData.location?.continent || 'Unknown',
        lastUpdated: serverTimestamp()
      });
    }

    console.log(`Theme updated to "${themeName}" for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating user theme:', error);
    return false;
  }
};

/**
 * Get a user's current theme
 * @param userId Optional user ID (defaults to current user)
 * @returns The user's current theme name
 */
export const getUserTheme = async (userId?: string): Promise<string> => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      console.error('No user ID provided and no user is signed in');
      return 'Dragon Ball'; // Default theme
    }
    
    // Try to get from xpCalc first (most likely to be up to date)
    const xpCalcRef = doc(db, 'xpCalc', uid);
    const xpCalcDoc = await getDoc(xpCalcRef);
    
    if (xpCalcDoc.exists() && xpCalcDoc.data().theme) {
      return xpCalcDoc.data().theme;
    }
    
    // Fall back to user document
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().theme) {
      return userDoc.data().theme;
    }
    
    // Default theme if none is set
    return 'Dragon Ball';
  } catch (error) {
    console.error('Error getting user theme:', error);
    return 'Dragon Ball'; // Default theme
  }
}; 