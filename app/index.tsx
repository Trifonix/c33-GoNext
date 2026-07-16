import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useThemePreference } from '@/src/context/ThemePreferenceContext';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { colorScheme } = useThemePreference();
  const headerBackground =
    colorScheme === 'dark' ? theme.colors.elevation.level2 : 'rgba(255, 255, 255, 0.85)';

  return (
    <View style={styles.container}>
      <Appbar.Header elevated style={{ backgroundColor: headerBackground }}>
        <Appbar.Content title="GoNext" subtitle={t('home.subtitle')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.brand}>
          GoNext
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {t('home.tagline')}
        </Text>

        <View style={styles.buttons}>
          <Button mode="contained" onPress={() => router.push('/places')} contentStyle={styles.buttonContent}>
            {t('common.places')}
          </Button>
          <Button mode="contained" onPress={() => router.push('/trips')} contentStyle={styles.buttonContent}>
            {t('common.trips')}
          </Button>
          <Button mode="contained" onPress={() => router.push('/next')} contentStyle={styles.buttonContent}>
            {t('navigation.nextPlace')}
          </Button>
          <Button mode="outlined" onPress={() => router.push('/settings')} contentStyle={styles.buttonContent}>
            {t('common.settings')}
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
