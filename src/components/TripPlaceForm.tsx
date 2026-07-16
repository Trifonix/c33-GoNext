import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { PhotoGallery } from '@/src/components/PhotoGallery';
import { pickPhotoFromCamera, pickPhotoFromGallery } from '@/src/services/imagePicker';
import { deletePhoto } from '@/src/services/photos';
import type { TripPlace } from '@/src/types';
import { formatDateTime } from '@/src/utils/date';

type SubmitInput = {
  visited: boolean;
  notes: string;
  photos: string[];
};

type Props = {
  initial: TripPlace;
  placeName?: string;
  submitLabel?: string;
  onSubmit: (input: SubmitInput) => Promise<void>;
  onCancel?: () => void;
};

export function TripPlaceForm({
  initial,
  placeName,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [visited, setVisited] = useState(initial.visited);
  const [notes, setNotes] = useState(initial.notes);
  const [photos, setPhotos] = useState(initial.photos);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  async function handleAddPhoto(source: 'gallery' | 'camera') {
    setPhotoLoading(true);
    setError(null);
    const result =
      source === 'gallery' ? await pickPhotoFromGallery() : await pickPhotoFromCamera();
    setPhotoLoading(false);

    if (result.ok) {
      setPhotos((prev) => [...prev, result.uri]);
      return;
    }
    if (result.reason === 'permission' || result.reason === 'error') {
      setError(result.message ?? t('forms.addPhotoError'));
    }
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    try {
      const removedPhotos = initial.photos.filter((uri) => !photos.includes(uri));
      await onSubmit({ visited, notes: notes.trim(), photos });
      if (removedPhotos.length > 0) {
        await Promise.all(removedPhotos.map((uri) => deletePhoto(uri)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forms.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {placeName ? (
        <Text variant="headlineSmall" style={styles.title}>
          {placeName}
        </Text>
      ) : null}

      {initial.visitDate && visited ? (
        <Text variant="bodyMedium" style={styles.meta}>
          {t('forms.visitedAt', { date: formatDateTime(initial.visitDate) })}
        </Text>
      ) : null}

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">{t('forms.placeVisited')}</Text>
        <Switch value={visited} onValueChange={setVisited} />
      </View>

      <TextInput
        label={t('forms.notes')}
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={6}
        placeholder={t('forms.notesPlaceholder')}
        style={styles.field}
      />

      <Text variant="titleSmall">{t('forms.visitPhotos')}</Text>
      <PhotoGallery
        photos={photos}
        editable
        loading={photoLoading}
        onAddFromGallery={() => handleAddPhoto('gallery')}
        onAddFromCamera={() => handleAddPhoto('camera')}
        onRemove={(uri) => setPhotos((prev) => prev.filter((item) => item !== uri))}
      />

      {error ? (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.buttons}>
        {onCancel ? (
          <Button mode="outlined" onPress={onCancel} disabled={saving} style={styles.button}>
            {t('common.cancel')}
          </Button>
        ) : null}
        <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.button}>
          {submitLabel ?? t('common.save')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 4,
  },
  meta: {
    opacity: 0.7,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  field: {
    backgroundColor: 'transparent',
  },
  error: {
    color: '#B00020',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
