import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  variant?: 'headline' | 'subtitle' | 'body1' | 'body2' | 'caption' | 'button';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, type = 'default', variant, ...otherProps } = props;
  const { currentTheme } = useTheme();
  
  let variantStyle = {};
  
  // Add variant styles if provided
  if (variant) {
    switch (variant) {
      case 'headline':
        variantStyle = { fontSize: 24, fontWeight: 'bold' };
        break;
      case 'subtitle':
        variantStyle = { fontSize: 18, fontWeight: 'bold' };
        break;
      case 'body1':
        variantStyle = { fontSize: 16 };
        break;
      case 'body2':
        variantStyle = { fontSize: 14 };
        break;
      case 'caption':
        variantStyle = { fontSize: 12, opacity: 0.7 };
        break;
      case 'button':
        variantStyle = { fontSize: 16, fontWeight: 'bold' };
        break;
    }
  }
  
  let typeStyle = {};
  
  switch (type) {
    case 'title':
      typeStyle = styles.title;
      break;
    case 'defaultSemiBold':
      typeStyle = styles.defaultSemiBold;
      break;
    case 'subtitle':
      typeStyle = styles.subtitle;
      break;
    case 'link':
      typeStyle = styles.link;
      break;
    default:
      typeStyle = styles.default;
  }
  
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text 
      style={[typeStyle, variantStyle, { color }, style]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
