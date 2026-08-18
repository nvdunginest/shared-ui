import { Dispatch } from "react";

import { UUID } from "crypto";

import IUser from "../../models/IUser";
import IUserRole from "../../models/IUserRole";

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
import { IFeature, LogType } from "./type";

function setUserId(userId: UUID | undefined, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_USER_ID, payload: { userId } });
}

function setUserRoles(userRoles: IUserRole[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_USER_ROLES, payload: { userRoles } });
}

function setUsers(users: IUser[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_USERS, payload: { users } });
}

function setLoading(loading: boolean, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_LOADING, payload: { loading } });
}

function setStatus(status: string, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_STATUS, payload: { status } });
}

function addLog(
  type: LogType,
  source: string,
  text: string,
  dispatch: Dispatch<Actions>,
  detail?: string
) {
  dispatch({ type: ADD_LOG, payload: { log: { type, time: new Date(), source, text, detail } } });
}

function setAppName(appName: string, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_APP_NAME, payload: { appName } });
}

function setPageTitle(pageTitle: string, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_PAGE_TITLE, payload: { pageTitle } });
}

function setSideMenu(sideMenu: IFeature[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_SIDE_MENU, payload: { sideMenu } });
}

function setLogoUrl(logoUrl: string, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_LOGO_URL, payload: { logoUrl } });
}

const action = {
  setUserId,
  setUserRoles,
  setUsers,
  setLoading,
  setStatus,
  addLog,
  setAppName,
  setPageTitle,
  setSideMenu,
  setLogoUrl,
};

export default action;
