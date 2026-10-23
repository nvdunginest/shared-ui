import { UUID } from "crypto";

import { getDtaMdmsInstance } from "../client";
import IPositionGroup from "../models/IPositionGroup";

const ORG_CHART_PATH = "/org-chart";

// Mode A by default (all statuses, isActive included); dropdowns pass activeOnly=true.
async function getByCompany(companyId: UUID, activeOnly = false): Promise<IPositionGroup[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/companies/${companyId}/position-groups`, {
    params: { activeOnly },
  });
  return res.data;
}

const positionGroupsController = {
  getByCompany,
};

export default positionGroupsController;
