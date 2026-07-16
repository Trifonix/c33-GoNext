import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppSnackbar } from '@/src/components/AppSnackbar';
import { LoadingState } from '@/src/components/LoadingState';
import { NotFoundState } from '@/src/components/NotFoundState';
import { PlacePicker } from '@/src/components/PlacePicker';
import { TripRouteItem } from '@/src/components/TripRouteItem';
import {
  addPlaceToTrip,
  markTripPlaceVisited,
  moveTripPlace,
  removePlaceFromTrip,
} from '@/src/db/tripPlacesRepo';
import { clearCurrentTrip, deleteTrip, getTripById, setCurrentTrip } from '@/src/db/tripsRepo';
import { listEnrichedTripPlaces, type TripPlaceEnriched } from '@/src/services/tripPlaces';
import type { Trip } from '@/src/types';
import { formatDateRange } from '@/src/utils/date';

type ViewMode = 'plan' | 'diary';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [route, setRoute] = useState<TripPlaceEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('plan');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTrip = useCallback(async () => {
    if (!id) {
      setTrip(null);
      setRoute([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tripData, routeData] = await Promise.all([
        getTripById(id),
        listEnrichedTripPlaces(id),
      ]);
      setTrip(tripData);
      setRoute(routeData);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTrip();
    }, [loadTrip]),
  );

  const excludePlaceIds = useMemo(() => route.map((item) => item.placeId), [route]);

  const visitedCount = route.filter((item) => item.visited).length;
  const diaryItems = route.filter((item) => item.visited);

  async function handleToggleCurrent(value: boolean) {
    if (!trip) {
      return;
    }
    try {
      if (value) {
        await setCurrentTrip(trip.id);
      } else {
        await clearCurrentTrip();
      }
      await loadTrip();
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.currentUpdateError'));
    }
  }

  async function handleAddPlace(placeId: string) {
    if (!trip) {
      return;
    }
    try {
      await addPlaceToTrip(trip.id, { placeId });
      await loadTrip();
      setSnackbar(t('trips.placeAdded'));
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.addPlaceError'));
    }
  }

  async function handleMove(tripPlaceId: string, direction: 'up' | 'down') {
    setBusyId(tripPlaceId);
    try {
      await moveTripPlace(tripPlaceId, direction);
      await loadTrip();
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.reorderError'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleVisited(tripPlaceId: string, visited: boolean) {
    setBusyId(tripPlaceId);
    try {
      await markTripPlaceVisited(tripPlaceId, visited);
      await loadTrip();
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.statusError'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(tripPlaceId: string) {
    setBusyId(tripPlaceId);
    try {
      await removePlaceFromTrip(tripPlaceId);
      await loadTrip();
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.removePlaceError'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTrip() {
    if (!trip) {
      return;
    }
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      setDeleteVisible(false);
      router.replace('/trips');
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('trips.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!trip) {
    return <NotFoundState title={t('trips.notFound')} onBack={() => router.back()} />;
  }

  const visibleRoute = viewMode === 'plan' ? route : diaryItems;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineSmall">{trip.title}</Text>
          {trip.current ? <Chip icon="star">{t('common.currentTrip')}</Chip> : null}
        </View>

        {trip.description ? (
          <Text variant="bodyLarge" style={styles.description}>
            {trip.description}
          </Text>
        ) : null}

        <Text variant="bodyMedium" style={styles.meta}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {t('trips.visitedProgress', { visited: visitedCount, total: route.length })}
        </Text>

        <View style={styles.switchRow}>
          <Text variant="bodyLarge">{t('trips.makeCurrent')}</Text>
          <Switch value={trip.current} onValueChange={handleToggleCurrent} />
        </View>

        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: 'plan', label: t('trips.plan'), icon: 'map-marker-path' },
            { value: 'diary', label: t('trips.diary'), icon: 'book-open-variant' },
          ]}
        />

        {viewMode === 'diary' && diaryItems.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyRoute}>
            {t('trips.diaryEmpty')}
          </Text>
        ) : null}

        {visibleRoute.map((item) => (
          <TripRouteItem
            key={item.id}
            tripPlace={item}
            place={item.place}
            showDiary={viewMode === 'diary'}
            canMoveUp={viewMode === 'plan' && item.order > 0}
            canMoveDown={viewMode === 'plan' && item.order < route.length - 1}
            onMoveUp={() => handleMove(item.id, 'up')}
            onMoveDown={() => handleMove(item.id, 'down')}
            onToggleVisited={(visited) => handleToggleVisited(item.id, visited)}
            onPress={() => router.push(`/trips/${trip.id}/place/${item.id}`)}
            onRemove={() => handleRemove(item.id)}
          />
        ))}

        {viewMode === 'plan' ? (
          <View style={styles.addActions}>
            <Button mode="contained" icon="plus" onPress={() => setPickerVisible(true)}>
              {t('trips.addFromDatabase')}
            </Button>
            <Button
              mode="outlined"
              icon="map-marker-plus"
              onPress={() =>
                router.push({ pathname: '/places/new', params: { tripId: trip.id } })
              }
            >
              {t('trips.createNewPlace')}
            </Button>
          </View>
        ) : null}

        <View style={styles.tripActions}>
          <Button mode="outlined" icon="pencil" onPress={() => router.push(`/trips/${trip.id}/edit`)}>
            {t('trips.editTrip')}
          </Button>
          <Button mode="outlined" icon="delete" textColor="#B00020" onPress={() => setDeleteVisible(true)}>
            {t('trips.deleteTrip')}
          </Button>
        </View>
      </ScrollView>

      <PlacePicker
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        excludeIds={excludePlaceIds}
        title={t('trips.addPlaceTitle')}
        onSelect={(place) => handleAddPlace(place.id)}
      />

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>{t('trips.deleteTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {t('trips.deleteMessage', { title: trip.title })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)} disabled={deleting}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleDeleteTrip} loading={deleting} textColor="#B00020">
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <AppSnackbar message={snackbar} onDismiss={() => setSnackbar(null)} />

      {busyId ? (
        <Portal>
          <View style={styles.busyOverlay} pointerEvents="none">
            <ActivityIndicator size="small" />
          </View>
        </Portal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  description: {
    opacity: 0.85,
  },
  meta: {
    opacity: 0.65,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyRoute: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  addActions: {
    gap: 8,
    marginTop: 8,
  },
  tripActions: {
    gap: 8,
    marginTop: 16,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
