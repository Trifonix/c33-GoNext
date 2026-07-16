import type { Coordinates } from '@/src/types';

export function parseCoordinates(
  latitudeText: string,
  longitudeText: string,
): Coordinates | null {
  const lat = latitudeText.trim();
  const lng = longitudeText.trim();

  if (!lat && !lng) {
    return null;
  }
  if (!lat || !lng) {
    throw new Error('Укажите и широту, и долготу');
  }

  const latitude = Number.parseFloat(lat.replace(',', '.'));
  const longitude = Number.parseFloat(lng.replace(',', '.'));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Координаты должны быть числами');
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error('Широта должна быть от −90 до 90');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('Долгота должна быть от −180 до 180');
  }

  return { latitude, longitude };
}

export function formatCoordinates(dd: Coordinates | null): string {
  if (!dd) {
    return 'Не указаны';
  }
  return `${dd.latitude.toFixed(6)}, ${dd.longitude.toFixed(6)}`;
}

export function coordinatesToFields(dd: Coordinates | null): {
  latitude: string;
  longitude: string;
} {
  if (!dd) {
    return { latitude: '', longitude: '' };
  }
  return {
    latitude: String(dd.latitude),
    longitude: String(dd.longitude),
  };
}
