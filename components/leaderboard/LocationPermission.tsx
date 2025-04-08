import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface LocationPermissionProps {
  onRequestPermission: () => void;
}

export const LocationPermission = ({ onRequestPermission }: LocationPermissionProps) => {
  const { currentTheme } = useTheme();

  return (
    <View style={styles.permissionContainer}>
      <MaterialCommunityIcons 
        name="map-marker-off" 
        size={64} 
        color={currentTheme.colors.error} 
      />
      
      <ThemedText style={styles.permissionText}>
        Location permission is needed to show nearby users
      </ThemedText>
      
      <TouchableOpacity 
        style={[styles.permissionButton, { backgroundColor: currentTheme.colors.accent }]}
        onPress={onRequestPermission}
      >
        <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  permissionContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.8,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 