import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { currentTheme, isDarkMode } = useTheme();
  
  // Use lightColor/darkColor props if provided, otherwise use theme background
  const backgroundColor = isDarkMode 
    ? (darkColor || currentTheme.colors.background)
    : (lightColor || currentTheme.colors.background);

  const combinedStyle = {
    backgroundColor,
    ...(typeof style === 'object' ? style : {}),
  };

  return <View style={combinedStyle} {...otherProps} />;
}
