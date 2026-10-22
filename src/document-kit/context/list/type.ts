import type { MutableRefObject } from "react";

export type TabKey = "related" | "waiting" | "me" | "following";

export type TabFilterState = {
  page: number;
  pageSize: number;
  statuses: number[];
  keyword: string;
  departmentIds: string[];
  sectorIds: string[];
  projectIds: string[];
};

export const defaultTabFilterState: TabFilterState = {
  page: 1,
  pageSize: 20,
  statuses: [],
  keyword: "",
  departmentIds: [],
  sectorIds: [],
  projectIds: [],
};

export type DocumentListState = {
  activeTab: TabKey;
  filters: Record<TabKey, TabFilterState>;
  /** True ngay sau khi người dùng chủ động đổi công ty ở GlobalCompanySelector (compact,
   * gắn trong DocumentListPanel) — DocumentTable của tab đang active sẽ tiêu thụ cờ này
   * để tự mở tờ trình đầu tiên của danh sách mới rồi reset lại false. */
  pendingCompanySwitch: boolean;
};

export const initialState: DocumentListState = {
  activeTab: "related",
  filters: {
    related: { ...defaultTabFilterState },
    waiting: { ...defaultTabFilterState },
    me: { ...defaultTabFilterState },
    following: { ...defaultTabFilterState },
  },
  pendingCompanySwitch: false,
};

export type DocumentListStore = {
  state: DocumentListState;
  setActiveTab: (tab: TabKey) => void;
  setTabFilter: (tab: TabKey, patch: Partial<TabFilterState>) => void;
  setPendingCompanySwitch: (pending: boolean) => void;
  /** True once the first document was opened automatically for this entry into the module (not persisted across re-entries). */
  initialOpenDone: MutableRefObject<boolean>;
};

export const defaultStore: DocumentListStore = {
  state: initialState,
  setActiveTab: () => {},
  setTabFilter: () => {},
  setPendingCompanySwitch: () => {},
  initialOpenDone: { current: false },
};
