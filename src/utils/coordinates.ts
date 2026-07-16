import i18n from '@/src/i18n';
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
    throw new Error(i18n.t('errors.bothCoordinates'));
  }

  const latitude = Number.parseFloat(lat.replace(',', '.'));
  const longitude = Number.parseFloat(lng.replace(',', '.'));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(i18n.t('errors.numericCoordinates'));
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error(i18n.t('errors.latitudeRange'));
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error(i18n.t('errors.longitudeRange'));
  }

  return { latitude, longitude };
}

export function formatCoordinates(dd: Coordinates | null): string {
  if (!dd) {
    return i18n.t('common.notSpecified');
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
