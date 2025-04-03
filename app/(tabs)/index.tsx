import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface UserStats {
  username: string;
  level: number;
  streak: number;
  coins: number;
  skills: {
    strength: number;
    agility: number;
    endurance: number;
  };
}

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  async function loadUserStats() {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserStats({
          username: userData.username,
          level: userData.level || 1,
          streak: userData.streak || 0,
          coins: userData.coins || 0,
          skills: {
            strength: userData.skills?.strength || 1,
            agility: userData.skills?.agility || 1,
            endurance: userData.skills?.endurance || 1,
          },
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!currentTheme) {
    return null; // Or a loading screen
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <ThemedView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <ThemedText style={styles.welcomeText}>Welcome,</ThemedText>
          <ThemedText style={styles.username}>{userStats?.username}</ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: currentTheme.colors.card }]}>
            <MaterialCommunityIcons name="star" size={24} color={currentTheme.colors.accent} />
            <ThemedText style={styles.statValue}>Level {userStats?.level}</ThemedText>
            <ThemedText style={styles.statLabel}>Level</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: currentTheme.colors.card }]}>
            <MaterialCommunityIcons name="fire" size={24} color={currentTheme.colors.accent} />
            <ThemedText style={styles.statValue}>{userStats?.streak} Days</ThemedText>
            <ThemedText style={styles.statLabel}>Streak</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: currentTheme.colors.card }]}>
            <MaterialCommunityIcons name="currency-usd" size={24} color={currentTheme.colors.accent} />
            <ThemedText style={styles.statValue}>{userStats?.coins}</ThemedText>
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
          <View style={styles.skillsContainer}>
            <View style={[styles.skillCard, { backgroundColor: currentTheme.colors.card }]}>
              <MaterialCommunityIcons name="arm-flex" size={24} color={currentTheme.colors.accent} />
              <ThemedText style={styles.skillValue}>Lvl {userStats?.skills.strength}</ThemedText>
              <ThemedText style={styles.skillLabel}>Strength</ThemedText>
            </View>

            <View style={[styles.skillCard, { backgroundColor: currentTheme.colors.card }]}>
              <MaterialCommunityIcons name="run-fast" size={24} color={currentTheme.colors.accent} />
              <ThemedText style={styles.skillValue}>Lvl {userStats?.skills.agility}</ThemedText>
              <ThemedText style={styles.skillLabel}>Agility</ThemedText>
            </View>

            <View style={[styles.skillCard, { backgroundColor: currentTheme.colors.card }]}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color={currentTheme.colors.accent} />
              <ThemedText style={styles.skillValue}>Lvl {userStats?.skills.endurance}</ThemedText>
              <ThemedText style={styles.skillLabel}>Endurance</ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.startWorkoutButton, { backgroundColor: currentTheme.colors.accent }]}
          onPress={() => {/* TODO: Implement workout start */}}
        >
          <MaterialCommunityIcons name="play-circle" size={24} color={currentTheme.colors.textPrimary} />
          <ThemedText style={styles.startWorkoutText}>Start Workout</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.viewProgressButton, { borderColor: currentTheme.colors.border }]}
          onPress={() => {/* TODO: Implement progress view */}}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color={currentTheme.colors.accent} />
          <ThemedText style={styles.viewProgressText}>View Progress</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    opacity: 0.7,
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  skillsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  skillsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  skillValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  skillLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  viewProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
