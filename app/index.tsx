import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';

import { useThemePreference } from '@/src/context/ThemePreferenceContext';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colorScheme } = useThemePreference();
  const headerBackground =
    colorScheme === 'dark' ? theme.colors.elevation.level2 : 'rgba(255, 255, 255, 0.85)';

  return (
    <View style={styles.container}>
      <Appbar.Header elevated style={{ backgroundColor: headerBackground }}>
        <Appbar.Content title="GoNext" subtitle="Дневник туриста" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.brand}>
          GoNext
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          От мест — к поездкам — к дневному маршруту
        </Text>

        <View style={styles.buttons}>
          <Button mode="contained" onPress={() => router.push('/places')} contentStyle={styles.buttonContent}>
            Места
          </Button>
          <Button mode="contained" onPress={() => router.push('/trips')} contentStyle={styles.buttonContent}>
            Поездки
          </Button>
          <Button mode="contained" onPress={() => router.push('/next')} contentStyle={styles.buttonContent}>
            Следующее место
          </Button>
          <Button mode="outlined" onPress={() => router.push('/settings')} contentStyle={styles.buttonContent}>
            Настройки
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  brand: {
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  buttons: {
    gap: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
