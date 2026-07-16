import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  RadioButton,
  Text,
} from 'react-native-paper';

import { listPlaces } from '@/src/db/placesRepo';
import type { Place } from '@/src/types';
import { formatCoordinates } from '@/src/utils/coordinates';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (place: Place) => void;
  /** Исключить места с указанными id (уже добавленные в поездку) */
  excludeIds?: string[];
  title?: string;
};

/**
 * Диалог выбора места из базы — для добавления в поездку (этап 4).
 */
export function PlacePicker({
  visible,
  onDismiss,
  onSelect,
  excludeIds = [],
  title = 'Выберите место',
}: Props) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listPlaces();
      const exclude = new Set(excludeIds);
      setPlaces(all.filter((p) => !exclude.has(p.id)));
    } finally {
      setLoading(false);
    }
  }, [excludeIds]);

  useEffect(() => {
    if (visible) {
      setSelectedId(null);
      load();
    }
  }, [visible, load]);

  function handleConfirm() {
    const place = places.find((p) => p.id === selectedId);
    if (place) {
      onSelect(place);
      onDismiss();
    }
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          {loading ? (
            <ActivityIndicator style={styles.loader} />
          ) : places.length === 0 ? (
            <Text variant="bodyMedium" style={styles.empty}>
              Нет доступных мест. Сначала добавьте места в разделе «Места».
            </Text>
          ) : (
            <FlatList
              data={places}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <RadioButton.Item
                  label={`${item.name}${item.dd ? ` (${formatCoordinates(item.dd)})` : ''}`}
                  value={item.id}
                  status={selectedId === item.id ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedId(item.id)}
                  style={styles.item}
                />
              )}
            />
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Отмена</Button>
          <Button onPress={handleConfirm} disabled={!selectedId}>
            Выбрать
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  content: {
    paddingHorizontal: 0,
    minHeight: 120,
  },
  list: {
    maxHeight: 320,
  },
  item: {
    paddingVertical: 0,
  },
  loader: {
    marginVertical: 24,
  },
  empty: {
    opacity: 0.7,
    paddingVertical: 8,
  },
});
