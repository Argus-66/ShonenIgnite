import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { LeaderboardItem, LeaderboardUser } from './LeaderboardItem';

interface LeaderboardListProps {
  users: LeaderboardUser[];
  currentUserId: string;
  loading: boolean;
  error: string | null;
  noUsersFound?: boolean;
  onUserPress: (userId: string) => void;
  onFollowToggle: (userId: string) => Promise<void>;
}

export const LeaderboardList = ({ 
  users, 
  currentUserId, 
  loading,
  error,
  noUsersFound = false,
  onUserPress,
  onFollowToggle
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

  if (noUsersFound || users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>{error || 'No users found'}</ThemedText>
      </View>
    );
  }

  // Get top three users and remaining users
  const topThree = users.slice(0, Math.min(3, users.length));
  const remainingUsers = users.length > 3 ? users.slice(3) : [];

  // Render all top users with special styling
  const renderTopUsers = () => {
    return (
      <View style={styles.topThreeContainer}>
        {topThree.map(user => (
          <LeaderboardItem
            key={user.id}
            user={user}
            isCurrentUser={user.id === currentUserId}
            onPress={onUserPress}
            onFollowToggle={onFollowToggle}
            isTopThree={true}
          />
        ))}
      </View>
    );
  };

  // If we have only top users and no remaining users
  if (remainingUsers.length === 0) {
    return (
      <View style={styles.container}>
        {renderTopUsers()}
      </View>
    );
  }

  // Render remaining users in a FlatList
  return (
    <View style={styles.container}>
      {renderTopUsers()}
      
      <ThemedText style={styles.dividerText}>Other Rankings</ThemedText>
      
      <FlatList
        style={styles.remainingList}
        data={remainingUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeaderboardItem
            user={item}
            isCurrentUser={item.id === currentUserId}
            onPress={onUserPress}
            onFollowToggle={onFollowToggle}
            isTopThree={false}
          />
        )}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topThreeContainer: {
    paddingBottom: 16,
  },
  dividerText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    opacity: 0.7,
  },
  remainingList: {
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
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
    marginHorizontal: 20,
  },
}); 