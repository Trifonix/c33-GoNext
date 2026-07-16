import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { TripPlaceForm } from '@/src/components/TripPlaceForm';
import {
  markTripPlaceVisited,
  updateTripPlaceNotes,
  updateTripPlacePhotos,
} from '@/src/db/tripPlacesRepo';
import { getEnrichedTripPlace } from '@/src/services/tripPlaces';
import type { TripPlaceEnriched } from '@/src/services/tripPlaces';

export default function TripPlaceDiaryScreen() {
  const { id, tripPlaceId } = useLocalSearchParams<{ id: string; tripPlaceId: string }>();
  const router = useRouter();

  const [entry, setEntry] = useState<TripPlaceEnriched | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEntry = useCallback(async () => {
    if (!tripPlaceId) {
      setEntry(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setEntry(await getEnrichedTripPlace(tripPlaceId));
    } finally {
      setLoading(false);
    }
  }, [tripPlaceId]);

  useFocusEffect(
    useCallback(() => {
      loadEntry();
    }, [loadEntry]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!entry || entry.tripId !== id) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">Запись не найдена</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Назад
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TripPlaceForm
        initial={entry}
        placeName={entry.place?.name}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await markTripPlaceVisited(entry.id, input.visited);
          await updateTripPlaceNotes(entry.id, input.notes);
          await updateTripPlacePhotos(entry.id, input.photos);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
});
