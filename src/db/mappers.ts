import type { Coordinates, Place, Trip, TripPlace } from '@/src/types';

export type PlaceRow = {
  id: string;
  name: string;
  description: string;
  visitlater: number;
  liked: number;
  latitude: number | null;
  longitude: number | null;
  photos: string;
  createdAt: string;
};

export type TripRow = {
  id: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  current: number;
};

export type TripPlaceRow = {
  id: string;
  tripId: string;
  placeId: string;
  orderIndex: number;
  visited: number;
  visitDate: string | null;
  notes: string;
  photos: string;
};

export function parsePhotos(json: string): string[] {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function stringifyPhotos(photos: string[]): string {
  return JSON.stringify(photos);
}

export function toCoordinates(
  latitude: number | null,
  longitude: number | null,
): Coordinates | null {
  if (latitude == null || longitude == null) {
    return null;
  }
  return { latitude, longitude };
}

export function mapPlaceRow(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visitlater: Boolean(row.visitlater),
    liked: Boolean(row.liked),
    dd: toCoordinates(row.latitude, row.longitude),
    photos: parsePhotos(row.photos),
    createdAt: row.createdAt,
  };
}

export function mapTripPlaceRow(row: TripPlaceRow): TripPlace {
  return {
    id: row.id,
    tripId: row.tripId,
    placeId: row.placeId,
    order: row.orderIndex,
    visited: Boolean(row.visited),
    visitDate: row.visitDate,
    notes: row.notes,
    photos: parsePhotos(row.photos),
  };
}

export function mapTripRow(row: TripRow, places: TripPlace[] = []): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    places,
    createdAt: row.createdAt,
    current: Boolean(row.current),
  };
}
