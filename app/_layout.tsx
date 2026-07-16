import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { PaperProvider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { ScreenBackground } from '@/src/components/ScreenBackground';
import { DatabaseProvider } from '@/src/context/DatabaseContext';
import { LanguagePreferenceProvider } from '@/src/context/LanguagePreferenceContext';
import {
  ThemePreferenceProvider,
  useThemePreference,
} from '@/src/context/ThemePreferenceContext';
import '@/src/i18n';
import { createAppTheme } from '@/src/theme/appTheme';

function ThemedRoot() {
  const { t } = useTranslation();
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
            <Stack.Screen name="places/index" options={{ title: t('navigation.places') }} />
            <Stack.Screen name="places/new" options={{ title: t('navigation.newPlace') }} />
            <Stack.Screen name="places/[id]" options={{ title: t('navigation.place') }} />
            <Stack.Screen name="places/[id]/edit" options={{ title: t('navigation.edit') }} />
            <Stack.Screen name="trips/index" options={{ title: t('navigation.trips') }} />
            <Stack.Screen name="trips/new" options={{ title: t('navigation.newTrip') }} />
            <Stack.Screen name="trips/[id]" options={{ title: t('navigation.trip') }} />
            <Stack.Screen name="trips/[id]/edit" options={{ title: t('navigation.edit') }} />
            <Stack.Screen
              name="trips/[id]/place/[tripPlaceId]"
              options={{ title: t('navigation.diaryEntry') }}
            />
            <Stack.Screen name="next" options={{ title: t('navigation.nextPlace') }} />
            <Stack.Screen name="settings" options={{ title: t('navigation.settings') }} />
          </Stack>
        </ScreenBackground>
      </DatabaseProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguagePreferenceProvider>
      <ThemePreferenceProvider>
        <ThemedRoot />
      </ThemePreferenceProvider>
    </LanguagePreferenceProvider>
  );
}
