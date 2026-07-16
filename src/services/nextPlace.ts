import { getPlaceById } from '@/src/db/placesRepo';
import { getCurrentTrip } from '@/src/db/tripsRepo';
import type { Place, Trip, TripPlace } from '@/src/types';

export type NextPlaceResult =
  | { status: 'ok'; trip: Trip; tripPlace: TripPlace; place: Place }
  | { status: 'no_current_trip' }
  | { status: 'all_visited'; trip: Trip }
  | { status: 'place_missing'; trip: Trip; tripPlace: TripPlace };

/**
 * Следующее место = первое с visited = false в текущей поездке.
 */
export async function getNextPlace(): Promise<NextPlaceResult> {
  const trip = await getCurrentTrip();
  if (!trip) {
    return { status: 'no_current_trip' };
  }

  const tripPlace = trip.places.find((item) => !item.visited);
  if (!tripPlace) {
    return { status: 'all_visited', trip };
  }

  const place = await getPlaceById(tripPlace.placeId);
  if (!place) {
    return { status: 'place_missing', trip, tripPlace };
  }

  return { status: 'ok', trip, tripPlace, place };
}
