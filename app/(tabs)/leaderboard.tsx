import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

export default function LeaderboardScreen() {
  const { currentTheme } = useTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Leaderboard</ThemedText>
        <ThemedText style={styles.comingSoon}>Coming Soon!</ThemedText>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 