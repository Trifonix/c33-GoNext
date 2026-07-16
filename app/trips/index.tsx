import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, Text } from 'react-native-paper';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { listTrips } from '@/src/db/tripsRepo';
import type { Trip } from '@/src/types';
import { formatDateRange } from '@/src/utils/date';

function TripListItem({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const visitedCount = trip.places.filter((p) => p.visited).length;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.titleRow}>
          <Text variant="titleMedium" style={styles.title}>
            {trip.title}
          </Text>
          {trip.current ? <Chip compact icon="star">Текущая</Chip> : null}
        </View>
        {trip.description ? (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {trip.description}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={styles.meta}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          Мест в маршруте: {trip.places.length}
          {trip.places.length > 0 ? ` · посещено ${visitedCount}` : ''}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function TripsListScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      setTrips(await listTrips());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <EmptyState
          title="Пока нет поездок"
          message="Создайте поездку, добавьте места и ведите дневник по мере посещений."
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripListItem trip={item} onPress={() => router.push(`/trips/${item.id}`)} />
          )}
        />
      )}

      <FAB
        icon="plus"
        label="Создать"
        style={styles.fab}
        onPress={() => router.push('/trips/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 88,
    gap: 12,
  },
  card: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  description: {
    marginTop: 4,
    opacity: 0.75,
  },
  meta: {
    marginTop: 6,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
