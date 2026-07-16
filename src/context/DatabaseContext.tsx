import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { getDatabase } from '@/src/db/database';

type DatabaseContextValue = {
  ready: boolean;
  error: string | null;
};

const DatabaseContext = createContext<DatabaseContextValue>({
  ready: false,
  error: null,
});

function formatDbError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (Platform.OS === 'web') {
    return (
      `${message}\n\n` +
      'На web для SQLite нужны Metro-поддержка .wasm и заголовки COOP/COEP. ' +
      'Перезапустите `npm start` после обновления metro.config.js. ' +
      'Для полной проверки MVP предпочтительнее Expo Go на Android/iOS.'
    );
  }
  return message;
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await getDatabase();
        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatDbError(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ ready, error }), [ready, error]);

  if (error) {
    return <EmptyState title="Не удалось открыть базу данных" message={error} />;
  }

  if (!ready) {
    return <LoadingState message="Инициализация…" />;
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabaseReady(): DatabaseContextValue {
  return useContext(DatabaseContext);
}
