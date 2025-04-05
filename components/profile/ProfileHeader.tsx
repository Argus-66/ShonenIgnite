import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileHeaderProps {
  username: string;
  onEditPress: () => void;
  onLogoutPress: () => void;
}

export const ProfileHeader = ({ username, onEditPress, onLogoutPress }: ProfileHeaderProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.header, { 
      backgroundColor: `${currentTheme.colors.accent}15`,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12
    }]}>
      <View style={styles.headerLeft}>
        <View style={[styles.avatarContainer, { 
          backgroundColor: `${currentTheme.colors.accent}20`,
          borderColor: currentTheme.colors.accent 
        }]}>
          <MaterialCommunityIcons 
            name="account" 
            size={40} 
            color={currentTheme.colors.accent}
          />
        </View>
        <ThemedText style={[styles.username, { color: currentTheme.colors.accent }]}>
          {username}
        </ThemedText>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
          onPress={onEditPress}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currentTheme.colors.error }]}
          onPress={onLogoutPress}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  }
}); 