import type { Place, PlaceInput } from '@/src/types';

import { getDatabase } from './database';
import { createId } from './ids';
import { mapPlaceRow, type PlaceRow, stringifyPhotos } from './mappers';
import { deletePhotos } from '@/src/services/photos';

export async function createPlace(input: PlaceInput): Promise<Place> {
  const db = await getDatabase();
  const id = createId();
  const createdAt = new Date().toISOString();
  const photos = input.photos ?? [];

  await db.runAsync(
    `INSERT INTO places (id, name, description, visitlater, liked, latitude, longitude, photos, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.name.trim(),
    input.description?.trim() ?? '',
    input.visitlater ? 1 : 0,
    input.liked ? 1 : 0,
    input.dd?.latitude ?? null,
    input.dd?.longitude ?? null,
    stringifyPhotos(photos),
    createdAt,
  );

  const place = await getPlaceById(id);
  if (!place) {
    throw new Error('Не удалось создать место');
  }
  return place;
}

export async function listPlaces(): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlaceRow>(
    'SELECT * FROM places ORDER BY createdAt DESC',
  );
  return rows.map(mapPlaceRow);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PlaceRow>('SELECT * FROM places WHERE id = ?', id);
  return row ? mapPlaceRow(row) : null;
}

export async function updatePlace(id: string, input: Partial<PlaceInput>): Promise<Place> {
  const existing = await getPlaceById(id);
  if (!existing) {
    throw new Error('Место не найдено');
  }

  const next: Place = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    description:
      input.description !== undefined ? input.description.trim() : existing.description,
    visitlater: input.visitlater ?? existing.visitlater,
    liked: input.liked ?? existing.liked,
    dd: input.dd !== undefined ? input.dd : existing.dd,
    photos: input.photos ?? existing.photos,
  };

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE places
     SET name = ?, description = ?, visitlater = ?, liked = ?, latitude = ?, longitude = ?, photos = ?
     WHERE id = ?`,
    next.name,
    next.description,
    next.visitlater ? 1 : 0,
    next.liked ? 1 : 0,
    next.dd?.latitude ?? null,
    next.dd?.longitude ?? null,
    stringifyPhotos(next.photos),
    id,
  );

  return next;
}

export async function deletePlace(id: string): Promise<void> {
  const existing = await getPlaceById(id);
  if (!existing) {
    return;
  }

  const db = await getDatabase();
  const used = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM trip_places WHERE placeId = ?',
    id,
  );
  if (used && used.count > 0) {
    throw new Error('Место используется в поездке и не может быть удалено');
  }

  await db.runAsync('DELETE FROM places WHERE id = ?', id);
  await deletePhotos(existing.photos);
}
