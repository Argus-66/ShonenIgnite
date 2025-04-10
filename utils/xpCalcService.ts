import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';

interface XpCalcData {
  totalXP: number;
  monthlyXP: number;
  weeklyXP: number;
  dailyXP: number;
  lat: number | null;
  long: number | null;
  continent: string;
  country: string;
  theme: string;
  lastUpdated: any;
}

/**
 * Get country and continent from coordinates using reverse geocoding
 */
const getLocationInfo = async (lat: number, long: number) => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
    );
    const data = await response.json();
    return {
      country: data.countryName || 'Unknown',
      continent: data.continent || 'Unknown'
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    return { country: 'Unknown', continent: 'Unknown' };
  }
};

/**
 * Get the start and end dates for the current week (Sunday to Saturday)
 */
const getCurrentWeekBoundaries = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Get the date of last Sunday (start of week)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get the date of next Saturday (end of week)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * Get the start and end dates for the current month
 */
const getCurrentMonthBoundaries = () => {
  const now = new Date();
  
  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  // End of month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  return { startOfMonth, endOfMonth };
};

/**
 * Updates the xpCalc collection with the latest user data
 * This should be called whenever a user's XP or location changes
 */
export const updateXpCalcData = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Get user data from users collection
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error('User document not found:', userId);
      return;
    }
    
    const userData = userSnap.data();
    
    // Get current xpCalc data if it exists
    const xpCalcRef = doc(db, 'xpCalc', userId);
    const xpCalcSnap = await getDoc(xpCalcRef);
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate daily XP (only from today)
    const dailyXP = userData.dailyXP?.[todayStr] || 0;
    
    // Get week boundaries
    const { startOfWeek, endOfWeek } = getCurrentWeekBoundaries();
    
    // Calculate weekly XP (Sunday to Saturday)
    const weeklyXP = userData.dailyXP ? 
      Object.entries(userData.dailyXP)
        .filter(([date]) => {
          const xpDate = new Date(date);
          return xpDate >= startOfWeek && xpDate <= endOfWeek;
        })
        .reduce((sum, [_, xp]) => sum + (xp as number), 0) : 0;
    
    // Get month boundaries
    const { startOfMonth, endOfMonth } = getCurrentMonthBoundaries();
    
    // Calculate monthly XP (1st to end of month)
    const monthlyXP = userData.dailyXP ? 
      Object.entries(userData.dailyXP)
        .filter(([date]) => {
          const xpDate = new Date(date);
          return xpDate >= startOfMonth && xpDate <= endOfMonth;
        })
        .reduce((sum, [_, xp]) => sum + (xp as number), 0) : 0;
    
    // Get location data
    let locationInfo = { country: 'Unknown', continent: 'Unknown' };
    const lat = userData.location?.latitude || userData.location?.lat;
    const long = userData.location?.longitude || userData.location?.long;
    
    if (lat && long) {
      locationInfo = await getLocationInfo(lat, long);
    }
    
    // Get user theme
    const theme = userData.theme || 'default';
    
    // Prepare data for xpCalc collection
    const xpCalcData: XpCalcData = {
      totalXP: userData.totalXP || 0,
      monthlyXP,
      weeklyXP,
      dailyXP,
      lat: lat || null,
      long: long || null,
      continent: locationInfo.continent,
      country: locationInfo.country,
      theme,
      lastUpdated: serverTimestamp()
    };
    
    // Update or create the xpCalc document
    if (xpCalcSnap.exists()) {
      await updateDoc(xpCalcRef, xpCalcData);
    } else {
      await setDoc(xpCalcRef, xpCalcData);
    }
    
    console.log('xpCalc data updated for user:', userId);
  } catch (error) {
    console.error('Error updating xpCalc data:', error);
  }
};

/**
 * Updates the xpCalc collection for the current user
 */
export const updateCurrentUserXpCalc = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  
  await updateXpCalcData(currentUser.uid);
};

/**
 * Updates the xpCalc collection for all users
 * This should be called periodically (e.g., daily) to ensure data consistency
 */
export const updateAllUsersXpCalc = async () => {
  try {
    // This would typically be a Cloud Function that runs on a schedule
    // For now, we'll just update the current user
    await updateCurrentUserXpCalc();
  } catch (error) {
    console.error('Error updating all users xpCalc data:', error);
  }
}; 