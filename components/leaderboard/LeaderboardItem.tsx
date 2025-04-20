import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import ProfileImage from '@/components/ProfileImage';

export interface LeaderboardUser {
  id: string;
  username: string;
  profileImage: any;
  level: number;
  xp: number;
  rank: number;
  currentXp?: number;
  xpForNextLevel?: number;
  isFollowed?: boolean;
  distance?: number; // We'll keep this in the type but not display it
  theme?: string; // Add theme property for profile image
}

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isCurrentUser: boolean;
  isTopThree?: boolean;
  onPress: (userId: string) => void;
  onFollowToggle: (userId: string) => void;
}

export const LeaderboardItem = ({ user, isCurrentUser, isTopThree, onPress, onFollowToggle }: LeaderboardItemProps) => {
  const { currentTheme } = useTheme();
  
  // Format the XP value with commas
  const formattedXP = user.xp.toLocaleString();
  
  // Calculate the progress percentage for the XP bar
  const progressPercentage = user.xpForNextLevel && user.xpForNextLevel > 0 
    ? (user.currentXp || 0) / user.xpForNextLevel * 100 
    : 0;
  
  // Get medal color based on rank
  const getMedalColor = () => {
    if (user.rank === 1) return currentTheme.colors.leaderboard?.firstPlaceAccent || '#FFD700'; // Gold
    if (user.rank === 2) return currentTheme.colors.leaderboard?.secondPlaceAccent || '#C0C0C0'; // Silver
    if (user.rank === 3) return currentTheme.colors.leaderboard?.thirdPlaceAccent || '#CD7F32'; // Bronze
    return currentTheme.colors.accent;
  };
  
  // Get medal icon based on rank
  const getMedalIcon = () => {
    if (user.rank === 1) return 'trophy';
    if (user.rank === 2) return 'medal';
    if (user.rank === 3) return 'medal-outline';
    return 'numeric'; // Default icon instead of null
  };
  
  const isTopRank = user.rank <= 3;
  const medalColor = getMedalColor();
  const medalIcon = getMedalIcon();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: currentTheme.colors.leaderboard?.rankCardBackground || currentTheme.colors.card },
        isTopRank && {
          borderWidth: 2,
          borderColor: medalColor,
          shadowColor: medalColor,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          elevation: 8,
        },
        isCurrentUser && { 
          backgroundColor: currentTheme.colors.leaderboard?.userHighlightBackground || currentTheme.colors.accent2,
          borderColor: currentTheme.colors.accent,
          borderWidth: 2
        }
      ]}
      onPress={() => onPress(user.id)}
    >
      {/* Rank Circle with Medal for Top 3 */}
      <View style={[
        styles.rankCircle, 
        { backgroundColor: isTopRank ? medalColor : currentTheme.colors.accent },
        isTopRank && styles.topRankCircle
      ]}>
        {isTopRank ? (
          <MaterialCommunityIcons name={medalIcon} size={20} color="white" />
        ) : (
          <Text style={[styles.rankText, { color: currentTheme.colors.textPrimary }]}>{user.rank}</Text>
        )}
      </View>
      
      {/* Profile Image with Premium Border for Top 3 */}
      <View style={isTopRank ? [styles.profileImageWrapper, { borderColor: medalColor }] : null}>
        <ProfileImage 
          themeName={user.theme || 'Dragon Ball'} 
          size={isTopRank ? 55 : 50} 
        />
      </View>
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <ThemedText style={[
            styles.username,
            isTopRank && { fontSize: 18, fontWeight: 'bold' }
          ]}>
            {user.username}
            {isCurrentUser && <Text style={{color: currentTheme.colors.accent}}> (You)</Text>}
          </ThemedText>
          
          {/* Display rank for top 3 since we're showing a medal in the circle */}
          {isTopRank && (
            <ThemedText style={[styles.rankLabel, { color: medalColor }]}>
              #{user.rank}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.levelContainer}>
            <FontAwesome5 
              name="star" 
              size={14} 
              color={isTopRank ? medalColor : currentTheme.colors.accent} 
            />
            <ThemedText style={styles.levelText}>Level {user.level}</ThemedText>
          </View>
          
          <View style={styles.xpContainer}>
            <FontAwesome5 
              name="bolt" 
              size={14} 
              color={isTopRank ? medalColor : currentTheme.colors.accent} 
            />
            <ThemedText style={styles.xpText}>{formattedXP} XP</ThemedText>
          </View>
        </View>
        
        {/* Progress Bar */}
        {user.xpForNextLevel !== undefined && user.xpForNextLevel > 0 && (
          <View style={[
            styles.progressBarContainer, 
            { backgroundColor: currentTheme.colors.leaderboard?.podiumBackground || currentTheme.colors.secondary }
          ]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progressPercentage}%`, 
                  backgroundColor: isTopRank ? medalColor : currentTheme.colors.accent 
                }
              ]} 
            />
            <ThemedText style={styles.progressText}>
              {user.currentXp}/{user.xpForNextLevel} XP
            </ThemedText>
          </View>
        )}
      </View>
      
      {/* Follow Button (don't show for current user) */}
      {!isCurrentUser && (
        <TouchableOpacity 
          style={[
            styles.followButton, 
            { 
              backgroundColor: user.isFollowed 
                ? currentTheme.colors.secondary
                : isTopRank ? medalColor : currentTheme.colors.accent 
            }
          ]}
          onPress={() => onFollowToggle(user.id)}
        >
          <Ionicons 
            name={user.isFollowed ? "person-remove" : "person-add"} 
            size={16} 
            color={user.isFollowed ? currentTheme.colors.textPrimary : currentTheme.colors.textPrimary} 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topRankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 14,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImageWrapper: {
    width: 59,
    height: 59,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    fontSize: 14,
    marginLeft: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 