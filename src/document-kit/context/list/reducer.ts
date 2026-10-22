import {
  Actions,
  SET_ACTIVE_TAB,
  SET_PENDING_COMPANY_SWITCH,
  SET_TAB_FILTER,
} from "./constant";
import { DocumentListState, initialState } from "./type";

export default function reducer(
  state = initialState,
  action: Actions,
): DocumentListState {
  switch (action.type) {
    case SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload.tab };

    case SET_TAB_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.tab]: {
            ...state.filters[action.payload.tab],
            ...action.payload.patch,
          },
        },
      };

    case SET_PENDING_COMPANY_SWITCH:
      return { ...state, pendingCompanySwitch: action.payload.pending };

    default:
      return state;
  }
}
