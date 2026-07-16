import { Linking, Platform } from 'react-native';

import i18n from '@/src/i18n';
import type { Coordinates } from '@/src/types';

function encodeLabel(label?: string): string {
  return encodeURIComponent(label?.trim() || i18n.t('common.place'));
}

/** Открыть точку на карте (просмотр). */
export async function openOnMap(dd: Coordinates, label?: string): Promise<void> {
  const { latitude, longitude } = dd;
  const name = encodeLabel(label);

  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${name}`
      : Platform.OS === 'android'
        ? `geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  await Linking.openURL(url);
}

/** Открыть маршрут в навигаторе / Google Maps. */
export async function openInNavigator(dd: Coordinates, label?: string): Promise<void> {
  const { latitude, longitude } = dd;
  const name = encodeLabel(label);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=&travelmode=driving&dir_action=navigate`;

  // Google Maps URL работает на Android/iOS/web; label учитывается через query на iOS Maps fallback
  try {
    await Linking.openURL(url);
  } catch {
    await openOnMap(dd, label ?? decodeURIComponent(name));
  }
}
