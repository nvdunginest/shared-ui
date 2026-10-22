import { ComponentType, createContext, FC, PropsWithChildren, useContext } from "react";

import type { IFeature } from "../platform-kit";

import type { TabKey } from "./context/list/type";
import type PaginationQueryResult from "./models/PaginationQueryResult";

/** What the list asks the backend for (the same body for every scope). */
export type DocumentQueryOptions = {
  page: number;
  pageSize: number;
  statuses?: number[];
  keyword?: string;
  departmentIds?: string[];
  sectorIds?: string[];
  projectIds?: string[];
};

/** Minimal shape the kit needs from a document of the list; the app's own query model is wider. */
export type ListDocument = { id: string };

export type DocumentViewItemProps<TDocument extends ListDocument = ListDocument> = { document: TDocument };

/** One scope tab of the list (all / waiting / mine / following). */
export type TabConfig = {
  key: TabKey;
  /** Tab label ("Tất cả tờ trình"). */
  label: string;
  /** Heading of the full list screen ("Danh sách tất cả tờ trình"). */
  scopeTitle: string;
  icon: JSX.Element;
  apiMethod: (options: DocumentQueryOptions, companyId: string) => Promise<PaginationQueryResult<ListDocument>>;
  /** Renders one row; domain specific, so it stays in the app. */
  viewItemComponent: ComponentType<DocumentViewItemProps<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  hasStatusFilter?: boolean;
  hasDepartmentFilter?: boolean;
  hasSectorFilter?: boolean;
  hasProjectFilter?: boolean;
};

export type DocumentKitConfig = {
  /** localStorage key of the remembered company; keep it stable per app. */
  companyStorageKey: string;
  /** The app's navigation entries: "/create" is the create button, the others become footer icons. */
  menu: IFeature[];
  tabs: TabConfig[];
  /** Status filter options and chip labels. */
  statuses: { status: number; text: string }[];
  /** Page size selector wording ("TT/trang"). */
  perPageLabel: string;
  /** "Chưa xử lý" badge counts per company. */
  getWaitingCounts: (companyIds: string[]) => Promise<Record<string, number>>;
  /** Which master-data calls the global loader makes. */
  mdms: {
    /** Load the sector catalogue (the sector filter). */
    sectors: boolean;
    /** "scopes": principal positions with covered sectors; "ids": plain principal position ids. */
    principalPositions: "scopes" | "ids";
  };
  features: {
    /** On a wide frame at "/", open the first document of the list once per entry into the module. */
    autoOpenFirst: boolean;
    /** Arrow in the full list screen that goes back to the wide shell. */
    backToShell: boolean;
    /** "Create" and "open the full list" buttons in the list panel header. */
    createShortcut: boolean;
  };
};

const DocumentKitContext = createContext<DocumentKitConfig | null>(null);

/** Wrap the app (above GlobalProvider) once: every component of the kit reads its wording and wiring from here. */
export const DocumentKitProvider: FC<PropsWithChildren<{ config: DocumentKitConfig }>> = ({ config, children }) => (
  <DocumentKitContext.Provider value={config}>{children}</DocumentKitContext.Provider>
);

export function useDocumentKit(): DocumentKitConfig {
  const config = useContext(DocumentKitContext);
  if (!config) throw new Error("document-kit: wrap the app in <DocumentKitProvider config={...}>");
  return config;
}

/** The "/create" entry of the menu, if the app has one. */
export const findCreateFeature = (menu: IFeature[]): IFeature | undefined => menu.find((f) => f.path === "/create");

/** Entries shown as icons in the sidebar footer ("/" and "/create" have their own places). */
export const getFooterFeatures = (menu: IFeature[]): IFeature[] => menu.filter((f) => f.path !== "/" && f.path !== "/create");
