import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import type { AxiosInstance } from "axios";

// Generic engine behind every `shared-*` entry point (shared-users, shared-departments, ...).
// Each call to createSharedResource() closes over its OWN module-level store — callers get
// independent caches even though they share this same factory code. See shared-users/index.ts
// and shared-departments/index.ts for the thin, resource-specific wrappers built on top of this.
//
// Only fits resources fetched as ONE flat list with NO required request params (like /users,
// /companies). A resource whose backend requires a param to scope the result (e.g. departments
// scoped by companyId) should be fetched as its unscoped "all" variant here and filtered
// client-side — do not bolt per-param cache keys onto this engine.

export interface ConfigureSharedResourceClientOptions {
  /** Axios instance already wired with baseURL + auth token interceptor. */
  httpClient: AxiosInstance;
  /** Path relative to httpClient's baseURL. Falls back to the resource's defaultEndpoint. */
  endpoint?: string;
}

export interface FetchSharedResourceOptions {
  /** Per-call override, takes priority over configureSharedResourceClient(). */
  httpClient?: AxiosInstance;
  endpoint?: string;
  /** Bypass staleTime check and always issue a fresh HTTP call. Default: false */
  force?: boolean;
}

export interface UseSharedResourceOptions {
  httpClient?: AxiosInstance;
  endpoint?: string;
  /** Default: true. Set false to disable auto-fetch on mount. */
  enabled?: boolean;
}

export interface UseSharedResourceResult<T> {
  data: T[];
  /** true only while there is no cached data at all yet (first-ever fetch). */
  loading: boolean;
  /** true while a fetch is in flight (initial or background revalidation). */
  isValidating: boolean;
  error: Error | null;
  /** Manual force-refresh, bypasses staleTime. */
  refresh: () => Promise<T[]>;
}

export interface CreateSharedResourceConfig {
  /** Default endpoint path used when a call site/consumer doesn't override it. */
  defaultEndpoint: string;
  /** Cache lifetime before a mount-triggered fetch is considered stale. Default: 5 minutes. */
  staleTimeMs?: number;
}

export interface SharedResourceApi<T> {
  /** Registers the default httpClient/endpoint used when a call site doesn't pass its own. */
  configure: (options: ConfigureSharedResourceClientOptions) => void;
  /** Imperative (non-hook) API — for use outside React render (e.g. a shell bootstrap function). */
  fetch: (options?: FetchSharedResourceOptions) => Promise<T[]>;
  /** React hook subscribing to the module-level store via useSyncExternalStore. */
  useResource: (options?: UseSharedResourceOptions) => UseSharedResourceResult<T>;
  /** Read current store state without subscribing (debug/testing). */
  getSnapshot: () => { data: T[]; fetchedAt: number | null };
  /** Clears the in-memory store. Call on logout / tenant switch. */
  clearCache: () => void;
}

export function createSharedResource<T>(config: CreateSharedResourceConfig): SharedResourceApi<T> {
  const staleTimeMs = config.staleTimeMs ?? 5 * 60 * 1000;

  let defaultHttpClient: AxiosInstance | undefined;
  let defaultEndpoint = config.defaultEndpoint;
  let fetchedAt: number | null = null;
  let inFlightPromise: Promise<T[]> | null = null;

  type Snapshot = { data: T[]; isValidating: boolean; error: Error | null };
  let snapshot: Snapshot = { data: [], isValidating: false, error: null };
  const listeners = new Set<() => void>();

  function setSnapshot(patch: Partial<Snapshot>): void {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getStoreSnapshot(): Snapshot {
    return snapshot;
  }

  function configure(options: ConfigureSharedResourceClientOptions): void {
    defaultHttpClient = options.httpClient;
    defaultEndpoint = options.endpoint ?? config.defaultEndpoint;
  }

  async function doFetch(httpClient: AxiosInstance, endpoint: string): Promise<T[]> {
    const res = await httpClient.get<T[]>(endpoint);
    fetchedAt = Date.now();
    setSnapshot({ data: res.data, isValidating: false, error: null });
    return res.data;
  }

  function fetchResource(options?: FetchSharedResourceOptions): Promise<T[]> {
    const httpClient = options?.httpClient ?? defaultHttpClient;
    const endpoint = options?.endpoint ?? defaultEndpoint;

    if (!httpClient) {
      const error = new Error("createSharedResource: no httpClient configured");
      setSnapshot({ isValidating: false, error });
      return Promise.reject(error);
    }

    const isStale = fetchedAt === null || Date.now() - fetchedAt > staleTimeMs;
    if (!options?.force && !isStale) {
      return Promise.resolve(snapshot.data);
    }

    if (inFlightPromise) return inFlightPromise;

    setSnapshot({ isValidating: true });
    inFlightPromise = doFetch(httpClient, endpoint)
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setSnapshot({ isValidating: false, error });
        throw error;
      })
      .finally(() => {
        inFlightPromise = null;
      });

    return inFlightPromise;
  }

  function getSnapshot(): { data: T[]; fetchedAt: number | null } {
    return { data: snapshot.data, fetchedAt };
  }

  function clearCache(): void {
    fetchedAt = null;
    inFlightPromise = null;
    setSnapshot({ data: [], isValidating: false, error: null });
  }

  function useResource(options?: UseSharedResourceOptions): UseSharedResourceResult<T> {
    const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const refresh = useCallback(() => {
      const opts = optionsRef.current;
      return fetchResource({ force: true, httpClient: opts?.httpClient, endpoint: opts?.endpoint });
    }, []);

    useEffect(() => {
      const opts = optionsRef.current;
      if (opts?.enabled === false) return;
      fetchResource({ httpClient: opts?.httpClient, endpoint: opts?.endpoint }).catch(() => {
        // surfaced via store.error; swallow here to avoid an unhandled rejection
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
      data: store.data,
      loading: fetchedAt === null && store.isValidating,
      isValidating: store.isValidating,
      error: store.error,
      refresh,
    };
  }

  return { configure, fetch: fetchResource, useResource, getSnapshot, clearCache };
}
