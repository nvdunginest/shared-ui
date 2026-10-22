// Light entry (bundled into each app): dta-mdms models, controllers and actor helper.
// The HTTP instance comes from the host-shared `@ptht365/shared-ui/platform` singleton.
export { configureMdms } from "./client";
export type { default as ICompany } from "./models/ICompany";
export type { default as IDepartment } from "./models/IDepartment";
export type { default as IPosition } from "./models/IPosition";
export type { default as IPrincipalScope } from "./models/IPrincipalScope";
export type { default as IProject } from "./models/IProject";
export type { default as ISector } from "./models/ISector";
export type { default as ITier } from "./models/ITier";
export { default as companiesController } from "./controllers/companies.controller";
export { default as departmentsController } from "./controllers/departments.controller";
export { default as projectsController } from "./controllers/projects.controller";
export { default as secretariesController } from "./controllers/secretaries.controller";
export { default as sectorsController } from "./controllers/sectors.controller";
export { default as tiersController } from "./controllers/tiers.controller";
export * from "./helpers/actor.helper";
export { formatProjectLabel, getProjectDisplay, sortByProjectCode, UNKNOWN_LABEL } from "./helpers/project.helper";
