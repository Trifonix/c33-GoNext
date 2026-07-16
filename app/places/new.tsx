import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PlaceForm } from '@/src/components/PlaceForm';
import { addPlaceToTrip } from '@/src/db/tripPlacesRepo';
import { createPlace } from '@/src/db/placesRepo';

export default function NewPlaceScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();

  return (
    <View style={styles.container}>
      <PlaceForm
        submitLabel={tripId ? 'Создать и добавить' : 'Создать'}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          const place = await createPlace(input);
          if (tripId) {
            await addPlaceToTrip(tripId, { placeId: place.id });
            router.replace(`/trips/${tripId}`);
          } else {
            router.replace(`/places/${place.id}`);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
