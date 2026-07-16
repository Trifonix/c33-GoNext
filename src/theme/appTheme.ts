import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export type AppColorScheme = 'light' | 'dark';

export const APP_PRIMARY = '#1B5E4A';
export const APP_SECONDARY = '#3D6B5A';

export function createAppTheme(colorScheme: AppColorScheme): MD3Theme {
  const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: APP_PRIMARY,
      secondary: APP_SECONDARY,
      // В светлой теме фон прозрачный, чтобы было видно ImageBackground.
      background: colorScheme === 'light' ? 'transparent' : base.colors.background,
    },
  };
}
