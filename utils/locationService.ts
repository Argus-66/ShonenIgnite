import * as Location from 'expo-location';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Request location permissions and get current location
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Get the current user location
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      console.log('Location permission not granted');
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Save user location to Firestore
export const saveUserLocation = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No user logged in');
      return false;
    }
    
    const location = await getCurrentLocation();
    
    if (!location) {
      console.log('Could not get location');
      return false;
    }
    
    const { latitude, longitude } = location.coords;
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    await updateDoc(userRef, {
      location: {
        latitude,
        longitude,
        lastUpdated: new Date().toISOString(),
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error saving user location:', error);
    return false;
  }
};

// Calculate distance between two points in kilometers using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Find nearby users within a specified radius
export const findNearbyUsers = async (radiusInKm: number = 10): Promise<any[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No user logged in');
      return [];
    }
    
    const location = await getCurrentLocation();
    
    if (!location) {
      console.log('Could not get location');
      return [];
    }
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document not found');
      return [];
    }
    
    const userData = userDoc.data();
    const { latitude, longitude } = location.coords;
    
    // For a production app, you would use a GeoQuery
    // This is a simplified approach for demonstration
    
    // Get all users and filter by distance
    // In a real app, you would use Firestore queries with geopoint data
    
    // Placeholder for nearby users - in a real implementation,
    // this would fetch users from Firestore and calculate distances
    const nearbyUsers: any[] = [];
    
    return nearbyUsers.filter(nearbyUser => {
      if (!nearbyUser.location) return false;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        nearbyUser.location.latitude,
        nearbyUser.location.longitude
      );
      
      return distance <= radiusInKm;
    });
  } catch (error) {
    console.error('Error finding nearby users:', error);
    return [];
  }
}; 