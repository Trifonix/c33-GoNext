import { StyleSheet, View } from 'react-native';
import { Card, Checkbox, Chip, IconButton, Text } from 'react-native-paper';

import type { Place, TripPlace } from '@/src/types';
import { formatDateTime } from '@/src/utils/date';

type Props = {
  tripPlace: TripPlace;
  place: Place | null;
  showDiary?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisited: (visited: boolean) => void;
  onPress: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function TripRouteItem({
  tripPlace,
  place,
  showDiary = false,
  onMoveUp,
  onMoveDown,
  onToggleVisited,
  onPress,
  onRemove,
  canMoveUp,
  canMoveDown,
}: Props) {
  const title = place?.name ?? 'Место удалено';
  const visited = tripPlace.visited;

  if (showDiary && !visited) {
    return null;
  }

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">
            {tripPlace.order + 1}. {title}
          </Text>
          <View style={styles.orderButtons}>
            <IconButton icon="chevron-up" size={20} disabled={!canMoveUp} onPress={onMoveUp} />
            <IconButton icon="chevron-down" size={20} disabled={!canMoveDown} onPress={onMoveDown} />
            <IconButton icon="delete-outline" size={20} onPress={onRemove} />
          </View>
        </View>

        {place?.description && !showDiary ? (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {place.description}
          </Text>
        ) : null}

        <View style={styles.row}>
          <Checkbox
            status={visited ? 'checked' : 'unchecked'}
            onPress={() => onToggleVisited(!visited)}
          />
          <Text variant="bodyMedium" onPress={() => onToggleVisited(!visited)}>
            {visited ? 'Посещено' : 'Не посещено'}
          </Text>
          {visited && tripPlace.visitDate ? (
            <Chip compact icon="calendar-check" style={styles.chip}>
              {formatDateTime(tripPlace.visitDate)}
            </Chip>
          ) : null}
        </View>

        {showDiary && tripPlace.notes ? (
          <Text variant="bodyMedium" style={styles.notes}>
            {tripPlace.notes}
          </Text>
        ) : null}

        {tripPlace.photos.length > 0 ? (
          <Chip compact icon="image" style={styles.chip}>
            {tripPlace.photos.length} фото
          </Chip>
        ) : null}

        {!showDiary ? (
          <Text variant="bodySmall" style={styles.hint}>
            Нажмите, чтобы добавить заметки и фото
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderButtons: {
    flexDirection: 'row',
    marginTop: -8,
    marginRight: -8,
  },
  description: {
    marginTop: 4,
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    marginLeft: 4,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  hint: {
    marginTop: 8,
    opacity: 0.55,
  },
});
