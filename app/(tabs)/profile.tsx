import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, Modal, TextInput, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Theme, themes } from '@/constants/Themes';

interface UserProfile {
  username: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bio: string;
  theme: string;
}

export default function ProfileScreen() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          username: userData.username,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          bio: userData.bio || 'No bio yet',
          theme: userData.theme || 'default',
        });
        setEditableProfile({
          age: userData.age,
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          bio: userData.bio || 'No bio yet',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser || !editableProfile) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Only update fields that have changed
      const updates: Partial<UserProfile> = {};
      if (editableProfile.age) updates.age = editableProfile.age;
      if (editableProfile.height) updates.height = editableProfile.height;
      if (editableProfile.weight) updates.weight = editableProfile.weight;
      if (editableProfile.bio) updates.bio = editableProfile.bio;

      await updateDoc(userRef, updates);
      await loadUserProfile(); // Reload the profile after update
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleThemeChange = async (themeName: string) => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        theme: themeName
      });
      setTheme(themeName);
      await loadUserProfile(); // Reload the profile after update
      setShowThemeModal(false);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  if (!currentTheme || !availableThemes) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading theme...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderThemeOption = (themeName: string, theme: Theme) => {
    if (!theme?.colors) return null;
    
    const isSelected = themeName === userProfile?.theme;
    
    return (
      <TouchableOpacity
        key={themeName}
        style={[
          styles.themeOption,
          { 
            backgroundColor: theme.colors.background,
            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleThemeChange(themeName)}
      >
        <View style={styles.themeOptionLeft}>
          <View style={styles.themeColorPreviews}>
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.accent }]} />
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.secondary }]} />
          </View>
          <ThemedText style={[styles.themeOptionText, { color: theme.colors.text }]}>{themeName}</ThemedText>
        </View>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <ThemedView style={styles.container}>
        {/* Header with Actions */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={50} 
              color={currentTheme.colors.accent}
            />
            <ThemedText style={styles.username}>{userProfile?.username}</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
              onPress={() => setShowEditModal(true)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={currentTheme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={20} color={currentTheme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details */}
        <View style={[styles.detailsContainer, { backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }]}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name={userProfile?.gender === 'male' ? 'gender-male' : 'gender-female'} size={20} color={currentTheme.colors.accent} />
            <ThemedText style={styles.detailText}>{userProfile?.gender}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={currentTheme.colors.accent} />
            <ThemedText style={styles.detailText}>{userProfile?.age} years</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="human-male-height" size={20} color={currentTheme.colors.accent} />
            <ThemedText style={styles.detailText}>{userProfile?.height} cm</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weight" size={20} color={currentTheme.colors.accent} />
            <ThemedText style={styles.detailText}>{userProfile?.weight} kg</ThemedText>
          </View>
          <View style={styles.bioRow}>
            <MaterialCommunityIcons name="card-text" size={20} color={currentTheme.colors.accent} />
            <ThemedText style={styles.detailText}>{userProfile?.bio}</ThemedText>
          </View>
        </View>

        {/* Theme Button */}
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }]}
          onPress={() => setShowThemeModal(true)}
        >
          <MaterialCommunityIcons name="palette" size={20} color={currentTheme.colors.accent} />
          <ThemedText style={styles.themeButtonText}>Current Theme: {userProfile?.theme}</ThemedText>
        </TouchableOpacity>

        {/* Theme Selection Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.themeModalContent, { backgroundColor: currentTheme.colors.background }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Choose Your Theme</ThemedText>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.themeList} showsVerticalScrollIndicator={false}>
                {Object.entries(themes).map(([themeName, theme]) => 
                  renderThemeOption(themeName, theme as Theme)
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.editModalContent, { backgroundColor: currentTheme.colors.background }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Age</ThemedText>
                  <View style={styles.inputWithValue}>
                    <ThemedText style={styles.currentValue}>Current: {userProfile?.age} years</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        color: currentTheme.colors.text, 
                        borderColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.card,
                      }]}
                      value={String(editableProfile.age)}
                      onChangeText={(text) => setEditableProfile(prev => ({ ...prev, age: parseInt(text) || prev.age }))}
                      keyboardType="numeric"
                      placeholder="Enter new age"
                      placeholderTextColor={currentTheme.colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
                  <View style={styles.inputWithValue}>
                    <ThemedText style={styles.currentValue}>Current: {userProfile?.height} cm</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        color: currentTheme.colors.text, 
                        borderColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.card,
                      }]}
                      value={String(editableProfile.height)}
                      onChangeText={(text) => setEditableProfile(prev => ({ ...prev, height: parseInt(text) || prev.height }))}
                      keyboardType="numeric"
                      placeholder="Enter new height"
                      placeholderTextColor={currentTheme.colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
                  <View style={styles.inputWithValue}>
                    <ThemedText style={styles.currentValue}>Current: {userProfile?.weight} kg</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        color: currentTheme.colors.text, 
                        borderColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.card,
                      }]}
                      value={String(editableProfile.weight)}
                      onChangeText={(text) => setEditableProfile(prev => ({ ...prev, weight: parseInt(text) || prev.weight }))}
                      keyboardType="numeric"
                      placeholder="Enter new weight"
                      placeholderTextColor={currentTheme.colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Bio</ThemedText>
                  <View style={styles.inputWithValue}>
                    <ThemedText style={styles.currentValue}>Current: {userProfile?.bio}</ThemedText>
                    <TextInput
                      style={[styles.input, styles.bioInput, { 
                        color: currentTheme.colors.text, 
                        borderColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.card,
                      }]}
                      value={editableProfile.bio}
                      onChangeText={(text) => setEditableProfile(prev => ({ ...prev, bio: text }))}
                      multiline
                      placeholder="Enter new bio"
                      placeholderTextColor={currentTheme.colors.textSecondary}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={[styles.modalActions, { borderTopColor: currentTheme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: currentTheme.colors.error }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: currentTheme.colors.accent }]}
                  onPress={handleSaveProfile}
                >
                  <ThemedText style={styles.modalButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  themeModalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },
  editModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  themeList: {
    maxHeight: '90%',
  },
  editForm: {
    maxHeight: '80%',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeColorPreviews: {
    flexDirection: 'row',
    gap: 8,
  },
  themeColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWithValue: {
    gap: 5,
  },
  currentValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
}); 