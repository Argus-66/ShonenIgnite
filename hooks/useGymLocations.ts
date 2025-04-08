import { useState, useEffect } from 'react';

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

export function useGymLocations() {
  const [locations, setLocations] = useState<GymLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return empty data since the user doesn't need actual gym locations
  return { locations: [], loading: false, error: null };
} 