import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { TripForm } from '@/src/components/TripForm';
import { getTripById, updateTrip } from '@/src/db/tripsRepo';
import type { Trip } from '@/src/types';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTrip = useCallback(async () => {
    if (!id) {
      setTrip(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setTrip(await getTripById(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTrip();
    }, [loadTrip]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">{t('trips.notFound')}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TripForm
        initial={trip}
        submitLabel={t('common.save')}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await updateTrip(trip.id, input);
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
