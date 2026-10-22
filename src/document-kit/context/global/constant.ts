import type { ICompany } from "../../../mdms";
import type { IDepartment } from "../../../mdms";
import type { IPrincipalScope } from "../../../mdms";
import type { IProject } from "../../../mdms";
import type { ISector } from "../../../mdms";
import type { ITier } from "../../../mdms";
import { UUID } from "crypto";

export const SET_COMPANIES = "SET_COMPANIES";
type SetCompaniesAction = {
  type: typeof SET_COMPANIES;
  payload: {
    companies: ICompany[];
  };
};

export const SET_SELECTED_COMPANY = "SET_SELECTED_COMPANY";
type SetSelectedCompanyAction = {
  type: typeof SET_SELECTED_COMPANY;
  payload: {
    companyId?: UUID;
  };
};

export const SET_MY_DEPARTMENTS = "SET_MY_DEPARTMENTS";
type SetMyDepartmentsAction = {
  type: typeof SET_MY_DEPARTMENTS;
  payload: {
    myDepartments: IDepartment[];
  };
};

export const SET_DEPARTMENTS = "SET_DEPARTMENTS";
type SetDepartmentsAction = {
  type: typeof SET_DEPARTMENTS;
  payload: {
    departments: IDepartment[];
  };
};

export const SET_TIERS = "SET_TIERS";
type SetTiersAction = {
  type: typeof SET_TIERS;
  payload: {
    tiers: ITier[];
  };
};

export const SET_SECTORS = "SET_SECTORS";
type SetSectorsAction = {
  type: typeof SET_SECTORS;
  payload: {
    sectors: ISector[];
  };
};

export const SET_PROJECTS = "SET_PROJECTS";
type SetProjectsAction = {
  type: typeof SET_PROJECTS;
  payload: {
    projects: IProject[];
    projectsLoadFailed: boolean;
  };
};

export const SET_MY_PRINCIPAL_SCOPES = "SET_MY_PRINCIPAL_SCOPES";
type SetMyPrincipalScopesAction = {
  type: typeof SET_MY_PRINCIPAL_SCOPES;
  payload: {
    myPrincipalScopes: IPrincipalScope[];
  };
};

export const SET_MY_PRINCIPAL_POSITION_IDS = "SET_MY_PRINCIPAL_POSITION_IDS";
type SetMyPrincipalPositionIdsAction = {
  type: typeof SET_MY_PRINCIPAL_POSITION_IDS;
  payload: {
    myPrincipalPositionIds: UUID[];
  };
};

export const SET_WAITING_COUNTS = "SET_WAITING_COUNTS";
type SetWaitingCountsAction = {
  type: typeof SET_WAITING_COUNTS;
  payload: {
    waitingCounts: Record<string, number>;
  };
};

export type Actions =
  | SetCompaniesAction
  | SetSelectedCompanyAction
  | SetMyDepartmentsAction
  | SetDepartmentsAction
  | SetTiersAction
  | SetSectorsAction
  | SetProjectsAction
  | SetMyPrincipalScopesAction
  | SetMyPrincipalPositionIdsAction
  | SetWaitingCountsAction;
