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
import { GlobalState, initialState } from "./type";

export default function reducer(
  state = initialState,
  action: Actions,
): GlobalState {
  switch (action.type) {
    case SET_COMPANIES:
      return {
        ...state,
        companies: action.payload.companies,
      };

    case SET_SELECTED_COMPANY:
      return {
        ...state,
        selectedCompanyId: action.payload.companyId,
      };

    case SET_MY_DEPARTMENTS:
      return {
        ...state,
        myDepartments: action.payload.myDepartments,
      };

    case SET_DEPARTMENTS:
      return {
        ...state,
        departments: action.payload.departments,
      };

    case SET_TIERS:
      return {
        ...state,
        tiers: action.payload.tiers,
      };

    case SET_SECTORS:
      return {
        ...state,
        sectors: action.payload.sectors,
      };

    case SET_PROJECTS:
      return {
        ...state,
        projects: action.payload.projects,
        projectsLoadFailed: action.payload.projectsLoadFailed,
      };

    case SET_MY_PRINCIPAL_SCOPES:
      return {
        ...state,
        myPrincipalScopes: action.payload.myPrincipalScopes,
        myPrincipalPositionIds: action.payload.myPrincipalScopes.map((s) => s.positionId),
      };

    case SET_MY_PRINCIPAL_POSITION_IDS:
      return {
        ...state,
        myPrincipalPositionIds: action.payload.myPrincipalPositionIds,
      };

    case SET_WAITING_COUNTS:
      return {
        ...state,
        waitingCounts: action.payload.waitingCounts,
      };

    default:
      return state;
  }
}
