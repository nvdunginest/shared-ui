// Standalone entry point (see package.json "exports"."./shared-users" and tsup.config.ts).
// Deliberately has ZERO dependency on antd/ckeditor5/@react-pdf-viewer/AppContext so that
// minimal consumers (e.g. the "example" mini app) can import it without pulling in the
// heavy default barrel (`.`) — see libs/shared-ui/INTEGRATION.md and
// example/frontend/platform/axios.instance.ts for the historical reason this was split out.
//
// Module Federation: this module must be declared as its own `singleton: true` shared key
// (in addition to the package's default entry) in every app's MF config — deep imports are
// not automatically covered by sharing the bare package specifier.
//
// Built on the generic engine in ../shared-resource/createSharedResource — see that file for
// the store/staleTime/dedupe mechanics. This file is just the ISharedUser-typed wrapper.

import { createSharedResource } from "../shared-resource/createSharedResource";

import type {
  ConfigureSharedResourceClientOptions,
  FetchSharedResourceOptions,
  UseSharedResourceOptions,
} from "../shared-resource/createSharedResource";

export interface ISharedUser {
  id: string;
  displayName: string;
  mail: string;
  department: string | null;
  jobTitle: string | null;
}

export type ConfigureSharedUsersClientOptions = ConfigureSharedResourceClientOptions;
export type FetchSharedUsersOptions = FetchSharedResourceOptions;
export type UseSharedUsersOptions = UseSharedResourceOptions;

export interface UseSharedUsersResult {
  users: ISharedUser[];
  /** true only while there is no cached data at all yet (first-ever fetch). */
  loading: boolean;
  /** true while a fetch is in flight (initial or background revalidation). */
  isValidating: boolean;
  error: Error | null;
  /** Manual force-refresh, bypasses staleTime. */
  refresh: () => Promise<ISharedUser[]>;
}

const resource = createSharedResource<ISharedUser>({ defaultEndpoint: "/users" });

/** Registers the default httpClient/endpoint used when a call site doesn't pass its own. */
export function configureSharedUsersClient(options: ConfigureSharedUsersClientOptions): void {
  resource.configure(options);
}

/** Imperative (non-hook) API — for use outside React render (e.g. a shell bootstrap function). */
export function fetchSharedUsers(options?: FetchSharedUsersOptions): Promise<ISharedUser[]> {
  return resource.fetch(options);
}

/** Read current store state without subscribing (debug/testing). */
export function getSharedUsersSnapshot(): { users: ISharedUser[]; fetchedAt: number | null } {
  const snap = resource.getSnapshot();
  return { users: snap.data, fetchedAt: snap.fetchedAt };
}

/** Clears the in-memory store. Call on logout / tenant switch. */
export function clearSharedUsersCache(): void {
  resource.clearCache();
}

/**
 * React hook subscribing to the shared module-level store via useSyncExternalStore.
 * Any component (shell or mini app) calling this re-renders when the store is updated
 * by ANY caller — including one running in a different app bundle, as long as this module
 * is loaded once as a Module Federation singleton.
 */
export function useSharedUsers(options?: UseSharedUsersOptions): UseSharedUsersResult {
  const { data, loading, isValidating, error, refresh } = resource.useResource(options);
  return { users: data, loading, isValidating, error, refresh };
}
