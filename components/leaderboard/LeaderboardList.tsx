import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { LeaderboardItem, LeaderboardUser } from './LeaderboardItem';

interface LeaderboardListProps {
  users: LeaderboardUser[];
  currentUserId: string;
  loading: boolean;
  onUserPress: (userId: string) => void;
}

export const LeaderboardList = ({ 
  users, 
  currentUserId, 
  loading,
  onUserPress 
}: LeaderboardListProps) => {
  const { currentTheme } = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.colors.accent} />
        <ThemedText style={styles.loadingText}>Loading leaderboard...</ThemedText>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No users found</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <LeaderboardItem
          user={item}
          isCurrentUser={item.id === currentUserId}
          onPress={onUserPress}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 