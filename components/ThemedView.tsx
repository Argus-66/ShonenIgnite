import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { currentTheme } = useTheme();
  const backgroundColor = currentTheme.colors.primary;

  const combinedStyle = {
    backgroundColor,
    ...(typeof style === 'object' ? style : {}),
  };

  return <View style={combinedStyle} {...otherProps} />;
}
