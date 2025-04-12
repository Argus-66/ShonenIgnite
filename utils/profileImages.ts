import { ImageSourcePropType } from 'react-native';
import { storage } from '@/config/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Map of theme names to their corresponding file names in Firebase Storage
const themeToFileMap: Record<string, string> = {
  'Dragon Ball': 'dragonball.jpg',
  'One Piece': 'onepiece.jpg',
  'Naruto': 'naruto.jpg',
  'Solo Leveling': 'sololeveling.png',
  'One Punch': 'onepunchman.jpg',
  'Attack on Titan': 'attackontitan.jpg',
  'Jujutsu Kaisen': 'jujutsukaisen.png',
  'Baki': 'baki.jpg',
  'Black Clover': 'blackclover.jpg',
  'Hajime no Ippo': 'hajimenoippo.jpeg',
  'Megalo Box': 'megalobox.jpg',
  // Add more mappings as needed
};

// Cache for storing downloaded URLs
const urlCache: Record<string, string> = {};

// Default image path for fallback (kept as local asset for reliability)
const defaultImage = require('@/assets/images/profile/dragonball.jpg');

/**
 * Get profile image based on theme name
 * @param themeName The name of the theme
 * @returns The corresponding profile image
 */
export const getProfileImageByTheme = async (themeName: string): Promise<ImageSourcePropType> => {
  try {
    // If the theme doesn't exist in our mapping, return default
    if (!themeToFileMap[themeName]) {
      return defaultImage;
    }

    // Check if we've already cached this URL
    if (urlCache[themeName]) {
      return { uri: urlCache[themeName] };
    }

    // Get the file name for this theme
    const fileName = themeToFileMap[themeName];
    
    // Create a reference to the file in Firebase Storage
    const imageRef = ref(storage, `themes/${fileName}`);
    
    // Get the download URL
    const url = await getDownloadURL(imageRef);
    
    // Cache the URL for future use
    urlCache[themeName] = url;
    
    // Return the image source with the URL
    return { uri: url };
  } catch (error) {
    console.error(`Error fetching profile image for theme "${themeName}":`, error);
    return defaultImage;
  }
};

/**
 * Get profile image synchronously (from cache or default)
 * Use this when you can't use async/await
 */
export const getProfileImageByThemeSync = (themeName: string): ImageSourcePropType => {
  // If we have a cached URL, use it
  if (urlCache[themeName]) {
    return { uri: urlCache[themeName] };
  }
  
  // Otherwise return the default image
  return defaultImage;
};

/**
 * Preload all theme images to cache
 * Call this when the app initializes
 */
export const preloadThemeImages = async (): Promise<void> => {
  const themes = Object.keys(themeToFileMap);
  
  const promises = themes.map(theme => 
    getProfileImageByTheme(theme)
      .catch(error => {
        console.error(`Failed to preload theme "${theme}":`, error);
        return null;
      })
  );
  
  await Promise.all(promises);
  console.log('Theme images preloaded successfully');
};

// List of all available themes
export const availableThemes = Object.keys(themeToFileMap);

export default getProfileImageByTheme; 