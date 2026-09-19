import { tokens } from '../generated/tokens';

export type ColorScheme = 'light' | 'dark';

export const nativeTheme = {
  colors: tokens.color,
  radius: Number.parseFloat(tokens.radius) * 16,
  spacing: Number.parseFloat(tokens.spacing) * 16,
  fonts: {
    sans: 'Inter',
    mono: 'JetBrainsMono',
  },
} as const;

export function colorsForScheme(scheme: ColorScheme) {
  return nativeTheme.colors[scheme];
}