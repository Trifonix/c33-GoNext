import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TripForm } from '@/src/components/TripForm';
import { createTrip } from '@/src/db/tripsRepo';

export default function NewTripScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TripForm
        submitLabel="Создать"
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          const trip = await createTrip(input);
          router.replace(`/trips/${trip.id}`);
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
