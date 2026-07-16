import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import i18n from '@/src/i18n';

const LANGUAGE_STORAGE_KEY = 'gonext.language';

export type AppLanguage = 'ru' | 'en';

type LanguagePreferenceContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

const LanguagePreferenceContext =
  createContext<LanguagePreferenceContextValue | null>(null);

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === 'ru' || value === 'en';
}

async function applyLanguage(language: AppLanguage) {
  await i18n.changeLanguage(language);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}

export function LanguagePreferenceProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('ru');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const nextLanguage = isAppLanguage(storedLanguage) ? storedLanguage : 'ru';
        await applyLanguage(nextLanguage);
        if (!cancelled) {
          setLanguageState(nextLanguage);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    await applyLanguage(nextLanguage);
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LanguagePreferenceContext.Provider value={value}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
}

export function useLanguagePreference(): LanguagePreferenceContextValue {
  const context = useContext(LanguagePreferenceContext);
  if (!context) {
    throw new Error(
      'useLanguagePreference must be used within LanguagePreferenceProvider',
    );
  }
  return context;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
