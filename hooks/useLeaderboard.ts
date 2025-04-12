import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, where, getDoc, doc, startAfter, endAt, updateDoc, serverTimestamp, Timestamp, CollectionReference, DocumentData, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { LeaderboardUser } from '@/components/leaderboard/LeaderboardItem';
import { calculateDistance } from '@/utils/locationService';
import { LEVEL_THRESHOLDS, calculateLevel } from '@/types/workout';
import * as firebase from 'firebase/app';
import { getProfileImageByThemeSync } from '@/utils/profileImages';

// Ranking levels
export type RankingLevel = 'global' | 'continental' | 'country' | 'regional' | 'followers';

// Time periods for rankings
export type TimePeriod = 'overall' | 'monthly' | 'weekly' | 'daily';

// Mock user profile images
const mockProfileImages = [
  'https://robohash.org/1?set=set4',
  'https://robohash.org/2?set=set4',
  'https://robohash.org/3?set=set4',
  'https://robohash.org/4?set=set4',
  'https://robohash.org/5?set=set4',
  'https://robohash.org/6?set=set4',
  'https://robohash.org/7?set=set4',
  'https://robohash.org/8?set=set4',
  'https://robohash.org/9?set=set4',
  'https://robohash.org/10?set=set4'
];

// Mock user data to ensure we have something to display
const generateMockUsers = (count: number, rankingLevel: RankingLevel): LeaderboardUser[] => {
  const users: LeaderboardUser[] = [];
  
  // Names based on ranking level
  const namePrefix = 
    rankingLevel === 'global' ? 'Global Player' :
    rankingLevel === 'continental' ? 'Continental Player' :
    rankingLevel === 'country' ? 'Country Player' :
    rankingLevel === 'regional' ? 'Regional Player' : 'Friend';
  
  for (let i = 0; i < count; i++) {
    const level = Math.floor(Math.random() * 50) + 1;
    const xpMultiplier = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
    const xp = Math.floor((10000 - (i * 100)) * xpMultiplier);
    const currentXp = Math.floor(Math.random() * 100);
    
    users.push({
      id: `mock-user-${i}`,
      username: `${namePrefix} ${i + 1}`,
      profileImage: mockProfileImages[i % mockProfileImages.length],
      level,
      xp,
      rank: i + 1,
      currentXp,
      xpForNextLevel: 100,
      isFollowed: Math.random() > 0.7, // 30% chance of being followed
      distance: rankingLevel === 'regional' ? Math.random() * 50 : undefined
    });
  }
  
  return users;
};

// Helper function to process numeric fields that might be stored as strings
const processNumericField = (value: any): number => {
  if (value === undefined || value === null) return 0;
  return typeof value === 'string' ? parseInt(value, 10) : Number(value);
};

// Update the LeaderboardUser type to include lastActive
interface ExtendedLeaderboardUser extends LeaderboardUser {
  lastActive?: Date | string | number;
}

// Helper function to filter users based on selected time period
const filterUsersByTimePeriod = (users: ExtendedLeaderboardUser[], timePeriod: string): ExtendedLeaderboardUser[] => {
  if (timePeriod === 'all-time') {
    return users; // Return all users
  }

  const now = new Date();
  let startDate: Date;

  switch (timePeriod) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      // Get the start of the current week (Sunday)
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      return users; // Default to all users
  }

  return users.filter(user => {
    // If the user has a lastActive timestamp, check if it's after the start date
    if (user.lastActive) {
      const lastActiveDate = user.lastActive instanceof Date 
        ? user.lastActive 
        : new Date(user.lastActive);
      return lastActiveDate >= startDate;
    }
    return false; // If no lastActive timestamp, exclude the user
  });
};

// Helper function for local level calculation based on XP
function calculateLevelInternal(xp: number): number {
  // Simple level calculation: 1 level per 100 XP
  return Math.floor(xp / 100) + 1;
}

// Add proper type for user data returned from Firestore
interface XpCalcUser {
  id: string;
  totalXP?: number;
  dailyXP?: number;
  weeklyXP?: number;
  monthlyXP?: number;
  continent?: string;
  country?: string;
  lat?: number;
  long?: number;
  theme?: string;
  [key: string]: any; // Allow for other fields
}

// Helper function to process a user for the leaderboard
async function processUserForLeaderboard(
  userId: string,
  rank: number,
  xpCalcData: XpCalcUser,
  userData: any,
  timePeriod: TimePeriod,
  followingList: string[] = []
): Promise<LeaderboardUser | null> {
  try {
    // Calculate level based on the proper level thresholds
    let level = 1;
    let currentLevelXP = 0;
    let xpForNextLevel = 100; // Default for level 1 to 2
    
    const totalXP = xpCalcData.totalXP || 0;
    
    // Calculate the level, current level XP, and XP for next level
    for (let lvl = 1; lvl < LEVEL_THRESHOLDS.length; lvl++) {
      if (totalXP >= LEVEL_THRESHOLDS[lvl]) {
        level = lvl + 1;
      } else {
        currentLevelXP = totalXP - LEVEL_THRESHOLDS[lvl - 1];
        xpForNextLevel = LEVEL_THRESHOLDS[lvl] - LEVEL_THRESHOLDS[lvl - 1];
        break;
      }
    }
    
    // If at max level
    if (level === LEVEL_THRESHOLDS.length) {
      currentLevelXP = 0;
      xpForNextLevel = 0;
    }
    
    // Determine which XP field to use based on time period
    let xpField: string;
    switch (timePeriod) {
      case 'daily':
        xpField = 'dailyXP';
        break;
      case 'weekly':
        xpField = 'weeklyXP';
        break;
      case 'monthly':
        xpField = 'monthlyXP';
        break;
      case 'overall':
      default:
        xpField = 'totalXP';
        break;
    }
    
    // Get profile image based on user theme
    let profileImage;
    
    // First check if the xpCalc document has the theme
    if (xpCalcData.theme) {
      try {
        // Use the sync version for immediate results
        profileImage = getProfileImageByThemeSync(xpCalcData.theme);
      } catch (error) {
        // Fallback to user data or mock
        profileImage = userData.profileImage || mockProfileImages[rank % mockProfileImages.length];
      }
    } 
    // If no theme in xpCalc, check user data
    else if (userData.theme) {
      try {
        // Use the sync version for immediate results
        profileImage = getProfileImageByThemeSync(userData.theme);
      } catch (error) {
        profileImage = userData.profileImage || mockProfileImages[rank % mockProfileImages.length];
      }
    } 
    // Last resort - use profile image or mock
    else {
      profileImage = userData.profileImage || mockProfileImages[rank % mockProfileImages.length];
    }
    
    // Get profile image and theme
    let theme = xpCalcData.theme || userData.theme || 'Dragon Ball';
    
    // Create the leaderboard user object
    return {
      id: userId,
      username: userData.username || 'Anonymous',
      profileImage: profileImage,
      level,
      xp: xpCalcData[xpField] || 0,
      rank,
      currentXp: currentLevelXP,
      xpForNextLevel,
      isFollowed: (followingList || []).includes(userId),
      theme: theme,
    };
  } catch (error) {
    console.error('Error processing user for leaderboard:', error);
    return null;
  }
}

export default function useLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{country: string, continent: string, region: string} | null>(null);
  const [currentRankingLevel, setCurrentRankingLevel] = useState<RankingLevel>('global');
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>('overall');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser.uid);
      fetchUserLocation();
    } else {
      // Only use mock data if not logged in
      setUseMockData(true);
    }
  }, []);

  const fetchUserLocation = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userXpCalcRef = doc(db, 'xpCalc', auth.currentUser.uid);
      const userXpCalcSnap = await getDoc(userXpCalcRef);
      
      if (userXpCalcSnap.exists()) {
        const xpCalcData = userXpCalcSnap.data();
        if (xpCalcData.lat && xpCalcData.long) {
          setHasLocationPermission(true);
        }
        
        setCurrentUserLocation({
          country: xpCalcData.country || 'Unknown',
          continent: xpCalcData.continent || 'Unknown',
          region: 'Unknown' // xpCalc doesn't store region
        });
        setSelectedCountry(xpCalcData.country);
        setSelectedContinent(xpCalcData.continent);
      } else {
        console.warn('User xpCalc data not found, checking users collection');
        
        // Fallback to user data if xpCalc doesn't exist
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.location) {
            if (userData.location.lat && userData.location.long) {
              setHasLocationPermission(true);
            }
            
            setCurrentUserLocation({
              country: userData.location.country || 'Unknown',
              continent: userData.location.continent || 'Unknown',
              region: userData.location.region || 'Unknown'
            });
            setSelectedCountry(userData.location.country);
            setSelectedContinent(userData.location.continent);
          } else {
            // If user has no location, set defaults
            setSelectedCountry('United States');
            setSelectedContinent('North America');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Set defaults on error
      setSelectedCountry('United States');
      setSelectedContinent('North America');
    }
  };

  const getTimestampRange = useCallback((period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'daily':
        return {
          start: today.getTime(),
          end: now.getTime()
        };
      case 'weekly':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        return {
          start: startOfWeek.getTime(),
          end: now.getTime()
        };
      case 'monthly':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth.getTime(),
          end: now.getTime()
        };
      case 'overall':
      default:
        return {
          start: 0, // Beginning of time
          end: now.getTime()
        };
    }
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setUsers([]);
    setNoUsersFound(false);
    
    try {
      if (useMockData) {
        const mockUsers = generateMockUsers(100, currentRankingLevel);
        setUsers(mockUsers);
        setLoading(false);
        return;
      }

      // Check if regional is selected but no location permission
      if (currentRankingLevel === 'regional' && !hasLocationPermission) {
        setLoading(false);
        setError('Location permission is needed for regional rankings');
        return;
      }

      // Use the xpCalc collection for all leaderboard data
      const xpCalcCollection = collection(db, 'xpCalc') as CollectionReference<DocumentData>;
      let xpCalcQuery;
      
      // Only apply filters when not fetching followers or viewing global leaderboard
      if (currentRankingLevel !== 'followers' && currentRankingLevel !== 'global') {
        if (!currentUserLocation) {
          console.log('User location not available for regional filtering');
          setLoading(false);
          setError('Location information not available');
          return;
        }
        
        // Apply geographical filters based on ranking level
        if (currentRankingLevel === 'continental') {
          const continent = selectedContinent || currentUserLocation.continent;
          if (continent === 'Unknown') {
            setLoading(false);
            setError('Continent information not available');
            return;
          }
          
          // First create a query without ordering
          const baseQuery = query(xpCalcCollection, where('continent', '==', continent));
          
          // Get all documents matching the continent filter
          const continentSnapshot = await getDocs(baseQuery);
          
          if (continentSnapshot.empty) {
            setLoading(false);
            setNoUsersFound(true);
            setError(`No users found in ${continent}`);
            return;
          }
          
          // Manually process the data instead of relying on Firestore ordering
          const continentUsers = continentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as XpCalcUser[];
          
          // Sort manually by totalXP
          const sortedUsers = continentUsers.sort((a, b) => {
            const aXP = a.totalXP || 0;
            const bXP = b.totalXP || 0;
            return bXP - aXP;
          });
          
          // Take only the top 100
          const topUsers = sortedUsers.slice(0, 100);
          
          // Convert to LeaderboardUser objects directly
          let leaderboardUsers: LeaderboardUser[] = [];
          
          // Process each user
          for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const userId = userData.id;
            
            // Get user profile data
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              continue;
            }
            
            const userProfileData = userSnap.data() || {};
            
            // Process user data and add to leaderboard
            const processedUser = await processUserForLeaderboard(
              userId, 
              i + 1, 
              userData, 
              userProfileData, 
              currentTimePeriod,
              followingList
            );
            
            if (processedUser) {
              leaderboardUsers.push(processedUser);
            }
          }
          
          setUsers(leaderboardUsers);
          setLoading(false);
          return;
        } else if (currentRankingLevel === 'country') {
          const country = selectedCountry || currentUserLocation.country;
          if (country === 'Unknown') {
            setLoading(false);
            setError('Country information not available');
            return;
          }
          
          // First create a query without ordering
          const baseQuery = query(xpCalcCollection, where('country', '==', country));
          
          // Get all documents matching the country filter
          const countrySnapshot = await getDocs(baseQuery);
          
          if (countrySnapshot.empty) {
            setLoading(false);
            setNoUsersFound(true);
            setError(`No users found in ${country}`);
            return;
          }
          
          // Manually process the data instead of relying on Firestore ordering
          const countryUsers = countrySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as XpCalcUser[];
          
          // Sort manually by totalXP
          const sortedUsers = countryUsers.sort((a, b) => {
            const aXP = a.totalXP || 0;
            const bXP = b.totalXP || 0;
            return bXP - aXP;
          });
          
          // Take only the top 100
          const topUsers = sortedUsers.slice(0, 100);
          
          // Convert to LeaderboardUser objects directly
          let leaderboardUsers: LeaderboardUser[] = [];
          
          // Process each user
          for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const userId = userData.id;
            
            // Get user profile data
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              continue;
            }
            
            const userProfileData = userSnap.data() || {};
            
            // Process user data and add to leaderboard
            const processedUser = await processUserForLeaderboard(
              userId, 
              i + 1, 
              userData, 
              userProfileData, 
              currentTimePeriod,
              followingList
            );
            
            if (processedUser) {
              leaderboardUsers.push(processedUser);
            }
          }
          
          setUsers(leaderboardUsers);
          setLoading(false);
          return;
        } else {
          // For regional, we'll fetch all and filter by distance later
          xpCalcQuery = query(xpCalcCollection);
        }
      } else if (currentRankingLevel === 'followers') {
        // For followers, we need to fetch the users that the current user follows
        if (!auth.currentUser) {
          setLoading(false);
          setError('You must be logged in to view followers');
          return;
        }
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          setError('User profile not found');
          return;
        }
        
        const userData = userDoc.data();
        const following = userData?.following || [];
        setFollowingList(following);
        
        if (following.length === 0) {
          setLoading(false);
          setNoUsersFound(true);
          setError('You are not following anyone yet');
          return;
        }
        
        // We can only filter with 'in' on up to 10 values
        // For more, we'll need to do multiple queries or filter in memory
        if (following.length <= 10) {
          xpCalcQuery = query(xpCalcCollection, where('__name__', 'in', following));
        } else {
          xpCalcQuery = query(xpCalcCollection);
        }
      } else {
        // Global ranking - no filters
        xpCalcQuery = query(xpCalcCollection);
      }

      // Determine which XP field to sort by based on time period
      let xpField: string;
      switch (currentTimePeriod) {
        case 'daily':
          xpField = 'dailyXP';
          break;
        case 'weekly':
          xpField = 'weeklyXP';
          break;
        case 'monthly':
          xpField = 'monthlyXP';
          break;
        case 'overall':
        default:
          xpField = 'totalXP';
          break;
      }

      // Add ordering and limit to the query - always sort by totalXP for consistent ranking
      xpCalcQuery = query(xpCalcQuery, orderBy('totalXP', 'desc'), limit(100));
      
      // Execute the query
      const snapshot = await getDocs(xpCalcQuery);
      
      if (snapshot.empty) {
        console.log(`No users found for ${currentRankingLevel} ranking`);
        setLoading(false);
        setNoUsersFound(true);
        
        let errorMessage = '';
        const rankingLevel = currentRankingLevel as RankingLevel;
        switch (rankingLevel) {
          case 'global':
            errorMessage = 'No users found in the global rankings';
            break;
          case 'continental':
            errorMessage = `No users found in ${selectedContinent || currentUserLocation?.continent || 'your continent'}`;
            break;
          case 'country':
            errorMessage = `No users found in ${selectedCountry || currentUserLocation?.country || 'your country'}`;
            break;
          case 'regional':
            errorMessage = 'No users found in your region (100km radius)';
            break;
          case 'followers':
            errorMessage = 'You are not following anyone yet';
            break;
        }
        
        setError(errorMessage);
        return;
      }
      
      // Process results
      let leaderboardUsers: LeaderboardUser[] = [];
      
      // Map the xpCalc data to LeaderboardUser
      for (let i = 0; i < snapshot.docs.length; i++) {
        const docSnapshot = snapshot.docs[i];
        const docId = docSnapshot.id;
        const xpCalcData = docSnapshot.data();
        
        // Skip this user if we're looking at followers and they're not in the following list
        if (currentRankingLevel === 'followers' && followingList.length > 10 && !followingList.includes(docId)) {
          continue;
        }
        
        // Get user profile data
        const userRef = doc(db, 'users', docId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          continue;
        }
        
        const userData = userSnap.data() || {};
        
        // Calculate level based on the proper level thresholds
        let level = 1;
        let currentLevelXP = 0;
        let xpForNextLevel = 100; // Default for level 1 to 2
        
        const totalXP = xpCalcData.totalXP || 0;
        
        // Calculate the level, current level XP, and XP for next level
        for (let lvl = 1; lvl < LEVEL_THRESHOLDS.length; lvl++) {
          if (totalXP >= LEVEL_THRESHOLDS[lvl]) {
            level = lvl + 1;
          } else {
            currentLevelXP = totalXP - LEVEL_THRESHOLDS[lvl - 1];
            xpForNextLevel = LEVEL_THRESHOLDS[lvl] - LEVEL_THRESHOLDS[lvl - 1];
            break;
          }
        }
        
        // If at max level
        if (level === LEVEL_THRESHOLDS.length) {
          currentLevelXP = 0;
          xpForNextLevel = 0;
        }
        
        // Add distance for regional rankings
        let distance: number | undefined = undefined;
        
        if (currentRankingLevel === 'regional' && 
            currentUserLocation && 
            xpCalcData.lat && 
            xpCalcData.long) {
          // Get the user's xpCalc data for coordinates
          const userXpCalcRef = doc(db, 'xpCalc', auth.currentUser?.uid || '');
          const userXpCalcSnap = await getDoc(userXpCalcRef);
          
          if (userXpCalcSnap.exists()) {
            const userXpCalcData = userXpCalcSnap.data();
            
            if (userXpCalcData && userXpCalcData.lat && userXpCalcData.long) {
              distance = calculateDistance(
                userXpCalcData.lat as number,
                userXpCalcData.long as number,
                xpCalcData.lat,
                xpCalcData.long
              );
            }
          }
        }
        
        // Get profile image based on user theme
        let profileImage;
        
        // First check if the xpCalc document has the theme
        if (xpCalcData.theme) {
          try {
            // Use the sync version for immediate results
            profileImage = getProfileImageByThemeSync(xpCalcData.theme);
          } catch (error) {
            // Fallback to user data or mock
            profileImage = userData.profileImage || mockProfileImages[i % mockProfileImages.length];
          }
        } 
        // If no theme in xpCalc, check user data
        else if (userData.theme) {
          try {
            // Use the sync version for immediate results
            profileImage = getProfileImageByThemeSync(userData.theme);
          } catch (error) {
            profileImage = userData.profileImage || mockProfileImages[i % mockProfileImages.length];
          }
        } 
        // Last resort - use profile image or mock
        else {
          profileImage = userData.profileImage || mockProfileImages[i % mockProfileImages.length];
        }
        
        leaderboardUsers.push({
          id: docId,
          username: (userData.username as string) || 'Anonymous',
          profileImage,
          level,
          xp: xpCalcData[xpField] || 0,
          rank: i + 1,
          currentXp: currentLevelXP,
          xpForNextLevel,
          isFollowed: currentRankingLevel === 'followers' || followingList.includes(docId),
          distance,
          theme: xpCalcData.theme || userData.theme || 'Dragon Ball', // Include theme for profile image
        });
      }
      
      // For regional rankings, filter by distance and re-sort
      if (currentRankingLevel === 'regional') {
        const filteredUsers = leaderboardUsers
          .filter(user => user.distance !== undefined && user.distance <= 100);
          
        if (filteredUsers.length === 0) {
          setNoUsersFound(true);
          setError('No users found within 100km of your location');
          setLoading(false);
          return;
        }
        
        leaderboardUsers = filteredUsers
          .sort((a, b) => b.xp - a.xp)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      }
      
      // If followers ranking and no users were found
      if (currentRankingLevel === 'followers' && leaderboardUsers.length === 0) {
        setNoUsersFound(true);
        setError('You are not following anyone yet');
        setLoading(false);
        return;
      }
      
      // Set the final users list - ensure they're sorted by totalXP
      leaderboardUsers.sort((a, b) => (b.xp - a.xp));
      
      // Update ranks based on the sorted order
      leaderboardUsers = leaderboardUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      setUsers(leaderboardUsers);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to load leaderboard data');
      setNoUsersFound(true);
    } finally {
      setLoading(false);
    }
  }, [
    currentRankingLevel,
    currentTimePeriod,
    currentUserLocation,
    selectedContinent,
    selectedCountry,
    useMockData,
    followingList,
    hasLocationPermission
  ]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [
    fetchLeaderboardData
  ]);

  // Add a separate useEffect to specifically trigger on country/continent changes
  useEffect(() => {
    // Only refetch if we're in the relevant ranking level
    if (
      (currentRankingLevel === 'country' && selectedCountry) || 
      (currentRankingLevel === 'continental' && selectedContinent)
    ) {
      fetchLeaderboardData();
    }
  }, [selectedCountry, selectedContinent, currentRankingLevel]);

  const changeRankingLevel = (level: RankingLevel) => {
    setCurrentRankingLevel(level);
  };

  const changeTimePeriod = (period: TimePeriod) => {
    setCurrentTimePeriod(period);
  };

  const changeSelectedCountry = (country: string) => {
    console.log('Setting selected country to:', country);
    setSelectedCountry(country);
    // If we're already on the country ranking level, refresh data
    if (currentRankingLevel === 'country') {
      // Add a slight delay to ensure the state updates first
      setTimeout(() => fetchLeaderboardData(), 100);
    }
  };

  const changeSelectedContinent = (continent: string) => {
    console.log('Setting selected continent to:', continent);
    setSelectedContinent(continent);
    // If we're already on the continental ranking level, refresh data
    if (currentRankingLevel === 'continental') {
      // Add a slight delay to ensure the state updates first
      setTimeout(() => fetchLeaderboardData(), 100);
    }
  };

  const toggleFollowUser = async (userId: string) => {
    if (!currentUser) return;

    try {
      // Get current user document
      const userRef = doc(db, 'users', currentUser);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.error('Current user document not found');
        return;
      }
      
      const userData = userSnap.data();
      let following = userData.following || [];
      
      // Toggle follow status
      if (following.includes(userId)) {
        // Unfollow
        following = following.filter((id: string) => id !== userId);
      } else {
        // Follow
        following.push(userId);
      }
      
      // Update user document
      await updateDoc(userRef, {
        following,
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setFollowingList(following);
      
      // Update the users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isFollowed: !user.isFollowed } 
            : user
        )
      );
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  // Function to update the current user's followingList in Firestore
  const updateFollowing = async (userId: string, follow: boolean) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user is signed in');
        return false;
      }
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      if (follow) {
        // Add userId to following list
        await updateDoc(userDocRef, {
          following: arrayUnion(userId),
          lastUpdated: serverTimestamp()
        });
      } else {
        // Remove userId from following list
        await updateDoc(userDocRef, {
          following: arrayRemove(userId),
          lastUpdated: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating following list:', error);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    noUsersFound,
    hasLocationPermission,
    currentRankingLevel,
    currentTimePeriod,
    selectedContinent,
    selectedCountry,
    changeRankingLevel,
    changeTimePeriod,
    changeSelectedCountry,
    changeSelectedContinent,
    toggleFollowUser
  };
} 