import { UUID } from "crypto";
import { getDtaMdmsInstance } from "../client";
import ISector from "../models/ISector";

// All sectors of the tenant, including locked ones — needed to resolve the name of a
// sector already assigned to a document. Use filterActiveWithCurrent for selectable options.
async function getSectors(): Promise<ISector[]> {
  const res = await (await getDtaMdmsInstance()).get(`/sectors`);
  return res.data;
}

async function getActiveSectors(): Promise<ISector[]> {
  const res = await (await getDtaMdmsInstance()).get(`/sectors/active`);
  return res.data;
}

async function getSector(sectorId: UUID): Promise<ISector> {
  const res = await (await getDtaMdmsInstance()).get(`/sectors/${sectorId}`);
  return res.data;
}

const sectorsController = {
  getSectors,
  getActiveSectors,
  getSector,
};

export default sectorsController;
