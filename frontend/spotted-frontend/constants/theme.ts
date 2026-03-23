import { Platform } from 'react-native';

export const Colors = {
  primary: '#0F172A',
  accent: '#F97316',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textMuted: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  white: '#FFFFFF',
  shadow: '#000000',
  gradientEnd: '#FFEDD5',
  transparent: 'transparent'
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace'
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace'
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  }
});
