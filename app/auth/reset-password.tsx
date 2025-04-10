import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTheme } from '@/contexts/ThemeContext';

export default function ResetPasswordPage() {
  const { currentTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox for further instructions.');
    } catch (err: any) {
      setError(err.message);
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
        <ThemedText style={styles.title}>Reset Password</ThemedText>
        
        <View style={styles.form}>
          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor={currentTheme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          {success ? <ThemedText style={styles.success}>{success}</ThemedText> : null}

          <TouchableOpacity 
            style={[buttonStyle, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <ThemedText style={buttonTextStyle}>
              {loading ? 'Sending...' : 'Reset Password'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <ThemedText style={[styles.link, { color: currentTheme.colors.textSecondary }]}>
              Back to Login
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
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
  success: {
    color: 'green',
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