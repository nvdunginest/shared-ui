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

// Flat departments (with positions[]) of EVERY company of the tenant in a single call.
// Mode A by default (all statuses, incl. locked).
async function getAllDepartments(activeOnly = false): Promise<IDepartment[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/departments/flat`, {
    params: { activeOnly },
  });
  return res.data;
}

// Departments where the current user holds a position, across all companies unless companyId is given
// (positions[] lists every position of the department).
async function getMyDepartments(
  companyId?: UUID,
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
  getAllDepartments,
  getMyDepartments,
};

export default departmentsController;
