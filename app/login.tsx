import { useEffect } from 'react';
import { router } from 'expo-router';

export default function LoginRedirect() {
  useEffect(() => {
    // Redirect to the proper auth login page
    router.replace('/auth/login');
  }, []);
  
  // Return null as this is just a redirect component
  return null;
} 