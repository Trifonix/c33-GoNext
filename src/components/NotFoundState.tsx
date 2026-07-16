import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

type Props = {
  title?: string;
  message?: string;
  onBack?: () => void;
  backLabel?: string;
};

export function NotFoundState({
  title = 'Не найдено',
  message,
  onBack,
  backLabel = 'Назад',
}: Props) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {onBack ? (
        <Button mode="contained" onPress={onBack} style={styles.button}>
          {backLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 4,
  },
});
