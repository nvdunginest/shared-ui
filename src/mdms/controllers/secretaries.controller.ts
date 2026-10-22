import { UUID } from "crypto";

import { getDtaMdmsInstance } from "../client";
import IPrincipalScope from "../models/IPrincipalScope";

const ORG_CHART_PATH = "/org-chart";

async function getMyPrincipalPositions(companyId: UUID): Promise<UUID[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/me/principal-positions`, {
    params: { companyId },
  });
  return res.data;
}

async function getMyPrincipalPositionsDetail(companyId: UUID): Promise<IPrincipalScope[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get<IPrincipalScope[]>(`${ORG_CHART_PATH}/me/principal-positions/detail`, {
    params: { companyId },
  });
  return (res.data ?? []).map((s) => ({
    ...s,
    allSectors: s.allSectors ?? true,
    sectorIds: s.sectorIds ?? [],
  }));
}

const secretariesController = {
  getMyPrincipalPositions,
  getMyPrincipalPositionsDetail,
};

export default secretariesController;
