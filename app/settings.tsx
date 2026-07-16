import Constants from 'expo-constants';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Divider,
  Icon,
  List,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import {
  useLanguagePreference,
  type AppLanguage,
} from '@/src/context/LanguagePreferenceContext';
import { useThemePreference } from '@/src/context/ThemePreferenceContext';
import {
  APP_PRIMARY_COLORS,
  type AppColorScheme,
  type AppPrimaryColor,
} from '@/src/theme/appTheme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'GoNext';
  const theme = useTheme();
  const { language, setLanguage } = useLanguagePreference();
  const { colorScheme, setColorScheme, primaryColor, setPrimaryColor } =
    useThemePreference();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="headlineSmall">{appName}</Text>
      <Text variant="bodyMedium" style={styles.lead}>
        {t('settings.lead')}
      </Text>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>{t('settings.appearance')}</List.Subheader>
        <View style={styles.themeBlock}>
          <Text variant="titleSmall" style={styles.themeLabel}>
            {t('settings.theme')}
          </Text>
          <SegmentedButtons
            value={colorScheme}
            onValueChange={(value) => {
              void setColorScheme(value as AppColorScheme);
            }}
            buttons={[
              {
                value: 'light',
                label: t('settings.light'),
                icon: 'white-balance-sunny',
              },
              {
                value: 'dark',
                label: t('settings.dark'),
                icon: 'moon-waning-crescent',
              },
            ]}
          />
          <Text variant="bodySmall" style={styles.themeHint}>
            {t('settings.darkHint')}
          </Text>

          <Text variant="titleSmall" style={styles.colorLabel}>
            {t('settings.primaryColor')}
          </Text>
          <View
            accessibilityRole="radiogroup"
            style={styles.colorPalette}
          >
            {APP_PRIMARY_COLORS.map((color) => {
              const selected = color.value === primaryColor;

              return (
                <Pressable
                  key={color.value}
                  accessibilityLabel={t(color.labelKey)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  hitSlop={4}
                  onPress={() => {
                    void setPrimaryColor(color.value as AppPrimaryColor);
                  }}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.value },
                    selected && {
                      borderColor: theme.colors.onSurface,
                      borderWidth: 3,
                    },
                  ]}
                >
                  {selected ? <Icon source="check" color="#FFFFFF" size={22} /> : null}
                </Pressable>
              );
            })}
          </View>

          <Text variant="titleSmall" style={styles.colorLabel}>
            {t('settings.language')}
          </Text>
          <SegmentedButtons
            value={language}
            onValueChange={(value) => {
              void setLanguage(value as AppLanguage);
            }}
            buttons={[
              { value: 'ru', label: t('settings.russian') },
              { value: 'en', label: t('settings.english') },
            ]}
          />
        </View>
      </List.Section>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>{t('settings.about')}</List.Subheader>
        <List.Item
          title={t('settings.version')}
          description={version}
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
        <List.Item
          title={t('settings.offline')}
          description={t('settings.offlineDescription')}
          left={(props) => <List.Icon {...props} icon="wifi-off" />}
        />
        <List.Item
          title={t('settings.noRegistration')}
          description={t('settings.noRegistrationDescription')}
          left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
        />
      </List.Section>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>{t('settings.howTo')}</List.Subheader>
        <View style={styles.guide}>
          <Text variant="titleSmall">{t('settings.guidePlacesTitle')}</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            {t('settings.guidePlaces')}
          </Text>

          <Text variant="titleSmall">{t('settings.guideTripsTitle')}</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            {t('settings.guideTrips')}
          </Text>

          <Text variant="titleSmall">{t('settings.guideNextTitle')}</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            {t('settings.guideNext')}
          </Text>
        </View>
      </List.Section>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>{t('settings.storage')}</List.Subheader>
        <List.Item
          title={t('settings.database')}
          description={t('settings.databaseDescription')}
          left={(props) => <List.Icon {...props} icon="database-outline" />}
        />
        <List.Item
          title={t('settings.photographs')}
          description={t('settings.photographsDescription')}
          left={(props) => <List.Icon {...props} icon="image-outline" />}
        />
      </List.Section>

      <Text variant="bodySmall" style={styles.footer}>
        {t('settings.footer')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 4,
  },
  lead: {
    opacity: 0.8,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  themeBlock: {
    paddingHorizontal: 16,
    gap: 10,
  },
  themeLabel: {
    marginBottom: 2,
  },
  themeHint: {
    opacity: 0.65,
  },
  colorLabel: {
    marginTop: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guide: {
    paddingHorizontal: 16,
    gap: 8,
  },
  guideText: {
    opacity: 0.75,
    marginBottom: 8,
  },
  footer: {
    opacity: 0.55,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
