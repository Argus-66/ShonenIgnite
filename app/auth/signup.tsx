import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router, Stack, Redirect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const { currentTheme } = useTheme();
  const { signup, isAuthenticated, user, error: authError, isInitializing } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already authenticated, redirect to the main app
  if (isAuthenticated && !isInitializing) {
    return <Redirect href="/(tabs)" />;
  }

  // Update local error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Create user with email and password using Auth context
      await signup(formData.email, formData.password);
      
      // Wait a bit for auth state to update and get the user
      setTimeout(async () => {
        if (!user) {
          setError('Error creating user account');
          setLoading(false);
          return;
        }

        try {
          // Create user profile in Firestore
          const userData = {
            username: formData.username,
            email: formData.email,
            age: parseInt(formData.age) || 0,
            gender: formData.gender,
            height: parseFloat(formData.height) || 0,
            weight: parseFloat(formData.weight) || 0,
            joinedDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            theme: 'Dragon Ball', // Default theme
            totalXP: 0,
            streak: 0,
            bestStreak: 0,
            followers: [],
            following: [],
            bio: '',
          };

          await setDoc(doc(db, 'users', user.uid), userData);
          
          // Show success message
          Alert.alert(
            'Success',
            'Account created successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigation is handled by the redirect when isAuthenticated becomes true
                }
              }
            ]
          );
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, 1000);
    } catch (err: any) {
      // Error is set by the auth context and handled via the useEffect above
      setLoading(false);
    }
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: currentTheme.colors.primary,
  };

  const inputStyle = {
    ...styles.input,
    backgroundColor: currentTheme.colors.background,
    color: currentTheme.colors.textPrimary,
    borderColor: currentTheme.colors.border,
  };

  const buttonStyle = {
    ...styles.button,
    backgroundColor: currentTheme.colors.accent,
  };

  const buttonTextStyle = {
    ...styles.buttonText,
    color: currentTheme.colors.textPrimary,
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={containerStyle}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/applogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.appName}>Shonen Ignite</ThemedText>
              <ThemedText style={styles.tagline}>Level Up Your Fitness Journey</ThemedText>
            </View>

            <ThemedText style={styles.title}>Create Account</ThemedText>
            
            <TextInput
              style={inputStyle}
              placeholder="Username"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
            />

            <TextInput
              style={inputStyle}
              placeholder="Email"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={inputStyle}
              placeholder="Password"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <TextInput
              style={inputStyle}
              placeholder="Confirm Password"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />

            <TextInput
              style={inputStyle}
              placeholder="Age"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />

            <View style={[styles.pickerContainer, { 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
            }]}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                style={[styles.picker, { color: currentTheme.colors.textPrimary }]}
                dropdownIconColor={currentTheme.colors.textPrimary}
              >
                <Picker.Item 
                  label="Male" 
                  value="male" 
                  color={currentTheme.colors.textPrimary}
                />
                <Picker.Item 
                  label="Female" 
                  value="female" 
                  color={currentTheme.colors.textPrimary}
                />
                <Picker.Item 
                  label="Other" 
                  value="other" 
                  color={currentTheme.colors.textPrimary}
                />
              </Picker>
            </View>

            <TextInput
              style={inputStyle}
              placeholder="Height (cm)"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={inputStyle}
              placeholder="Weight (kg)"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              keyboardType="numeric"
            />

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <TouchableOpacity 
              style={[buttonStyle, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <ThemedText style={buttonTextStyle}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <ThemedText style={[styles.link, { color: currentTheme.colors.textSecondary }]}>
                Already have an account? Login
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
}); 