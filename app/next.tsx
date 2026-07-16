import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { AppSnackbar } from '@/src/components/AppSnackbar';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { PhotoGallery } from '@/src/components/PhotoGallery';
import { markTripPlaceVisited } from '@/src/db/tripPlacesRepo';
import { openInNavigator, openOnMap } from '@/src/services/maps';
import { getNextPlace, type NextPlaceResult } from '@/src/services/nextPlace';
import { formatCoordinates } from '@/src/utils/coordinates';

export default function NextPlaceScreen() {
  const router = useRouter();
  const [result, setResult] = useState<NextPlaceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await getNextPlace());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleOpenMap() {
    if (result?.status !== 'ok' || !result.place.dd) {
      setSnackbar('У места не указаны координаты');
      return;
    }
    try {
      await openOnMap(result.place.dd, result.place.name);
    } catch {
      setSnackbar('Не удалось открыть карту');
    }
  }

  async function handleOpenNavigator() {
    if (result?.status !== 'ok' || !result.place.dd) {
      setSnackbar('У места не указаны координаты');
      return;
    }
    try {
      await openInNavigator(result.place.dd, result.place.name);
    } catch {
      setSnackbar('Не удалось открыть навигатор');
    }
  }

  async function handleMarkVisited() {
    if (result?.status !== 'ok') {
      return;
    }
    setMarking(true);
    try {
      await markTripPlaceVisited(result.tripPlace.id, true);
      setSnackbar('Место отмечено как посещённое');
      await load();
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!result || result.status === 'no_current_trip') {
    return (
      <EmptyState
        title="Нет текущей поездки"
        message="Выберите поездку и отметьте её как текущую — тогда здесь появится следующее место по маршруту."
      >
        <Button mode="contained" onPress={() => router.push('/trips')}>
          Перейти к поездкам
        </Button>
      </EmptyState>
    );
  }

  if (result.status === 'all_visited') {
    return (
      <EmptyState
        title="Маршрут пройден"
        message={`В поездке «${result.trip.title}» все места уже посещены.`}
      >
        <Button mode="contained" onPress={() => router.push(`/trips/${result.trip.id}`)}>
          Открыть поездку
        </Button>
        <Button mode="outlined" onPress={() => router.push('/trips')}>
          К списку поездок
        </Button>
      </EmptyState>
    );
  }

  if (result.status === 'place_missing') {
    return (
      <EmptyState
        title="Место не найдено"
        message="Следующая точка маршрута ссылается на удалённое место. Откройте поездку и обновите маршрут."
      >
        <Button mode="contained" onPress={() => router.push(`/trips/${result.trip.id}`)}>
          Открыть поездку
        </Button>
      </EmptyState>
    );
  }

  const { trip, tripPlace, place } = result;
  const hasCoords = Boolean(place.dd);

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.tripCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.tripLabel}>
              Текущая поездка
            </Text>
            <Text variant="titleMedium">{trip.title}</Text>
          </Card.Content>
        </Card>

        <View style={styles.header}>
          <Chip icon="map-marker" compact>
            {tripPlace.order + 1} из {trip.places.length}
          </Chip>
        </View>

        <Text variant="headlineMedium">{place.name}</Text>

        {place.description ? (
          <Text variant="bodyLarge" style={styles.description}>
            {place.description}
          </Text>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleSmall">Координаты</Text>
          <Text variant="bodyLarge">{formatCoordinates(place.dd)}</Text>
        </View>

        {place.photos.length > 0 ? (
          <View style={styles.section}>
            <Text variant="titleSmall">Фото места</Text>
            <PhotoGallery photos={place.photos} />
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button mode="contained" icon="map" onPress={handleOpenMap} disabled={!hasCoords}>
            Открыть на карте
          </Button>
          <Button mode="contained" icon="navigation" onPress={handleOpenNavigator} disabled={!hasCoords}>
            Открыть в навигаторе
          </Button>
          <Button
            mode="outlined"
            icon="check-circle"
            onPress={handleMarkVisited}
            loading={marking}
            disabled={marking}
          >
            Отметить посещённым
          </Button>
          <Button mode="text" onPress={() => router.push(`/trips/${trip.id}/place/${tripPlace.id}`)}>
            Заметки и фото визита
          </Button>
          <Button mode="text" onPress={() => router.push(`/trips/${trip.id}`)}>
            Весь маршрут поездки
          </Button>
        </View>

        {!hasCoords ? (
          <Text variant="bodySmall" style={styles.warning}>
            Добавьте координаты месту, чтобы открыть карту и навигатор.
          </Text>
        ) : null}
      </ScrollView>

      <AppSnackbar message={snackbar} onDismiss={() => setSnackbar(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  tripCard: {
    backgroundColor: '#E8F5F0',
  },
  tripLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
  },
  description: {
    opacity: 0.85,
  },
  section: {
    gap: 4,
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  warning: {
    opacity: 0.65,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
