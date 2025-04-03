import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface UserStats {
  level: number;
  xp: number;
  streak: number;
  coins: number;
  skills: {
    strength: number;
    agility: number;
    endurance: number;
  };
  username?: string;
}

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserStats({
            level: userData.progression.level,
            xp: userData.progression.xp,
            streak: userData.progression.streak,
            coins: userData.coins,
            skills: userData.skills,
            username: userData.username,
          });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserStats();
  }, []);

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
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.welcomeContainer}>
              <ThemedText style={styles.welcomeText}>Welcome, </ThemedText>
              <ThemedText style={styles.username}>{userStats?.username || 'User'}</ThemedText>
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <View style={[cardStyle, styles.statsCard]}>
              <MaterialCommunityIcons 
                name="star" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={styles.statValue}>Level {userStats?.level}</ThemedText>
              <ThemedText style={styles.statLabel}>Level</ThemedText>
            </View>

            <View style={[cardStyle, styles.statsCard]}>
              <MaterialCommunityIcons 
                name="fire" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={styles.statValue}>{userStats?.streak} Days</ThemedText>
              <ThemedText style={styles.statLabel}>Streak</ThemedText>
            </View>

            <View style={[cardStyle, styles.statsCard]}>
              <MaterialCommunityIcons 
                name="coin" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={styles.statValue}>{userStats?.coins}</ThemedText>
              <ThemedText style={styles.statLabel}>Coins</ThemedText>
            </View>
          </View>

          {/* Skills Section */}
          <View style={[cardStyle, styles.skillsCard]}>
            <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
            <View style={styles.skillsGrid}>
              <View style={styles.skillItem}>
                <MaterialCommunityIcons 
                  name="arm-flex" 
                  size={24} 
                  color={currentTheme.colors.accent} 
                />
                <ThemedText style={styles.skillValue}>
                  Lvl {userStats?.skills.strength}
                </ThemedText>
                <ThemedText style={styles.skillLabel}>Strength</ThemedText>
              </View>

              <View style={styles.skillItem}>
                <MaterialCommunityIcons 
                  name="run-fast" 
                  size={24} 
                  color={currentTheme.colors.accent} 
                />
                <ThemedText style={styles.skillValue}>
                  Lvl {userStats?.skills.agility}
                </ThemedText>
                <ThemedText style={styles.skillLabel}>Agility</ThemedText>
              </View>

              <View style={styles.skillItem}>
                <MaterialCommunityIcons 
                  name="heart-pulse" 
                  size={24} 
                  color={currentTheme.colors.accent} 
                />
                <ThemedText style={styles.skillValue}>
                  Lvl {userStats?.skills.endurance}
                </ThemedText>
                <ThemedText style={styles.skillLabel}>Endurance</ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[cardStyle, styles.actionButton]}
              onPress={() => {/* TODO: Start Workout */}}
            >
              <MaterialCommunityIcons 
                name="play-circle" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={styles.actionText}>Start Workout</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[cardStyle, styles.actionButton]}
              onPress={() => {/* TODO: View Progress */}}
            >
              <MaterialCommunityIcons 
                name="chart-line" 
                size={24} 
                color={currentTheme.colors.accent} 
              />
              <ThemedText style={styles.actionText}>View Progress</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  welcomeText: {
    fontSize: 24,
    opacity: 0.7,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  skillsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  skillsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skillItem: {
    alignItems: 'center',
  },
  skillValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  skillLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickActions: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
