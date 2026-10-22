import { getDtaMdmsInstance } from "../client";
import ICompany from "../models/ICompany";

const ORG_CHART_PATH = "/org-chart";

// Mode A (reference): ALL companies, including locked ones. Pass activeOnly only for selectable options.
async function getCompanies(activeOnly = false): Promise<ICompany[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/companies`, { params: { activeOnly } });
  return res.data;
}

// Companies where the current user holds at least one position.
async function getMyCompanies(activeOnly = false): Promise<ICompany[]> {
  const res = await (
    await getDtaMdmsInstance()
  ).get(`${ORG_CHART_PATH}/me/companies`, { params: { activeOnly } });
  return res.data;
}

const companiesController = {
  getCompanies,
  getMyCompanies,
};

export default companiesController;
