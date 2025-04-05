import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface BioSectionProps {
  bio: string;
}

export const BioSection = ({ bio }: BioSectionProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.bioSection, { 
      backgroundColor: currentTheme.colors.card,
      borderColor: currentTheme.colors.accent,
      borderWidth: 1,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12
    }]}>
      <View style={styles.bioHeader}>
        <MaterialCommunityIcons 
          name="card-text-outline" 
          size={20} 
          color={currentTheme.colors.accent} 
        />
        <ThemedText style={[styles.bioTitle, { color: currentTheme.colors.accent, marginLeft: 8 }]}>
          Bio
        </ThemedText>
      </View>
      <ThemedText style={styles.bioText}>
        {bio || 'No bio yet'}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  bioSection: {
    padding: 16,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 16,
  }
}); 