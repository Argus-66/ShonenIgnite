import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface GymLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  currentOccupancy: number;
  maxOccupancy: number;
  latitude: number;
  longitude: number;
}

// Mock gym locations for testing
const mockGymLocations: GymLocation[] = [
  {
    id: 'gym1',
    name: 'FitnessFreak Downtown',
    address: '123 Main St, Downtown',
    hours: '6:00 AM - 11:00 PM',
    currentOccupancy: 45,
    maxOccupancy: 100,
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: 'gym2',
    name: 'FitnessFreak Uptown',
    address: '456 Park Ave, Uptown',
    hours: '5:00 AM - 10:00 PM',
    currentOccupancy: 30,
    maxOccupancy: 80,
    latitude: 37.7833,
    longitude: -122.4167
  },
  {
    id: 'gym3',
    name: 'FitnessFreak West Side',
    address: '789 Ocean Blvd, West Side',
    hours: '7:00 AM - 9:00 PM',
    currentOccupancy: 25,
    maxOccupancy: 75,
    latitude: 37.7850,
    longitude: -122.5000
  }
];

export function useGymLocations() {
  const [locations, setLocations] = useState<GymLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGymLocations = async () => {
      try {
        setLoading(true);
        
        // Check if we should try to get real data from Firestore
        const gymLocationsCollection = collection(db, 'gym_locations');
        const gymQuery = query(gymLocationsCollection, limit(10));
        
        const snapshot = await getDocs(gymQuery);
        
        if (snapshot.empty) {
          // If no gym locations found in Firestore, use mock data
          setLocations(mockGymLocations);
        } else {
          // Map Firestore data to GymLocation array
          const gyms: GymLocation[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unknown Gym',
              address: data.address || 'No address provided',
              hours: data.hours || '24/7',
              currentOccupancy: data.currentOccupancy || 0,
              maxOccupancy: data.maxOccupancy || 100,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0
            };
          });
          
          setLocations(gyms);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching gym locations:', err);
        setError('Failed to load gym locations');
        // Fall back to mock data on error
        setLocations(mockGymLocations);
      } finally {
        setLoading(false);
      }
    };

    fetchGymLocations();
  }, []);

  const refreshLocations = async () => {
    setLoading(true);
    try {
      // In a real app, this would re-fetch from Firestore
      // For now just randomize the current occupancy to simulate refresh
      const updatedLocations = locations.map(gym => ({
        ...gym,
        currentOccupancy: Math.floor(Math.random() * gym.maxOccupancy)
      }));
      setLocations(updatedLocations);
      setError(null);
    } catch (err) {
      console.error('Error refreshing gym locations:', err);
      setError('Failed to refresh gym locations');
    } finally {
      setLoading(false);
    }
  };

  return { 
    locations, 
    loading, 
    error,
    refreshLocations
  };
} 