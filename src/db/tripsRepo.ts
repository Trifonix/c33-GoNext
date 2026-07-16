import type { Trip, TripInput } from '@/src/types';

import { deletePhotos } from '@/src/services/photos';
import { getDatabase } from './database';
import { createId } from './ids';
import { mapTripRow, type TripRow } from './mappers';
import { listTripPlaces } from './tripPlacesRepo';

async function attachPlaces(row: TripRow): Promise<Trip> {
  const places = await listTripPlaces(row.id);
  return mapTripRow(row, places);
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const db = await getDatabase();
  const id = createId();
  const createdAt = new Date().toISOString();
  const makeCurrent = Boolean(input.current);

  await db.withTransactionAsync(async () => {
    if (makeCurrent) {
      await db.runAsync('UPDATE trips SET current = 0 WHERE current = 1');
    }
    await db.runAsync(
      `INSERT INTO trips (id, title, description, startDate, endDate, createdAt, current)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.title.trim(),
      input.description?.trim() ?? '',
      input.startDate ?? null,
      input.endDate ?? null,
      createdAt,
      makeCurrent ? 1 : 0,
    );
  });

  const trip = await getTripById(id);
  if (!trip) {
    throw new Error('Не удалось создать поездку');
  }
  return trip;
}

export async function listTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripRow>(
    'SELECT * FROM trips ORDER BY current DESC, createdAt DESC',
  );
  return Promise.all(rows.map(attachPlaces));
}

export async function getTripById(id: string): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', id);
  return row ? attachPlaces(row) : null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>(
    'SELECT * FROM trips WHERE current = 1 LIMIT 1',
  );
  return row ? attachPlaces(row) : null;
}

export async function updateTrip(id: string, input: Partial<TripInput>): Promise<Trip> {
  const existing = await getTripById(id);
  if (!existing) {
    throw new Error('Поездка не найдена');
  }

  const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
  const nextDescription =
    input.description !== undefined ? input.description.trim() : existing.description;
  const nextStartDate = input.startDate !== undefined ? input.startDate : existing.startDate;
  const nextEndDate = input.endDate !== undefined ? input.endDate : existing.endDate;
  const makeCurrent = input.current !== undefined ? input.current : existing.current;

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    if (makeCurrent) {
      await db.runAsync('UPDATE trips SET current = 0 WHERE current = 1 AND id != ?', id);
    }
    await db.runAsync(
      `UPDATE trips
       SET title = ?, description = ?, startDate = ?, endDate = ?, current = ?
       WHERE id = ?`,
      nextTitle,
      nextDescription,
      nextStartDate,
      nextEndDate,
      makeCurrent ? 1 : 0,
      id,
    );
  });

  const trip = await getTripById(id);
  if (!trip) {
    throw new Error('Не удалось обновить поездку');
  }
  return trip;
}

export async function setCurrentTrip(id: string): Promise<Trip> {
  return updateTrip(id, { current: true });
}

export async function clearCurrentTrip(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE trips SET current = 0 WHERE current = 1');
}

export async function deleteTrip(id: string): Promise<void> {
  const trip = await getTripById(id);
  if (!trip) {
    return;
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);

  await Promise.all(trip.places.map((tripPlace) => deletePhotos(tripPlace.photos)));
}
