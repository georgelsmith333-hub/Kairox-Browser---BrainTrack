// @ts-ignore React Native is provided by runtime consumers, not the web preview package.
import { useColorScheme } from 'react-native';
import { colorsForScheme, nativeTheme } from '../lib/native-theme';

export function useColors() {
  const scheme = useColorScheme() === 'light' ? 'light' : 'dark';
  return {
    ...colorsForScheme(scheme),
    radius: nativeTheme.radius,
    spacing: nativeTheme.spacing,
    scheme,
  };
}