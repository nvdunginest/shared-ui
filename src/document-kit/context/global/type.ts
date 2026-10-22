import type { ICompany } from "../../../mdms";
import type { IDepartment } from "../../../mdms";
import type { IPrincipalScope } from "../../../mdms";
import type { IProject } from "../../../mdms";
import type { ISector } from "../../../mdms";
import type { ITier } from "../../../mdms";
import { UUID } from "crypto";

export type GlobalState = {
  companies: ICompany[];
  selectedCompanyId?: UUID;
  myDepartments: IDepartment[];
  departments: IDepartment[];
  tiers: ITier[];
  sectors: ISector[];
  /** All projects of the tenant incl. locked (vpi-dta-mdms) — select options, detail display, list filter */
  projects: IProject[];
  /** True when the project catalog could not be loaded (AC9 US-01) */
  projectsLoadFailed: boolean;
  /** PositionId của các position mà user hiện tại đang đảm nhận vai trò thư ký */
  myPrincipalPositionIds: UUID[];
  /** Principal positions + covered sectors (secretary-by-sector); myPrincipalPositionIds is derived from it */
  myPrincipalScopes: IPrincipalScope[];
  /** Số hồ sơ "Chưa xử lý" theo từng companyId — key là companyId (string) — dùng cho badge ở GlobalCompanySelector */
  waitingCounts: Record<string, number>;
};

export const initialState: GlobalState = {
  companies: [],
  selectedCompanyId: undefined,
  myDepartments: [],
  departments: [],
  tiers: [],
  sectors: [],
  projects: [],
  projectsLoadFailed: false,
  myPrincipalPositionIds: [],
  myPrincipalScopes: [],
  waitingCounts: {},
};

export type GlobalStore = {
  globalState: GlobalState;
  setCompanies: (companies: ICompany[]) => void;
  setSelectedCompanyId: (companyId: UUID | undefined) => void;
  setMyDepartments: (departments: IDepartment[]) => void;
  setDepartments: (departments: IDepartment[]) => void;
  setTiers: (tiers: ITier[]) => void;
  setSectors: (sectors: ISector[]) => void;
  setProjects: (projects: IProject[], loadFailed?: boolean) => void;
  setMyPrincipalScopes: (scopes: IPrincipalScope[]) => void;
  setMyPrincipalPositionIds: (ids: UUID[]) => void;
  setWaitingCounts: (counts: Record<string, number>) => void;
};

export const defaultStore: GlobalStore = {
  globalState: initialState,
  setCompanies: () => {},
  setSelectedCompanyId: () => {},
  setMyDepartments: () => {},
  setDepartments: () => {},
  setTiers: () => {},
  setSectors: () => {},
  setProjects: () => {},
  setMyPrincipalScopes: () => {},
  setMyPrincipalPositionIds: () => {},
  setWaitingCounts: () => {},
};
