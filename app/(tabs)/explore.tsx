import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, ScrollView, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/config/firebase';
import { collection, query, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { router } from 'expo-router';
import ProfileImage from '@/components/ProfileImage';

interface UserData {
  id: string;
  username: string;
  followers: string[];
  following: string[];
  bio?: string;
  theme: string;
}

export default function ExploreScreen() {
  const { currentTheme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadSuggestedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadCurrentUser(),
      loadSuggestedUsers()
    ]);
    setRefreshing(false);
  }, []);

  const loadCurrentUser = async () => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          id: auth.currentUser.uid,
          username: userData.username,
          followers: userData.followers || [],
          following: userData.following || [],
          bio: userData.bio || '',
          theme: userData.theme || 'default'
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadSuggestedUsers = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users: UserData[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser?.uid) {
          const userData = doc.data();
          users.push({
            id: doc.id,
            username: userData.username,
            followers: userData.followers || [],
            following: userData.following || [],
            bio: userData.bio || '',
            theme: userData.theme || 'default'
          });
        }
      });
      
      // Limit to 10 suggested users
      setSuggestedUsers(users.slice(0, 10));
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !auth.currentUser) return;

    try {
      setLoading(true);
      // Get all users and filter client-side for more flexible searching
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      const results: UserData[] = [];
      const searchTermLower = searchQuery.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser?.uid) {
          const userData = doc.data();
          // Check if username contains the search term (case insensitive)
          if (userData.username.toLowerCase().includes(searchTermLower)) {
            results.push({
              id: doc.id,
              username: userData.username,
              followers: userData.followers || [],
              following: userData.following || [],
              bio: userData.bio || '',
              theme: userData.theme || 'default'
            });
          }
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!auth.currentUser || !currentUser) return;

    try {
      // Update current user's following list
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: arrayUnion(userId)
      });
      
      // Update target user's followers list
      await updateDoc(doc(db, 'users', userId), {
        followers: arrayUnion(auth.currentUser.uid)
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        following: [...currentUser.following, userId]
      });
      
      // Update search results
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, followers: [...user.followers, auth.currentUser!.uid] }
          : user
      ));
      
      // Update suggested users
      setSuggestedUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, followers: [...user.followers, auth.currentUser!.uid] }
          : user
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    if (!auth.currentUser || !currentUser) return;

    try {
      // Update current user's following list
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: arrayRemove(userId)
      });
      
      // Update target user's followers list
      await updateDoc(doc(db, 'users', userId), {
        followers: arrayRemove(auth.currentUser.uid)
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        following: currentUser.following.filter(id => id !== userId)
      });
      
      // Update search results
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, followers: user.followers.filter(id => id !== auth.currentUser!.uid) }
          : user
      ));
      
      // Update suggested users
      setSuggestedUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, followers: user.followers.filter(id => id !== auth.currentUser!.uid) }
          : user
      ));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const isFollowing = (userId: string) => {
    return currentUser?.following.includes(userId) || false;
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile with the proper params format
    router.push({
      pathname: "/profile/[userId]",
      params: { userId }
    });
  };

  const renderUserItem = ({ item }: { item: UserData }) => (
    <TouchableOpacity 
      style={[styles.userItem, { borderBottomColor: currentTheme.colors.border }]}
      onPress={() => handleViewProfile(item.id)}
    >
      <View style={styles.userInfo}>
        <View style={[styles.userAvatar, { borderColor: currentTheme.colors.accent }]}>
          <ProfileImage 
            themeName={item.theme || 'Dragon Ball'}
            size={50}
          />
        </View>
        <View>
          <ThemedText style={styles.username}>{item.username}</ThemedText>
          {item.bio ? (
            <ThemedText style={styles.userBio} numberOfLines={1}>{item.bio}</ThemedText>
          ) : null}
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.followButton, 
          { 
            backgroundColor: isFollowing(item.id) 
              ? `${currentTheme.colors.border}50` 
              : currentTheme.colors.accent 
          }
        ]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
          isFollowing(item.id) 
            ? handleUnfollowUser(item.id) 
            : handleFollowUser(item.id);
        }}
      >
        <ThemedText style={[
          styles.followButtonText, 
          { color: isFollowing(item.id) ? currentTheme.colors.text : '#fff' }
        ]}>
          {isFollowing(item.id) ? 'Following' : 'Follow'}
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colors.background}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.accent]}
            tintColor={currentTheme.colors.accent}
            progressBackgroundColor={currentTheme.colors.background}
          />
        }
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Explore</ThemedText>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: `${currentTheme.colors.text}10` }]}>
            <MaterialCommunityIcons name="magnify" size={24} color={currentTheme.colors.text} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.colors.text }]}
              placeholder="Search by username"
              placeholderTextColor={`${currentTheme.colors.text}50`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={currentTheme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.colors.accent} />
            </View>
          ) : searchQuery.length > 0 ? (
            <>
              <ThemedText style={styles.sectionTitle}>Search Results</ThemedText>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderUserItem}
                  contentContainerStyle={styles.userList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="account-search" size={48} color={`${currentTheme.colors.text}50`} />
                  <ThemedText style={styles.emptyStateText}>No users found</ThemedText>
                </View>
              )}
            </>
          ) : (
            <>
              <ThemedText style={styles.sectionTitle}>Suggested Users</ThemedText>
              <FlatList
                data={suggestedUsers}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                contentContainerStyle={styles.userList}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="account-group" size={48} color={`${currentTheme.colors.text}50`} />
                    <ThemedText style={styles.emptyStateText}>No users found</ThemedText>
                  </View>
                )}
              />
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userList: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userBio: {
    fontSize: 14,
    opacity: 0.7,
    maxWidth: 200,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
  },
});
