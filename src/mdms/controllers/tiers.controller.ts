import { UUID } from "crypto";

import { getDtaMdmsInstance } from "../client";
import ITier from "../models/ITier";

const ORG_CHART_PATH = "/org-chart";

// Mode A by default (all statuses, isActive included); dropdowns filter with filterActiveWithCurrent.
async function getTiers(companyId: UUID, activeOnly = false): Promise<ITier[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/companies/${companyId}/tiers`, {
    params: { activeOnly },
  });
  return res.data;
}

const tiersController = {
  getTiers,
};

export default tiersController;
