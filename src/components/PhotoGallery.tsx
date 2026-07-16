import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

type Props = {
  photos: string[];
  editable?: boolean;
  onAddFromGallery?: () => void;
  onAddFromCamera?: () => void;
  onRemove?: (uri: string) => void;
  loading?: boolean;
};

export function PhotoGallery({
  photos,
  editable = false,
  onAddFromGallery,
  onAddFromCamera,
  onRemove,
  loading = false,
}: Props) {
  if (photos.length === 0 && !editable) {
    return (
      <Text variant="bodyMedium" style={styles.empty}>
        Фотографий нет
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {editable ? (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="image"
            onPress={onAddFromGallery}
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
          >
            Галерея
          </Button>
          <Button
            mode="outlined"
            icon="camera"
            onPress={onAddFromCamera}
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
          >
            Камера
          </Button>
        </View>
      ) : null}

      {photos.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Добавьте фото из галереи или камеры
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {photos.map((uri) => (
            <View key={uri} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
              {editable && onRemove ? (
                <IconButton
                  icon="close-circle"
                  size={22}
                  style={styles.removeBtn}
                  onPress={() => onRemove(uri)}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  empty: {
    opacity: 0.65,
  },
});
