import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { DateInput } from '@/src/components/DateInput';
import type { Trip, TripInput } from '@/src/types';

type Props = {
  initial?: Trip;
  submitLabel: string;
  onSubmit: (input: TripInput) => Promise<void>;
  onCancel?: () => void;
};

export function TripForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startDate, setStartDate] = useState<string | null>(initial?.startDate ?? null);
  const [endDate, setEndDate] = useState<string | null>(initial?.endDate ?? null);
  const [current, setCurrent] = useState(initial?.current ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError(t('forms.tripTitleRequired'));
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError(t('forms.invalidDateRange'));
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        startDate,
        endDate,
        current,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forms.saveTripError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextInput
        label={t('forms.nameRequired')}
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.field}
      />
      <TextInput
        label={t('forms.description')}
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.field}
      />

      <DateInput label={t('forms.startDate')} value={startDate} onChange={setStartDate} />
      <DateInput label={t('forms.endDate')} value={endDate} onChange={setEndDate} />

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text variant="bodyLarge">{t('common.currentTrip')}</Text>
          <Text variant="bodySmall" style={styles.hint}>
            {t('forms.onlyOneCurrent')}
          </Text>
        </View>
        <Switch value={current} onValueChange={setCurrent} />
      </View>

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
          {submitLabel}
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
  field: {
    backgroundColor: 'transparent',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
  hint: {
    opacity: 0.65,
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
