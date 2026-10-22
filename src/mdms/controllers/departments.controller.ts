import { UUID } from "crypto";

import { getDtaMdmsInstance } from "../client";
import IDepartment from "../models/IDepartment";

const ORG_CHART_PATH = "/org-chart";

// Flat list (with positions[]) of a company. Mode A by default (all statuses);
// activeOnly=true = whole chain active (company + department + ancestors, active positions only).
async function getDepartments(
  companyId: UUID,
  activeOnly = false,
): Promise<IDepartment[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/companies/${companyId}/departments/flat`, {
    params: { activeOnly },
  });
  return res.data;
}

// Departments where the current user holds a position (positions[] lists every position of the department).
async function getMyDepartments(
  companyId: UUID,
  activeOnly = false,
): Promise<IDepartment[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/me/departments`, {
    params: { companyId, activeOnly },
  });
  return res.data;
}

const departmentsController = {
  getDepartments,
  getMyDepartments,
};

export default departmentsController;
