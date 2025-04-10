import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ThemedText';

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
}

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isCurrentUser: boolean;
  onPress: (userId: string) => void;
  onFollowToggle: (userId: string) => void;
}

export const LeaderboardItem = ({ user, isCurrentUser, onPress, onFollowToggle }: LeaderboardItemProps) => {
  const { currentTheme } = useTheme();
  
  // Format the XP value with commas
  const formattedXP = user.xp.toLocaleString();
  
  // Calculate the progress percentage for the XP bar
  const progressPercentage = user.xpForNextLevel && user.xpForNextLevel > 0 
    ? (user.currentXp || 0) / user.xpForNextLevel * 100 
    : 0;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isCurrentUser && { 
          backgroundColor: currentTheme.colors.cardHighlight,
          borderColor: currentTheme.colors.accent,
          borderWidth: 2
        }
      ]}
      onPress={() => onPress(user.id)}
    >
      {/* Rank Circle */}
      <View style={[styles.rankCircle, { backgroundColor: currentTheme.colors.accent }]}>
        <ThemedText style={styles.rankText}>{user.rank}</ThemedText>
      </View>
      
      {/* Profile Image */}
      <Image source={user.profileImage} style={styles.profileImage} />
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <ThemedText style={styles.username}>
            {user.username}
            {isCurrentUser && <Text style={{color: currentTheme.colors.accent}}> (You)</Text>}
          </ThemedText>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.levelContainer}>
            <FontAwesome5 name="star" size={14} color={currentTheme.colors.gold} />
            <ThemedText style={styles.levelText}>Level {user.level}</ThemedText>
          </View>
          
          <View style={styles.xpContainer}>
            <FontAwesome5 name="bolt" size={14} color={currentTheme.colors.accent} />
            <ThemedText style={styles.xpText}>{formattedXP} XP</ThemedText>
          </View>
        </View>
        
        {/* Progress Bar */}
        {user.xpForNextLevel !== undefined && user.xpForNextLevel > 0 && (
          <View style={[styles.progressBarContainer, { backgroundColor: currentTheme.colors.cardSecondary }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progressPercentage}%`, 
                  backgroundColor: currentTheme.colors.accent 
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
                ? currentTheme.colors.cardSecondary 
                : currentTheme.colors.accent 
            }
          ]}
          onPress={() => onFollowToggle(user.id)}
        >
          <Ionicons 
            name={user.isFollowed ? "person-remove" : "person-add"} 
            size={16} 
            color={user.isFollowed ? currentTheme.colors.text : currentTheme.colors.white} 
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
    backgroundColor: '#1A1A1A',
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
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
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