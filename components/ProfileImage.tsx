import React, { useState, useEffect } from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator } from 'react-native';
import { getProfileImageByTheme, getProfileImageByThemeSync } from '@/utils/profileImages';
import { useTheme } from '@/contexts/ThemeContext';
import { ImageSourcePropType } from 'react-native';

interface ProfileImageProps {
  themeName: string;
  style?: StyleProp<ImageStyle>;
  size?: number;
  showPlaceholder?: boolean;
}

export const ProfileImage = ({ 
  themeName, 
  style, 
  size = 50, 
  showPlaceholder = true 
}: ProfileImageProps) => {
  const { currentTheme } = useTheme();
  // Start with sync version to avoid layout shift
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    getProfileImageByThemeSync(themeName)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        // Load the image from Firebase Storage
        const source = await getProfileImageByTheme(themeName);
        if (mounted) {
          setImageSource(source);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Error loading profile image for theme "${themeName}":`, error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Load the image when the component mounts or themeName changes
    loadImage();
    
    return () => {
      mounted = false;
    };
  }, [themeName]);
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2, // Make it circular
    overflow: 'hidden',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
  
  const imageStyle = [
    {
      width: size,
      height: size,
    },
    style
  ];
  
  return (
    <View style={containerStyle}>
      {loading && showPlaceholder ? (
        <ActivityIndicator 
          color={currentTheme.colors.accent}
          size="small"
        />
      ) : (
        <Image
          source={imageSource}
          style={imageStyle}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default ProfileImage; 