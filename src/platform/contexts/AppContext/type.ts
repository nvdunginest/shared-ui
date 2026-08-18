import { UUID } from "crypto";

import IUser from "../../models/IUser";
import IUserRole from "../../models/IUserRole";

export type LogType = "success" | "info" | "warn" | "error";

export type ILog = {
  type: LogType;
  time: Date;
  source: string;
  text: string;
  detail?: string;
};

export type IFeature = {
  label: string;
  short: string;
  path: string;
  icon: JSX.Element;
  roles: string[][];
};

export type AppState = {
  userId: UUID | undefined;
  userRoles: IUserRole[];
  users: IUser[];
  loading: boolean;
  status: string;
  logs: ILog[];
  appName: string;
  pageTitle: string;
  sideMenu: IFeature[];
  /** URL logo của ứng dụng — mỗi micro-app truyền qua AppLoader */
  logoUrl: string;
};

export const initialState: AppState = {
  userId: undefined,
  userRoles: [],
  users: [],
  loading: false,
  status: "",
  logs: [],
  appName: "",
  pageTitle: "",
  sideMenu: [],
  logoUrl: "",
};

export type AppStore = {
  state: AppState;
  setUserId: (userId: UUID | undefined) => void;
  setUserRoles: (userRoles: IUserRole[]) => void;
  setUsers: (users: IUser[]) => void;
  setLoading: (loading: boolean) => void;
  setStatus: (status: string) => void;
  addLog: (type: LogType, source: string, text: string, detail?: string) => void;
  setAppName: (appName: string) => void;
  setPageTitle: (pageTitle: string) => void;
  setSideMenu: (sideMenu: IFeature[]) => void;
  setLogoUrl: (logoUrl: string) => void;
};

export const defaultStore: AppStore = {
  state: initialState,
  setUserId: () => {},
  setUserRoles: () => {},
  setUsers: () => {},
  setLoading: () => {},
  setStatus: () => {},
  addLog: () => {},
  setAppName: () => {},
  setPageTitle: () => {},
  setSideMenu: () => {},
  setLogoUrl: () => {},
};
