import { UUID } from "crypto";

import { getDtaMdmsInstance } from "../client";
import IProject from "../models/IProject";

// All projects of the tenant, including locked ones — needed to resolve the name of a project
// already assigned to a document and for the list filter. Use filterActiveWithCurrent for selectable options.
async function getProjects(): Promise<IProject[]> {
  const res = await (await getDtaMdmsInstance()).get(`/projects`);
  return res.data;
}

async function getActiveProjects(): Promise<IProject[]> {
  const res = await (await getDtaMdmsInstance()).get(`/projects/active`);
  return res.data;
}

async function getProject(projectId: UUID): Promise<IProject> {
  const res = await (await getDtaMdmsInstance()).get(`/projects/${projectId}`);
  return res.data;
}

const projectsController = {
  getProjects,
  getActiveProjects,
  getProject,
};

export default projectsController;
