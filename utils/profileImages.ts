import { ImageSourcePropType } from 'react-native';

// Map of theme names to their corresponding profile images
const themeToImageMap: Record<string, ImageSourcePropType> = {
  'Dragon Ball': require('@/assets/images/profile/dragonball.jpg'),
  'One Piece': require('@/assets/images/profile/onepiece.jpg'),
  'Naruto': require('@/assets/images/profile/naruto.jpg'),
  'Solo Leveling': require('@/assets/images/profile/sololeveling.png'),
  'One Punch Man': require('@/assets/images/profile/onepunchman.jpg'),
  'Attack on Titan': require('@/assets/images/profile/attackontitan (1).jpg'),
  'Jujutsu Kaisen': require('@/assets/images/profile/jujutsukaisen.png'),
  'Baki': require('@/assets/images/profile/baki.jpg'),
  'Black Clover': require('@/assets/images/profile/blackclover.jpg'),
  // Default image for themes without a specific image
  'default': require('@/assets/images/profile/dragonball.jpg')
};

/**
 * Get profile image based on theme name
 * @param themeName The name of the theme
 * @returns The corresponding profile image
 */
export const getProfileImageByTheme = (themeName: string): ImageSourcePropType => {
  return themeToImageMap[themeName] || themeToImageMap.default;
};

export default getProfileImageByTheme; 