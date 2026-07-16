import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

import { PhotoGallery } from '@/src/components/PhotoGallery';
import { pickPhotoFromCamera, pickPhotoFromGallery } from '@/src/services/imagePicker';
import { deletePhoto } from '@/src/services/photos';
import type { Place, PlaceInput } from '@/src/types';
import { coordinatesToFields, parseCoordinates } from '@/src/utils/coordinates';

type Props = {
  initial?: Place;
  submitLabel: string;
  onSubmit: (input: PlaceInput) => Promise<void>;
  onCancel?: () => void;
};

export function PlaceForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const initialCoords = coordinatesToFields(initial?.dd ?? null);

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [visitlater, setVisitlater] = useState(initial?.visitlater ?? true);
  const [liked, setLiked] = useState(initial?.liked ?? false);
  const [latitude, setLatitude] = useState(initialCoords.latitude);
  const [longitude, setLongitude] = useState(initialCoords.longitude);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
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
      setError(result.message ?? 'Не удалось добавить фото');
    }
  }

  async function handleRemovePhoto(uri: string) {
    setPhotos((prev) => prev.filter((item) => item !== uri));
  }

  async function handleSubmit() {
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Введите название места');
      return;
    }

    let dd = null;
    try {
      dd = parseCoordinates(latitude, longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Некорректные координаты');
      return;
    }

    setSaving(true);
    try {
      const removedPhotos = (initial?.photos ?? []).filter((uri) => !photos.includes(uri));
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        visitlater,
        liked,
        dd,
        photos,
      });
      if (removedPhotos.length > 0) {
        await Promise.all(removedPhotos.map((uri) => deletePhoto(uri)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить место');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextInput
        label="Название *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.field}
      />
      <TextInput
        label="Описание"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.field}
      />

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Хочу посетить</Text>
        <Switch value={visitlater} onValueChange={setVisitlater} />
      </View>
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Понравилось</Text>
        <Switch value={liked} onValueChange={setLiked} />
      </View>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Координаты (Decimal Degrees)
      </Text>
      <View style={styles.coordRow}>
        <TextInput
          label="Широта"
          value={latitude}
          onChangeText={setLatitude}
          mode="outlined"
          keyboardType="numeric"
          placeholder="55.7558"
          style={styles.coordField}
        />
        <TextInput
          label="Долгота"
          value={longitude}
          onChangeText={setLongitude}
          mode="outlined"
          keyboardType="numeric"
          placeholder="37.6173"
          style={styles.coordField}
        />
      </View>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Фотографии
      </Text>
      <PhotoGallery
        photos={photos}
        editable
        loading={photoLoading}
        onAddFromGallery={() => handleAddPhoto('gallery')}
        onAddFromCamera={() => handleAddPhoto('camera')}
        onRemove={handleRemovePhoto}
      />

      {error ? (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.buttons}>
        {onCancel ? (
          <Button mode="outlined" onPress={onCancel} disabled={saving} style={styles.button}>
            Отмена
          </Button>
        ) : null}
        <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.button}>
          {submitLabel}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  field: {
    backgroundColor: 'transparent',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionTitle: {
    marginTop: 4,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coordField: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  error: {
    color: '#B00020',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
