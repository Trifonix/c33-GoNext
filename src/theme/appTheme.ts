import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export type AppColorScheme = 'light' | 'dark';

export const APP_PRIMARY_COLORS = [
  { value: '#1B5E4A', label: 'Изумрудный' },
  { value: '#1565C0', label: 'Синий' },
  { value: '#283593', label: 'Индиго' },
  { value: '#6A1B9A', label: 'Фиолетовый' },
  { value: '#AD1457', label: 'Розовый' },
  { value: '#C62828', label: 'Красный' },
  { value: '#EF6C00', label: 'Оранжевый' },
  { value: '#8D6E00', label: 'Янтарный' },
  { value: '#00838F', label: 'Бирюзовый' },
  { value: '#455A64', label: 'Серо-синий' },
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
