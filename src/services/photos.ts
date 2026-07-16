import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '@/src/db/ids';

const PHOTOS_DIR_NAME = 'photos';

function getPhotosDirectory(): Directory {
  const dir = new Directory(Paths.document, PHOTOS_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function extensionFromUri(uri: string): string {
  const clean = uri.split('?')[0] ?? uri;
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

/**
 * Копирует выбранное фото в каталог приложения и возвращает локальный URI.
 * В БД сохраняются только эти локальные пути.
 */
export async function savePhotoFromUri(sourceUri: string): Promise<string> {
  const dir = getPhotosDirectory();
  const filename = `${createId()}.${extensionFromUri(sourceUri)}`;
  const destination = new File(dir, filename);
  const source = new File(sourceUri);
  source.copy(destination);
  return destination.uri;
}

export async function deletePhoto(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Файл мог быть уже удалён — игнорируем
  }
}

export async function deletePhotos(uris: string[]): Promise<void> {
  await Promise.all(uris.map(deletePhoto));
}

export function getPhotosRootUri(): string {
  return getPhotosDirectory().uri;
}
