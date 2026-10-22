import { Dispatch } from "react";

import {
  Actions,
  SET_ACTIVE_TAB,
  SET_PENDING_COMPANY_SWITCH,
  SET_TAB_FILTER,
} from "./constant";
import { TabFilterState, TabKey } from "./type";

function setActiveTab(tab: TabKey, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_ACTIVE_TAB, payload: { tab } });
}

function setTabFilter(
  tab: TabKey,
  patch: Partial<TabFilterState>,
  dispatch: Dispatch<Actions>,
) {
  dispatch({ type: SET_TAB_FILTER, payload: { tab, patch } });
}

function setPendingCompanySwitch(pending: boolean, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_PENDING_COMPANY_SWITCH, payload: { pending } });
}

const action = {
  setActiveTab,
  setTabFilter,
  setPendingCompanySwitch,
};

export default action;
