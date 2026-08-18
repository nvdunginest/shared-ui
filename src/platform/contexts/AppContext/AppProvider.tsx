import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

import { UUID } from "crypto";

import IUser from "../../models/IUser";
import IUserRole from "../../models/IUserRole";

import action from "./action";
import reducer from "./reducer";
import { AppStore, defaultStore, IFeature, initialState, LogType } from "./type";

type Props = PropsWithChildren;

export const AppContext = createContext(defaultStore);

export const AppProvider: FC<Props> = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setUserId = useCallback(
    (userId: UUID | undefined) => action.setUserId(userId, dispatch),
    [dispatch]
  );
  const setUserRoles = useCallback(
    (userRoles: IUserRole[]) => action.setUserRoles(userRoles, dispatch),
    [dispatch]
  );
  const setUsers = useCallback(
    (users: IUser[]) => action.setUsers(users, dispatch),
    [dispatch]
  );
  const setLoading = useCallback(
    (loading: boolean) => action.setLoading(loading, dispatch),
    [dispatch]
  );
  const setStatus = useCallback(
    (status: string) => action.setStatus(status, dispatch),
    [dispatch]
  );
  const addLog = useCallback(
    (type: LogType, source: string, text: string, detail?: string) =>
      action.addLog(type, source, text, dispatch, detail),
    [dispatch]
  );
  const setAppName = useCallback(
    (appName: string) => action.setAppName(appName, dispatch),
    [dispatch]
  );
  const setPageTitle = useCallback(
    (pageTitle: string) => action.setPageTitle(pageTitle, dispatch),
    [dispatch]
  );
  const setSideMenu = useCallback(
    (sideMenu: IFeature[]) => action.setSideMenu(sideMenu, dispatch),
    [dispatch]
  );
  const setLogoUrl = useCallback(
    (logoUrl: string) => action.setLogoUrl(logoUrl, dispatch),
    [dispatch]
  );

  const store: AppStore = useMemo(
    () => ({
      state,
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
    }),
    [
      state,
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
    ]
  );

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
