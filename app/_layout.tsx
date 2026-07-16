import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { PaperProvider } from 'react-native-paper';

import { ScreenBackground } from '@/src/components/ScreenBackground';
import { DatabaseProvider } from '@/src/context/DatabaseContext';
import {
  ThemePreferenceProvider,
  useThemePreference,
} from '@/src/context/ThemePreferenceContext';
import { createAppTheme } from '@/src/theme/appTheme';

function ThemedRoot() {
  const { colorScheme, primaryColor } = useThemePreference();
  const theme = useMemo(
    () => createAppTheme(colorScheme, primaryColor),
    [colorScheme, primaryColor],
  );
  const isDark = colorScheme === 'dark';

  return (
    <PaperProvider theme={theme}>
      <DatabaseProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ScreenBackground>
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: isDark ? theme.colors.background : 'transparent',
              },
              headerStyle: {
                backgroundColor: isDark
                  ? theme.colors.elevation.level2
                  : 'rgba(255, 255, 255, 0.85)',
              },
              headerTintColor: theme.colors.onSurface,
              headerTitleStyle: { color: theme.colors.onSurface },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="places/index" options={{ title: 'Места' }} />
            <Stack.Screen name="places/new" options={{ title: 'Новое место' }} />
            <Stack.Screen name="places/[id]" options={{ title: 'Место' }} />
            <Stack.Screen name="places/[id]/edit" options={{ title: 'Редактирование' }} />
            <Stack.Screen name="trips/index" options={{ title: 'Поездки' }} />
            <Stack.Screen name="trips/new" options={{ title: 'Новая поездка' }} />
            <Stack.Screen name="trips/[id]" options={{ title: 'Поездка' }} />
            <Stack.Screen name="trips/[id]/edit" options={{ title: 'Редактирование' }} />
            <Stack.Screen
              name="trips/[id]/place/[tripPlaceId]"
              options={{ title: 'Запись дневника' }}
            />
            <Stack.Screen name="next" options={{ title: 'Следующее место' }} />
            <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
          </Stack>
        </ScreenBackground>
      </DatabaseProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <ThemedRoot />
    </ThemePreferenceProvider>
  );
}
