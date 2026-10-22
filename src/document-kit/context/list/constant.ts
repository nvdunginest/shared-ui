import { TabFilterState, TabKey } from "./type";

export const SET_ACTIVE_TAB = "SET_ACTIVE_TAB";
type SetActiveTabAction = {
  type: typeof SET_ACTIVE_TAB;
  payload: { tab: TabKey };
};

export const SET_TAB_FILTER = "SET_TAB_FILTER";
type SetTabFilterAction = {
  type: typeof SET_TAB_FILTER;
  payload: { tab: TabKey; patch: Partial<TabFilterState> };
};

export const SET_PENDING_COMPANY_SWITCH = "SET_PENDING_COMPANY_SWITCH";
type SetPendingCompanySwitchAction = {
  type: typeof SET_PENDING_COMPANY_SWITCH;
  payload: { pending: boolean };
};

export type Actions = SetActiveTabAction | SetTabFilterAction | SetPendingCompanySwitchAction;
