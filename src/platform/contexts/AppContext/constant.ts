import { UUID } from "crypto";

import IUser from "../../models/IUser";
import IUserRole from "../../models/IUserRole";

import { IFeature, ILog } from "./type";

export const SET_USER_ID = "SET_USER_ID";
type SetUserIdAction = { type: typeof SET_USER_ID; payload: { userId: UUID | undefined } };

export const SET_USER_ROLES = "SET_USER_ROLES";
type SetUserRolesAction = { type: typeof SET_USER_ROLES; payload: { userRoles: IUserRole[] } };

export const SET_USERS = "SET_USERS";
type SetUsersAction = { type: typeof SET_USERS; payload: { users: IUser[] } };

export const SET_LOADING = "SET_LOADING";
type SetLoadingAction = { type: typeof SET_LOADING; payload: { loading: boolean } };

export const SET_STATUS = "SET_STATUS";
type SetStatusAction = { type: typeof SET_STATUS; payload: { status: string } };

export const ADD_LOG = "ADD_LOG";
type AddLogAction = { type: typeof ADD_LOG; payload: { log: ILog } };

export const SET_APP_NAME = "SET_APP_NAME";
type SetAppNameAction = { type: typeof SET_APP_NAME; payload: { appName: string } };

export const SET_PAGE_TITLE = "SET_PAGE_TITLE";
type SetPageTitleAction = { type: typeof SET_PAGE_TITLE; payload: { pageTitle: string } };

export const SET_SIDE_MENU = "SET_SIDE_MENU";
type SetSideMenuAction = { type: typeof SET_SIDE_MENU; payload: { sideMenu: IFeature[] } };

export const SET_LOGO_URL = "SET_LOGO_URL";
type SetLogoUrlAction = { type: typeof SET_LOGO_URL; payload: { logoUrl: string } };

export type Actions =
  | SetUserIdAction
  | SetUserRolesAction
  | SetUsersAction
  | SetLoadingAction
  | SetStatusAction
  | AddLogAction
  | SetAppNameAction
  | SetPageTitleAction
  | SetSideMenuAction
  | SetLogoUrlAction;
