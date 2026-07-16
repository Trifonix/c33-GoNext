import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { PlaceForm } from '@/src/components/PlaceForm';
import { getPlaceById, updatePlace } from '@/src/db/placesRepo';
import type { Place } from '@/src/types';

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">{t('places.notFound')}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlaceForm
        initial={place}
        submitLabel={t('common.save')}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await updatePlace(place.id, input);
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
