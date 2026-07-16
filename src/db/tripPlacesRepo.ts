import type { TripPlace, TripPlaceInput } from '@/src/types';

import { deletePhotos } from '@/src/services/photos';
import { getDatabase } from './database';
import { createId } from './ids';
import { mapTripPlaceRow, type TripPlaceRow, stringifyPhotos } from './mappers';

export async function listTripPlaces(tripId: string): Promise<TripPlace[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripPlaceRow>(
    'SELECT * FROM trip_places WHERE tripId = ? ORDER BY orderIndex ASC',
    tripId,
  );
  return rows.map(mapTripPlaceRow);
}

export async function getTripPlaceById(id: string): Promise<TripPlace | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripPlaceRow>(
    'SELECT * FROM trip_places WHERE id = ?',
    id,
  );
  return row ? mapTripPlaceRow(row) : null;
}

export async function addPlaceToTrip(
  tripId: string,
  input: TripPlaceInput,
): Promise<TripPlace> {
  const db = await getDatabase();

  const duplicate = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM trip_places WHERE tripId = ? AND placeId = ?',
    tripId,
    input.placeId,
  );
  if (duplicate) {
    throw new Error('Это место уже добавлено в поездку');
  }

  const id = createId();

  let orderIndex = input.order;
  if (orderIndex === undefined) {
    const max = await db.getFirstAsync<{ maxOrder: number | null }>(
      'SELECT MAX(orderIndex) as maxOrder FROM trip_places WHERE tripId = ?',
      tripId,
    );
    orderIndex = (max?.maxOrder ?? -1) + 1;
  }

  await db.runAsync(
    `INSERT INTO trip_places (id, tripId, placeId, orderIndex, visited, visitDate, notes, photos)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    tripId,
    input.placeId,
    orderIndex,
    input.visited ? 1 : 0,
    input.visitDate ?? null,
    input.notes?.trim() ?? '',
    stringifyPhotos(input.photos ?? []),
  );

  const tripPlace = await getTripPlaceById(id);
  if (!tripPlace) {
    throw new Error('Не удалось добавить место в поездку');
  }
  return tripPlace;
}

export async function reorderTripPlaces(
  tripId: string,
  orderedTripPlaceIds: string[],
): Promise<TripPlace[]> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedTripPlaceIds.length; i += 1) {
      await db.runAsync(
        'UPDATE trip_places SET orderIndex = ? WHERE id = ? AND tripId = ?',
        i,
        orderedTripPlaceIds[i],
        tripId,
      );
    }
  });
  return listTripPlaces(tripId);
}

export async function moveTripPlace(
  tripPlaceId: string,
  direction: 'up' | 'down',
): Promise<TripPlace[]> {
  const current = await getTripPlaceById(tripPlaceId);
  if (!current) {
    throw new Error('Место в поездке не найдено');
  }

  const places = await listTripPlaces(current.tripId);
  const index = places.findIndex((item) => item.id === tripPlaceId);
  if (index < 0) {
    throw new Error('Место в поездке не найдено');
  }

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= places.length) {
    return places;
  }

  const ordered = places.map((item) => item.id);
  const temp = ordered[index];
  ordered[index] = ordered[swapWith];
  ordered[swapWith] = temp;

  return reorderTripPlaces(current.tripId, ordered);
}

export async function markTripPlaceVisited(
  tripPlaceId: string,
  visited: boolean,
  visitDate?: string | null,
): Promise<TripPlace> {
  const existing = await getTripPlaceById(tripPlaceId);
  if (!existing) {
    throw new Error('Место в поездке не найдено');
  }

  const nextVisitDate = visited
    ? (visitDate ?? existing.visitDate ?? new Date().toISOString())
    : null;

  const db = await getDatabase();
  await db.runAsync(
    'UPDATE trip_places SET visited = ?, visitDate = ? WHERE id = ?',
    visited ? 1 : 0,
    nextVisitDate,
    tripPlaceId,
  );

  const updated = await getTripPlaceById(tripPlaceId);
  if (!updated) {
    throw new Error('Не удалось обновить место в поездке');
  }
  return updated;
}

export async function updateTripPlaceNotes(
  tripPlaceId: string,
  notes: string,
): Promise<TripPlace> {
  const db = await getDatabase();
  await db.runAsync('UPDATE trip_places SET notes = ? WHERE id = ?', notes.trim(), tripPlaceId);
  const updated = await getTripPlaceById(tripPlaceId);
  if (!updated) {
    throw new Error('Место в поездке не найдено');
  }
  return updated;
}

export async function updateTripPlacePhotos(
  tripPlaceId: string,
  photos: string[],
): Promise<TripPlace> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE trip_places SET photos = ? WHERE id = ?',
    stringifyPhotos(photos),
    tripPlaceId,
  );
  const updated = await getTripPlaceById(tripPlaceId);
  if (!updated) {
    throw new Error('Место в поездке не найдено');
  }
  return updated;
}

export async function removePlaceFromTrip(tripPlaceId: string): Promise<void> {
  const existing = await getTripPlaceById(tripPlaceId);
  if (!existing) {
    return;
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM trip_places WHERE id = ?', tripPlaceId);
  await deletePhotos(existing.photos);

  const remaining = await listTripPlaces(existing.tripId);
  await reorderTripPlaces(
    existing.tripId,
    remaining.map((item) => item.id),
  );
}
