import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export interface LeaderboardUser {
  id: string;
  username: string;
  profileImage: string;
  level: number;
  xp: number;
  rank: number;
  distance?: number; // Only for nearby users
}

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isCurrentUser: boolean;
  onPress: (userId: string) => void;
}

export const LeaderboardItem = ({ 
  user, 
  isCurrentUser,
  onPress 
}: LeaderboardItemProps) => {
  const { currentTheme } = useTheme();

  const getRankStyle = () => {
    if (user.rank === 1) return { color: '#FFD700' }; // Gold
    if (user.rank === 2) return { color: '#C0C0C0' }; // Silver
    if (user.rank === 3) return { color: '#CD7F32' }; // Bronze
    return {};
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isCurrentUser && { backgroundColor: `${currentTheme.colors.accent}20` },
      ]}
      onPress={() => onPress(user.id)}
    >
      <View style={styles.rankContainer}>
        <ThemedText style={[styles.rank, getRankStyle()]}>
          {user.rank}
        </ThemedText>
      </View>
      
      <Image 
        source={{ uri: user.profileImage }} 
        style={styles.profileImage} 
      />
      
      <View style={styles.userInfo}>
        <ThemedText style={styles.username}>
          {user.username}
          {isCurrentUser && <ThemedText style={styles.youLabel}> (You)</ThemedText>}
        </ThemedText>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="star" size={14} color={currentTheme.colors.accent} />
            <ThemedText style={styles.statText}>Level {user.level}</ThemedText>
          </View>
          
          <View style={styles.stat}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={currentTheme.colors.accent} />
            <ThemedText style={styles.statText}>{user.xp} XP</ThemedText>
          </View>
          
          {user.distance !== undefined && (
            <View style={styles.stat}>
              <MaterialCommunityIcons name="map-marker-distance" size={14} color={currentTheme.colors.accent} />
              <ThemedText style={styles.statText}>{user.distance.toFixed(1)} km</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  youLabel: {
    fontWeight: 'normal',
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  statText: {
    fontSize: 13,
    marginLeft: 4,
    opacity: 0.8,
  },
}); 