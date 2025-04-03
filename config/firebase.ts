import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyAtUTXPotCUR4N8JQ6QOwST0P_hxaWkXY8",
  authDomain: "fitnessfreak-7c204.firebaseapp.com",
  projectId: "fitnessfreak-7c204",
  storageBucket: "fitnessfreak-7c204.firebasestorage.app",
  messagingSenderId: "947154439908",
  appId: "1:947154439908:web:0a006316aad3737fbee6f1",
  measurementId: "G-EENHDPEBT2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 