import * as ImagePicker from 'expo-image-picker';

import i18n from '@/src/i18n';
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
    return { ok: false, reason: 'permission', message: i18n.t('errors.galleryPermission') };
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
      message: err instanceof Error ? err.message : i18n.t('errors.savePhoto'),
    };
  }
}

export async function pickPhotoFromCamera(): Promise<PickPhotoResult> {
  if (!(await ensureCameraPermission())) {
    return { ok: false, reason: 'permission', message: i18n.t('errors.cameraPermission') };
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
      message: err instanceof Error ? err.message : i18n.t('errors.savePhoto'),
    };
  }
}
