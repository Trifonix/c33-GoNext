import { getPlaceById } from '@/src/db/placesRepo';
import { getTripPlaceById, listTripPlaces } from '@/src/db/tripPlacesRepo';
import type { Place, TripPlace } from '@/src/types';

export type TripPlaceEnriched = TripPlace & {
  place: Place | null;
};

export async function listEnrichedTripPlaces(tripId: string): Promise<TripPlaceEnriched[]> {
  const tripPlaces = await listTripPlaces(tripId);
  return Promise.all(
    tripPlaces.map(async (tripPlace) => ({
      ...tripPlace,
      place: await getPlaceById(tripPlace.placeId),
    })),
  );
}

export async function getEnrichedTripPlace(tripPlaceId: string): Promise<TripPlaceEnriched | null> {
  const tripPlace = await getTripPlaceById(tripPlaceId);
  if (!tripPlace) {
    return null;
  }
  return {
    ...tripPlace,
    place: await getPlaceById(tripPlace.placeId),
  };
}
