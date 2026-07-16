import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  Portal,
  Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppSnackbar } from '@/src/components/AppSnackbar';
import { LoadingState } from '@/src/components/LoadingState';
import { NotFoundState } from '@/src/components/NotFoundState';
import { PhotoGallery } from '@/src/components/PhotoGallery';
import { deletePlace, getPlaceById } from '@/src/db/placesRepo';
import { openOnMap } from '@/src/services/maps';
import type { Place } from '@/src/types';
import { formatCoordinates } from '@/src/utils/coordinates';
import { formatDateTime } from '@/src/utils/date';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadPlace = useCallback(async () => {
    if (!id) {
      setPlace(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPlace(await getPlaceById(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPlace();
    }, [loadPlace]),
  );

  async function handleOpenMap() {
    if (!place?.dd) {
      setSnackbar(t('places.noCoordinates'));
      return;
    }
    try {
      await openOnMap(place.dd, place.name);
    } catch {
      setSnackbar(t('places.mapOpenError'));
    }
  }

  async function handleDelete() {
    if (!place) {
      return;
    }
    setDeleting(true);
    try {
      await deletePlace(place.id);
      setDeleteVisible(false);
      router.replace('/places');
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : t('places.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!place) {
    return <NotFoundState title={t('places.notFound')} onBack={() => router.back()} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall">{place.name}</Text>

        <View style={styles.chips}>
          {place.visitlater ? <Chip icon="map-marker-path">{t('places.wantToVisit')}</Chip> : null}
          {place.liked ? <Chip icon="heart">{t('places.liked')}</Chip> : null}
        </View>

        {place.description ? (
          <View style={styles.section}>
            <Text variant="titleSmall">{t('common.description')}</Text>
            <Text variant="bodyLarge">{place.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleSmall">{t('common.coordinates')}</Text>
          <Text variant="bodyLarge">{formatCoordinates(place.dd)}</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall">{t('common.created')}</Text>
          <Text variant="bodyMedium">{formatDateTime(place.createdAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall">{t('common.photos')}</Text>
          <PhotoGallery photos={place.photos} />
        </View>

        <Text variant="bodySmall" style={styles.hint}>
          {t('places.savedHint')}
        </Text>

        <View style={styles.actions}>
          {place.dd ? (
            <Button mode="contained" icon="map" onPress={handleOpenMap}>
              {t('places.openMap')}
            </Button>
          ) : null}
          <Button mode="outlined" icon="pencil" onPress={() => router.push(`/places/${place.id}/edit`)}>
            {t('common.edit')}
          </Button>
          <Button mode="outlined" icon="delete" textColor="#B00020" onPress={() => setDeleteVisible(true)}>
            {t('common.delete')}
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>{t('places.deleteTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {t('places.deleteMessage', { name: place.name })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)} disabled={deleting}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleDelete} loading={deleting} textColor="#B00020">
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    gap: 4,
  },
  hint: {
    opacity: 0.65,
    fontStyle: 'italic',
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
});
