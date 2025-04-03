import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

interface UserProfile {
  username: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bio: string;
}

export default function ProfileScreen() {
  const { currentTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            username: userData.username,
            email: userData.email,
            age: userData.age,
            gender: userData.gender,
            height: userData.height,
            weight: userData.weight,
            bio: userData.bio || 'No bio yet',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const cardStyle = {
    ...styles.card,
    backgroundColor: currentTheme.colors.background,
    borderColor: currentTheme.colors.border,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header with Logout */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={50} 
              color={currentTheme.colors.accent}
            />
            <View style={styles.headerText}>
              <ThemedText style={styles.username}>{userProfile?.username}</ThemedText>
              <ThemedText style={styles.email}>{userProfile?.email}</ThemedText>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: currentTheme.colors.accent }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color={currentTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* User Details Card */}
        <View style={[cardStyle, styles.detailsCard]}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name={userProfile?.gender === 'male' ? 'gender-male' : 'gender-female'} 
              size={24} 
              color={currentTheme.colors.accent}
            />
            <ThemedText style={styles.detailText}>
              {userProfile?.gender.charAt(0).toUpperCase() + userProfile?.gender.slice(1)}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={24} 
              color={currentTheme.colors.accent}
            />
            <ThemedText style={styles.detailText}>{userProfile?.age} years</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="human-male-height" 
              size={24} 
              color={currentTheme.colors.accent}
            />
            <ThemedText style={styles.detailText}>{userProfile?.height} cm</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="weight" 
              size={24} 
              color={currentTheme.colors.accent}
            />
            <ThemedText style={styles.detailText}>{userProfile?.weight} kg</ThemedText>
          </View>
        </View>

        {/* Bio Card */}
        <View style={[cardStyle, styles.bioCard]}>
          <ThemedText style={styles.bioTitle}>Bio</ThemedText>
          <ThemedText style={styles.bioText}>{userProfile?.bio}</ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 8,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  detailsCard: {
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailText: {
    fontSize: 16,
  },
  bioCard: {
    flex: 1,
  },
  bioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 