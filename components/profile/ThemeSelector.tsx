import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSelectorProps {
  currentThemeName: string;
  onPress: () => void;
}

export const ThemeSelector = ({ currentThemeName, onPress }: ThemeSelectorProps) => {
  const { currentTheme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.themeButton, { 
        backgroundColor: currentTheme.colors.card,
        borderColor: currentTheme.colors.accent,
        borderWidth: 1,
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center'
      }]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="palette" size={20} color={currentTheme.colors.accent} />
      <ThemedText style={[styles.themeButtonText, { marginLeft: 8 }]}>
        Current Theme: {currentThemeName}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    padding: 16,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 