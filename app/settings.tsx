import Constants from 'expo-constants';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'GoNext';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="headlineSmall">{appName}</Text>
      <Text variant="bodyMedium" style={styles.lead}>
        Дневник туриста — планируйте поездки и ведите маршрут офлайн.
      </Text>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>О приложении</List.Subheader>
        <List.Item
          title="Версия"
          description={version}
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
        <List.Item
          title="Работа офлайн"
          description="Интернет не требуется. Все данные хранятся на устройстве."
          left={(props) => <List.Icon {...props} icon="wifi-off" />}
        />
        <List.Item
          title="Без регистрации"
          description="Нет аккаунтов и серверной части — только локальная база SQLite и фото."
          left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
        />
      </List.Section>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>Как пользоваться</List.Subheader>
        <View style={styles.guide}>
          <Text variant="titleSmall">1. Места</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            Сохраняйте интересные места с описанием, координатами и фото — независимо от поездок.
          </Text>

          <Text variant="titleSmall">2. Поездки</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            Создайте маршрут с датами, добавьте места, отметьте одну поездку как текущую. Ведите
            дневник: заметки и фото к каждому визиту.
          </Text>

          <Text variant="titleSmall">3. Следующее место</Text>
          <Text variant="bodyMedium" style={styles.guideText}>
            Быстрый доступ к следующей точке текущей поездки — карта, навигатор и отметка «посещено».
          </Text>
        </View>
      </List.Section>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>Хранение данных</List.Subheader>
        <List.Item
          title="База данных"
          description="SQLite — места, поездки, маршруты и записи дневника."
          left={(props) => <List.Icon {...props} icon="database-outline" />}
        />
        <List.Item
          title="Фотографии"
          description="Локальный каталог приложения; пути сохраняются в базе."
          left={(props) => <List.Icon {...props} icon="image-outline" />}
        />
      </List.Section>

      <Text variant="bodySmall" style={styles.footer}>
        MVP GoNext · экспорт, синхронизация и совместные поездки — в планах на будущее.
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
