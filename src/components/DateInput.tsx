import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { dateToIso, formatDate, isoToDate } from '@/src/utils/date';

type Props = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function DateInput({ label, value, onChange }: Props) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = isoToDate(value) ?? new Date();

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selected) {
      onChange(dateToIso(selected));
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{label}</Text>
      <View style={styles.row}>
        <Text variant="bodyLarge" style={styles.value}>
          {formatDate(value)}
        </Text>
        <Button mode="outlined" compact onPress={() => setShowPicker(true)}>
          {t('common.select')}
        </Button>
        {value ? (
          <Button mode="text" compact onPress={() => onChange(null)}>
            {t('common.reset')}
          </Button>
        ) : null}
      </View>
      {showPicker ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}
      {Platform.OS === 'ios' && showPicker ? (
        <Button onPress={() => setShowPicker(false)}>{t('common.done')}</Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  value: {
    flex: 1,
    minWidth: 120,
  },
});
