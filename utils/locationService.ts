import * as Location from 'expo-location';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, auth } from '@/config/firebase';

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

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

/**
 * Gets the user's current location and stores it in Firestore
 * @returns A promise that resolves to true if the location was saved successfully, false otherwise
 */
export async function saveUserLocation(): Promise<boolean> {
  try {
    if (!auth.currentUser) return false;
    
    // Get current location with high accuracy
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    
    // Get reverse geocoding to determine country, continent, etc.
    const geocode = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
    
    // Extract location info
    const locationInfo = geocode[0] || {};
    const country = locationInfo.country || 'Unknown';
    const region = locationInfo.region || locationInfo.subregion || 'Unknown';
    
    // Determine continent from country
    // This is a simplified approach - in a real app you'd use a more accurate method
    const continent = determineContinent(country);
    
    // Store the location in Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    await updateDoc(userRef, {
      location: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
        country,
        region,
        continent,
        formattedAddress: [
          locationInfo.street,
          locationInfo.city,
          locationInfo.region,
          locationInfo.country
        ].filter(Boolean).join(', ')
      }
    });
    
    console.log("Location stored successfully!");
    return true;
  } catch (error) {
    console.error("Error storing location:", error);
    return false;
  }
}

/**
 * Determines the continent based on country name
 * This is a simplified version - a real app would use more accurate data
 */
function determineContinent(country: string): string {
  const continentMap: Record<string, string> = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Colombia': 'South America',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Russia': 'Europe',
    'China': 'Asia',
    'Japan': 'Asia',
    'India': 'Asia',
    'South Korea': 'Asia',
    'Australia': 'Oceania',
    'New Zealand': 'Oceania',
    'Egypt': 'Africa',
    'South Africa': 'Africa',
    'Nigeria': 'Africa'
  };
  
  return continentMap[country] || 'Unknown';
}

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