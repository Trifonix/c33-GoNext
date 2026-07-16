import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export type AppColorScheme = 'light' | 'dark';

export const APP_PRIMARY_COLORS = [
  { value: '#1B5E4A', labelKey: 'colors.emerald' },
  { value: '#1565C0', labelKey: 'colors.blue' },
  { value: '#283593', labelKey: 'colors.indigo' },
  { value: '#6A1B9A', labelKey: 'colors.purple' },
  { value: '#AD1457', labelKey: 'colors.pink' },
  { value: '#C62828', labelKey: 'colors.red' },
  { value: '#EF6C00', labelKey: 'colors.orange' },
  { value: '#8D6E00', labelKey: 'colors.amber' },
  { value: '#00838F', labelKey: 'colors.teal' },
  { value: '#455A64', labelKey: 'colors.blueGrey' },
] as const;

export type AppPrimaryColor = (typeof APP_PRIMARY_COLORS)[number]['value'];

export const DEFAULT_PRIMARY_COLOR: AppPrimaryColor = APP_PRIMARY_COLORS[0].value;
export const APP_SECONDARY = '#3D6B5A';

export function createAppTheme(
  colorScheme: AppColorScheme,
  primaryColor: AppPrimaryColor,
): MD3Theme {
  const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: primaryColor,
      secondary: APP_SECONDARY,
      // В светлой теме фон прозрачный, чтобы было видно ImageBackground.
      background: colorScheme === 'light' ? 'transparent' : base.colors.background,
    },
  };
}
