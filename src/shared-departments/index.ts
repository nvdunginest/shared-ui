// Standalone entry point (see package.json "exports"."./shared-departments" and
// tsup.config.ts) — same rationale as shared-users/index.ts: zero dependency on
// antd/ckeditor5/AppContext, must be declared as its own `singleton: true` MF shared key.
//
// Fetches the FULL department list for the tenant (no companyId filter) — the backend
// (Ptht365.Organization.Api DepartmentsController.GetAsync) treats companyId as optional
// and returns everything for the tenant when it's omitted. Consumers that need departments
// for one company must filter `departments` client-side by `companyId` — this store
// deliberately does not do per-company caching (see createSharedResource's doc comment on
// why param-scoped resources aren't a fit for its single-flat-list cache).

import { createSharedResource } from "../shared-resource/createSharedResource";

import type {
  ConfigureSharedResourceClientOptions,
  FetchSharedResourceOptions,
  UseSharedResourceOptions,
} from "../shared-resource/createSharedResource";

export interface ISharedPosition {
  id: string;
  tierId: string | null;
  positionName: string;
  positionAlias: string | null;
  userId: string | null;
  isActive: boolean;
}

export interface ISharedDepartment {
  id: string;
  departmentCode: string;
  departmentName: string;
  order: number;
  isActive: boolean;
  companyId: string;
  parentId: string | null;
  positions: ISharedPosition[];
}

export type ConfigureSharedDepartmentsClientOptions = ConfigureSharedResourceClientOptions;
export type FetchSharedDepartmentsOptions = FetchSharedResourceOptions;
export type UseSharedDepartmentsOptions = UseSharedResourceOptions;

export interface UseSharedDepartmentsResult {
  departments: ISharedDepartment[];
  /** true only while there is no cached data at all yet (first-ever fetch). */
  loading: boolean;
  /** true while a fetch is in flight (initial or background revalidation). */
  isValidating: boolean;
  error: Error | null;
  /** Manual force-refresh, bypasses staleTime. */
  refresh: () => Promise<ISharedDepartment[]>;
}

const resource = createSharedResource<ISharedDepartment>({ defaultEndpoint: "/departments" });

/** Registers the default httpClient/endpoint used when a call site doesn't pass its own. */
export function configureSharedDepartmentsClient(options: ConfigureSharedDepartmentsClientOptions): void {
  resource.configure(options);
}

/** Imperative (non-hook) API — for use outside React render (e.g. a shell bootstrap function). */
export function fetchSharedDepartments(options?: FetchSharedDepartmentsOptions): Promise<ISharedDepartment[]> {
  return resource.fetch(options);
}

/** Read current store state without subscribing (debug/testing). */
export function getSharedDepartmentsSnapshot(): { departments: ISharedDepartment[]; fetchedAt: number | null } {
  const snap = resource.getSnapshot();
  return { departments: snap.data, fetchedAt: snap.fetchedAt };
}

/** Clears the in-memory store. Call on logout / tenant switch. */
export function clearSharedDepartmentsCache(): void {
  resource.clearCache();
}

/**
 * React hook subscribing to the shared module-level store via useSyncExternalStore.
 * Any component (shell or mini app) calling this re-renders when the store is updated
 * by ANY caller — including one running in a different app bundle, as long as this module
 * is loaded once as a Module Federation singleton.
 */
export function useSharedDepartments(options?: UseSharedDepartmentsOptions): UseSharedDepartmentsResult {
  const { data, loading, isValidating, error, refresh } = resource.useResource(options);
  return { departments: data, loading, isValidating, error, refresh };
}
