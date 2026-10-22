import IUserRole from "../../models/IUserRole";
import { UUID } from "crypto";

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
  //User Info
  userId: UUID | undefined;
  userRoles: IUserRole[];

  //Status
  loading: boolean;
  status: string;
  logs: ILog[];

  //UI
  appName: string;
  pageTitle: string;
  sideMenu: IFeature[];
};

export const initialState: AppState = {
  userId: undefined,
  userRoles: [],

  // The app loader starts right after mount: begin in the loading state so the startup screen is not
  // interrupted for a frame (the page would show through) before the loader flags it.
  loading: true,
  status: "Đang tải dữ liệu",
  logs: [],

  appName: "",
  pageTitle: "",
  sideMenu: [],
};

export type AppStore = {
  state: AppState;

  setUserId: (userId: UUID | undefined) => void;
  setUserRoles: (userRoles: IUserRole[]) => void;

  setLoading: (loading: boolean) => void;
  setStatus: (status: string) => void;
  addLog: (
    type: LogType,
    source: string,
    text: string,
    detail?: string
  ) => void;
  setAppName: (appName: string) => void;
  setPageTitle: (pageTitle: string) => void;
  setSideMenu: (sideMenu: IFeature[]) => void;
};

export const defaultStore: AppStore = {
  state: initialState,

  setUserId: () => {},
  setUserRoles: () => {},

  setLoading: () => {},
  setStatus: () => {},
  addLog: () => {},

  setAppName: () => {},
  setPageTitle: () => {},
  setSideMenu: () => {},
};
