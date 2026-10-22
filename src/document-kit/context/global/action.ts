import { Dispatch } from "react";
import type { ICompany } from "../../../mdms";
import type { IDepartment } from "../../../mdms";
import type { IPrincipalScope } from "../../../mdms";
import type { IProject } from "../../../mdms";
import type { ISector } from "../../../mdms";
import type { ITier } from "../../../mdms";
import { UUID } from "crypto";

import {
  Actions,
  SET_COMPANIES,
  SET_DEPARTMENTS,
  SET_MY_DEPARTMENTS,
  SET_MY_PRINCIPAL_POSITION_IDS,
  SET_MY_PRINCIPAL_SCOPES,
  SET_PROJECTS,
  SET_SECTORS,
  SET_SELECTED_COMPANY,
  SET_TIERS,
  SET_WAITING_COUNTS,
} from "./constant";

function setCompanies(companies: ICompany[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_COMPANIES, payload: { companies } });
}

function setSelectedCompanyId(
  companyId: UUID | undefined,
  dispatch: Dispatch<Actions>,
) {
  dispatch({ type: SET_SELECTED_COMPANY, payload: { companyId } });
}

function setMyDepartments(
  departments: IDepartment[],
  dispatch: Dispatch<Actions>,
) {
  dispatch({
    type: SET_MY_DEPARTMENTS,
    payload: { myDepartments: departments },
  });
}

function setSectors(sectors: ISector[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_SECTORS, payload: { sectors } });
}

function setProjects(
  projects: IProject[],
  loadFailed = false,
  dispatch: Dispatch<Actions>,
) {
  dispatch({
    type: SET_PROJECTS,
    payload: { projects, projectsLoadFailed: loadFailed },
  });
}

function setDepartments(
  departments: IDepartment[],
  dispatch: Dispatch<Actions>,
) {
  dispatch({ type: SET_DEPARTMENTS, payload: { departments } });
}

function setTiers(tiers: ITier[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_TIERS, payload: { tiers } });
}

function setMyPrincipalScopes(scopes: IPrincipalScope[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_MY_PRINCIPAL_SCOPES, payload: { myPrincipalScopes: scopes } });
}

function setMyPrincipalPositionIds(ids: UUID[], dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_MY_PRINCIPAL_POSITION_IDS, payload: { myPrincipalPositionIds: ids } });
}

function setWaitingCounts(
  counts: Record<string, number>,
  dispatch: Dispatch<Actions>,
) {
  dispatch({ type: SET_WAITING_COUNTS, payload: { waitingCounts: counts } });
}

const action = {
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
};

export default action;
