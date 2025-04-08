import { View, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import getProfileImageByTheme from '@/utils/profileImages';
import { useState } from 'react';

interface ProfileHeaderProps {
  username: string;
  followersCount: number;
  followingCount: number;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onEditPress: () => void;
  onLogoutPress: () => void;
  themeName?: string;
}

export const ProfileHeader = ({
  username,
  followersCount = 0,
  followingCount = 0,
  onFollowersPress,
  onFollowingPress,
  onEditPress,
  onLogoutPress,
  themeName = 'default'
}: ProfileHeaderProps) => {
  const { currentTheme } = useTheme();
  const profileImage = getProfileImageByTheme(themeName);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: `${currentTheme.colors.accent}15` }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[
              styles.avatarContainer,
              { 
                borderColor: currentTheme.colors.accent,
              }
            ]}
            onPress={() => setImageViewerVisible(true)}
            activeOpacity={0.8}
          >
            <Image 
              source={profileImage}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <ThemedText style={styles.username}>
            {username || 'User'}
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${currentTheme.colors.accent}15` }]}
            onPress={onEditPress}
          >
            <MaterialCommunityIcons name="account-edit" size={20} color={currentTheme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${currentTheme.colors.accent}15` }]}
            onPress={onLogoutPress}
          >
            <MaterialCommunityIcons name="logout" size={20} color={currentTheme.colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={onFollowersPress}>
          <ThemedText style={styles.statValue}>{followersCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Followers</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem} onPress={onFollowingPress}>
          <ThemedText style={styles.statValue}>{followingCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Following</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Full-screen Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setImageViewerVisible(false)}
          >
            <Image 
              source={profileImage}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 4,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
}); 