import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadReadCache,
  peekReadCache,
  putReadCache,
} from "../client/cache/readCache";

export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  freshMs: number
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(() =>
    key ? peekReadCache<T>(key) : null
  );
  const [loading, setLoading] = useState(
    () => key !== null && peekReadCache(key) === null
  );

  const reload = useCallback(
    async (force = false) => {
      if (!key) {
        setData(null);
        setLoading(false);
        return;
      }

      const cached = peekReadCache<T>(key);
      if (cached) {
        setData(cached);
      } else {
        setData(null);
        setLoading(true);
      }

      try {
        const next = force
          ? await fetcherRef.current().then((value) => {
              putReadCache(key, value);
              return value;
            })
          : await loadReadCache(key, () => fetcherRef.current(), freshMs);
        setData(next);
      } catch {
        if (cached) setData(cached);
      } finally {
        setLoading(false);
      }
    },
    [freshMs, key]
  );

  useEffect(() => {
    void reload(false);
  }, [reload]);

  return {
    data,
    loading: loading && data === null,
    reload,
  };
}
