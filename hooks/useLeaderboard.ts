import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { LeaderboardUser } from '@/components/leaderboard/LeaderboardItem';
import { calculateDistance } from '@/utils/locationService';

export function useLeaderboard() {
  const [globalUsers, setGlobalUsers] = useState<LeaderboardUser[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser.uid);
    }
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's location
      let userLocation = null;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().location) {
          userLocation = userDoc.data().location;
        }
      }

      // Fetch global leaderboard
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('stats.totalXP', 'desc'),
        limit(50)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      const leaderboardData: LeaderboardUser[] = [];
      usersSnapshot.docs.forEach((doc, index) => {
        const userData = doc.data();
        leaderboardData.push({
          id: doc.id,
          username: userData.username || 'Anonymous',
          profileImage: userData.profileImage || 'https://via.placeholder.com/150',
          level: userData.stats?.level || 1,
          xp: userData.stats?.totalXP || 0,
          rank: index + 1,
        });
      });
      
      setGlobalUsers(leaderboardData);

      // Fetch nearby users if we have the user's location
      if (userLocation) {
        const nearbyUsersData: LeaderboardUser[] = [];
        
        // This is a simplified approach - in a real app you'd use geoqueries
        usersSnapshot.docs.forEach((doc, index) => {
          const userData = doc.data();
          
          if (doc.id !== auth.currentUser?.uid && userData.location) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              userData.location.latitude,
              userData.location.longitude
            );
            
            // Only include users within 50km
            if (distance <= 50) {
              nearbyUsersData.push({
                id: doc.id,
                username: userData.username || 'Anonymous',
                profileImage: userData.profileImage || 'https://via.placeholder.com/150',
                level: userData.stats?.level || 1,
                xp: userData.stats?.totalXP || 0,
                rank: index + 1,
                distance: distance,
              });
            }
          }
        });
        
        // Sort by distance
        nearbyUsersData.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        // Update ranks based on new sorting
        nearbyUsersData.forEach((user, index) => {
          user.rank = index + 1;
        });
        
        setNearbyUsers(nearbyUsersData);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return {
    globalUsers,
    nearbyUsers,
    loading,
    error,
    currentUserId: currentUser,
    refreshLeaderboard: fetchLeaderboardData,
  };
} 