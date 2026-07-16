import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { listPlaces } from '@/src/db/placesRepo';
import type { Place } from '@/src/types';
import { formatCoordinates } from '@/src/utils/coordinates';

function PlaceListItem({ place, onPress }: { place: Place; onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium">{place.name}</Text>
        {place.description ? (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {place.description}
          </Text>
        ) : null}
        <View style={styles.chips}>
          {place.visitlater ? <Chip compact icon="map-marker-path">{t('places.visit')}</Chip> : null}
          {place.liked ? <Chip compact icon="heart">{t('places.like')}</Chip> : null}
          {place.photos.length > 0 ? (
            <Chip compact icon="image">{t('common.photoCount', { count: place.photos.length })}</Chip>
          ) : null}
        </View>
        <Text variant="bodySmall" style={styles.coords}>
          {formatCoordinates(place.dd)}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function PlacesListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      setPlaces(await listPlaces());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [loadPlaces]),
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {places.length === 0 ? (
        <EmptyState title={t('places.emptyTitle')} message={t('places.emptyMessage')} />
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PlaceListItem
              place={item}
              onPress={() => router.push(`/places/${item.id}`)}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        label={t('places.add')}
        style={styles.fab}
        onPress={() => router.push('/places/new')}
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
  description: {
    marginTop: 4,
    opacity: 0.75,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  coords: {
    marginTop: 8,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
