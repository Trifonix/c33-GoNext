import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { getDatabase } from '@/src/db/database';
import i18n from '@/src/i18n';

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
    return i18n.t('errors.databaseWeb', { message });
  }
  return message;
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
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
    return <EmptyState title={t('errors.databaseOpen')} message={error} />;
  }

  if (!ready) {
    return <LoadingState message={t('common.initializing')} />;
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabaseReady(): DatabaseContextValue {
  return useContext(DatabaseContext);
}
