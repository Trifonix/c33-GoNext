import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import { ScreenBackground } from '@/src/components/ScreenBackground';
import { DatabaseProvider } from '@/src/context/DatabaseContext';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B5E4A',
    secondary: '#3D6B5A',
    background: 'transparent',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <DatabaseProvider>
        <StatusBar style="dark" />
        <ScreenBackground>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: 'transparent' },
              headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0.85)' },
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
