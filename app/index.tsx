import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

export default function LandingPage() {
  const { currentTheme } = useTheme();

  const containerStyle = {
    ...styles.container,
    backgroundColor: currentTheme.colors.primary,
  };

  const titleStyle = {
    ...styles.title,
    color: currentTheme.colors.textPrimary,
  };

  const subtitleStyle = {
    ...styles.subtitle,
    color: currentTheme.colors.textSecondary,
  };

  const loginButtonStyle = {
    ...styles.button,
    backgroundColor: currentTheme.colors.accent,
  };

  const signupButtonStyle = {
    ...styles.button,
    backgroundColor: currentTheme.colors.accent2,
  };

  const buttonTextStyle = {
    ...styles.buttonText,
    color: currentTheme.colors.textPrimary,
  };

  return (
    <ThemedView style={containerStyle}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <ThemedText style={titleStyle}>
          FitnessFreak
        </ThemedText>
        <ThemedText style={subtitleStyle}>
          Level Up Your Fitness Journey
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={loginButtonStyle}>
              <ThemedText style={buttonTextStyle}>
                Login
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <Link href="/auth/signup" asChild>
            <TouchableOpacity style={signupButtonStyle}>
              <ThemedText style={buttonTextStyle}>
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </Link>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 