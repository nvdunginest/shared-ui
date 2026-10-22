import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { ICompany } from "../../../mdms";
import type { IDepartment } from "../../../mdms";
import type { IPrincipalScope } from "../../../mdms";
import type { IProject } from "../../../mdms";
import type { ISector } from "../../../mdms";
import type { ITier } from "../../../mdms";
import { UUID } from "crypto";

import { useDocumentKit } from "../../config";

import action from "./action";
import reducer from "./reducer";
import { defaultStore, GlobalStore, initialState } from "./type";

type Props = PropsWithChildren;

const hydrateState = (storageKey: string) => {
  if (typeof window === "undefined") return initialState;

  const selectedCompanyId = window.localStorage.getItem(storageKey) as UUID | null;

  return {
    ...initialState,
    selectedCompanyId: selectedCompanyId ?? undefined,
  };
};

export const GlobalContext = createContext(defaultStore);

export const GlobalProvider: FC<Props> = ({ children }: Props) => {
  const { companyStorageKey: SELECTED_COMPANY_STORAGE_KEY } = useDocumentKit();
  const [globalState, dispatch] = useReducer(reducer, SELECTED_COMPANY_STORAGE_KEY, (key: string) => hydrateState(key));

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (globalState.selectedCompanyId) {
      window.localStorage.setItem(
        SELECTED_COMPANY_STORAGE_KEY,
        globalState.selectedCompanyId,
      );
    } else {
      window.localStorage.removeItem(SELECTED_COMPANY_STORAGE_KEY);
    }
  }, [globalState.selectedCompanyId, SELECTED_COMPANY_STORAGE_KEY]);

  const setCompanies = useCallback(
    (companies: ICompany[]) => {
      action.setCompanies(companies, dispatch);
    },
    [dispatch]
  );

  const setSelectedCompanyId = useCallback(
    (companyId: UUID | undefined) => {
      action.setSelectedCompanyId(companyId, dispatch);
    },
    [dispatch]
  );

  const setMyDepartments = useCallback(
    (departments: IDepartment[]) => {
      action.setMyDepartments(departments, dispatch);
    },
    [dispatch]
  );

  const setSectors = useCallback(
    (sectors: ISector[]) => {
      action.setSectors(sectors, dispatch);
    },
    [dispatch]
  );

  const setProjects = useCallback(
    (projects: IProject[], loadFailed = false) => {
      action.setProjects(projects, loadFailed, dispatch);
    },
    [dispatch]
  );

  const setDepartments = useCallback(
    (departments: IDepartment[]) => {
      action.setDepartments(departments, dispatch);
    },
    [dispatch]
  );

  const setTiers = useCallback(
    (tiers: ITier[]) => {
      action.setTiers(tiers, dispatch);
    },
    [dispatch]
  );

  const setMyPrincipalScopes = useCallback(
    (scopes: IPrincipalScope[]) => {
      action.setMyPrincipalScopes(scopes, dispatch);
    },
    [dispatch]
  );

  const setMyPrincipalPositionIds = useCallback(
    (ids: UUID[]) => {
      action.setMyPrincipalPositionIds(ids, dispatch);
    },
    [dispatch]
  );

  const setWaitingCounts = useCallback(
    (counts: Record<string, number>) => {
      action.setWaitingCounts(counts, dispatch);
    },
    [dispatch]
  );

  const store: GlobalStore = useMemo(
    () => ({
      globalState,
      setCompanies,
      setSelectedCompanyId,
      setMyDepartments,
      setSectors,
      setProjects,
      setDepartments,
      setTiers,
      setMyPrincipalScopes,
      setMyPrincipalPositionIds,
      setWaitingCounts,
    }),
    [
      globalState,
      setCompanies,
      setSelectedCompanyId,
      setMyDepartments,
      setSectors,
      setProjects,
      setDepartments,
      setTiers,
      setMyPrincipalScopes,
      setMyPrincipalPositionIds,
      setWaitingCounts,
    ]
  );

  return (
    <GlobalContext.Provider value={store}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
