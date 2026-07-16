import * as ImagePicker from 'expo-image-picker';

import { savePhotoFromUri } from '@/src/services/photos';

export type PickPhotoResult =
  | { ok: true; uri: string }
  | { ok: false; reason: 'cancelled' | 'permission' | 'error'; message?: string };

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

export async function pickPhotoFromGallery(): Promise<PickPhotoResult> {
  if (!(await ensureLibraryPermission())) {
    return { ok: false, reason: 'permission', message: 'Нет доступа к галерее' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  try {
    const uri = await savePhotoFromUri(result.assets[0].uri);
    return { ok: true, uri };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'Не удалось сохранить фото',
    };
  }
}

export async function pickPhotoFromCamera(): Promise<PickPhotoResult> {
  if (!(await ensureCameraPermission())) {
    return { ok: false, reason: 'permission', message: 'Нет доступа к камере' };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  try {
    const uri = await savePhotoFromUri(result.assets[0].uri);
    return { ok: true, uri };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'Не удалось сохранить фото',
    };
  }
}
