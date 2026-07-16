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
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  APP_PRIMARY_COLORS,
  DEFAULT_PRIMARY_COLOR,
  type AppColorScheme,
  type AppPrimaryColor,
} from '@/src/theme/appTheme';

const COLOR_SCHEME_STORAGE_KEY = 'gonext.colorScheme';
const PRIMARY_COLOR_STORAGE_KEY = 'gonext.primaryColor';

type ThemePreferenceContextValue = {
  colorScheme: AppColorScheme;
  setColorScheme: (scheme: AppColorScheme) => Promise<void>;
  primaryColor: AppPrimaryColor;
  setPrimaryColor: (color: AppPrimaryColor) => Promise<void>;
  ready: boolean;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

function isAppColorScheme(value: string | null): value is AppColorScheme {
  return value === 'light' || value === 'dark';
}

function isAppPrimaryColor(value: string | null): value is AppPrimaryColor {
  return APP_PRIMARY_COLORS.some((color) => color.value === value);
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const [colorScheme, setColorSchemeState] = useState<AppColorScheme>('light');
  const [primaryColor, setPrimaryColorState] =
    useState<AppPrimaryColor>(DEFAULT_PRIMARY_COLOR);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [storedScheme, storedPrimaryColor] = await AsyncStorage.multiGet([
          COLOR_SCHEME_STORAGE_KEY,
          PRIMARY_COLOR_STORAGE_KEY,
        ]);
        if (!cancelled) {
          const scheme = storedScheme[1];
          const color = storedPrimaryColor[1];
          if (isAppColorScheme(scheme)) {
            setColorSchemeState(scheme);
          }
          if (isAppPrimaryColor(color)) {
            setPrimaryColorState(color);
          }
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

  const setColorScheme = useCallback(async (scheme: AppColorScheme) => {
    setColorSchemeState(scheme);
    await AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  }, []);

  const setPrimaryColor = useCallback(async (color: AppPrimaryColor) => {
    setPrimaryColorState(color);
    await AsyncStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, color);
  }, []);

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      primaryColor,
      setPrimaryColor,
      ready,
    }),
    [colorScheme, setColorScheme, primaryColor, setPrimaryColor, ready],
  );

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
