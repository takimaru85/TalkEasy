import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe, type DbTopic } from '@/database';

interface QueryState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Runs an async repository query and re-runs it whenever one of `topics` is notified.
 * Every data hook in the app is a thin wrapper around this.
 *
 * `deps` should list the values `query` closes over (like useEffect deps).
 */
export function useDbQuery<T>(
  query: () => Promise<T>,
  initial: T,
  topics: DbTopic[],
  deps: React.DependencyList = [],
): QueryState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(query, deps);

  const reload = useCallback(async () => {
    try {
      const result = await run();
      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    mounted.current = true;
    reload();
    const unsubs = topics.map((t) => subscribe(t, reload));
    return () => {
      mounted.current = false;
      unsubs.forEach((u) => u());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, topics.join(',')]);

  return { data, loading, error, reload };
}
