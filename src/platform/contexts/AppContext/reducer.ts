import {
  Actions,
  ADD_LOG,
  SET_APP_NAME,
  SET_LOADING,
  SET_LOGO_URL,
  SET_PAGE_TITLE,
  SET_SIDE_MENU,
  SET_STATUS,
  SET_USER_ID,
  SET_USER_ROLES,
  SET_USERS,
} from "./constant";
import { AppState, initialState } from "./type";

export default function reducer(state = initialState, action: Actions): AppState {
  switch (action.type) {
    case SET_USER_ID:
      return { ...state, userId: action.payload.userId };
    case SET_USER_ROLES:
      return { ...state, userRoles: action.payload.userRoles };
    case SET_USERS:
      return { ...state, users: action.payload.users };
    case SET_LOADING:
      return { ...state, loading: action.payload.loading };
    case SET_STATUS:
      return { ...state, status: action.payload.status };
    case ADD_LOG:
      return { ...state, logs: [...state.logs, action.payload.log] };
    case SET_APP_NAME:
      return { ...state, appName: action.payload.appName };
    case SET_PAGE_TITLE:
      return { ...state, pageTitle: action.payload.pageTitle };
    case SET_SIDE_MENU:
      return { ...state, sideMenu: action.payload.sideMenu };
    case SET_LOGO_URL:
      return { ...state, logoUrl: action.payload.logoUrl };
    default:
      return state;
  }
}
