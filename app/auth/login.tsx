import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { router, Stack, Redirect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { currentTheme } = useTheme();
  const { login, isAuthenticated, error: authError, isInitializing } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update local error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // If user is already authenticated, redirect to the main app
  if (isAuthenticated && !isInitializing) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Use the login function from the auth context
      await login(formData.email, formData.password);
      
      // Navigation is handled by the redirect above when isAuthenticated becomes true
    } catch (err: any) {
      // Error is set by the auth context and handled via the useEffect above
    } finally {
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.appName}>Shonen Ignite</ThemedText>
            <ThemedText style={styles.tagline}>Level Up Your Fitness Journey</ThemedText>
          </View>
          <ThemedText style={styles.title}>Welcome Back!</ThemedText>
          
          <View style={styles.form}>
            <TextInput
              style={inputStyle}
              placeholder="Email"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
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

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <TouchableOpacity 
              style={[buttonStyle, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <ThemedText style={buttonTextStyle}>
                {loading ? 'Logging in...' : 'Login'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <ThemedText style={[styles.link, { color: currentTheme.colors.textSecondary }]}>
                Don't have an account? Sign up
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/reset-password')}>
              <ThemedText style={[styles.link, { color: currentTheme.colors.textSecondary }]}>
                Forgot Password?
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  form: {
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
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
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
}); 