// Light entry (bundled into each app): app-level platform code of the document apps
// (AppContext + AppLoader, platform controllers and helpers, models).
// HTTP goes through the host-shared `@ptht365/shared-ui/platform` singleton.
export type { default as IBaseEntity } from "./models/IBaseEntity";
export type { default as IDrive } from "./models/IDrive";
export type { default as IUser } from "./models/IUser";
export type { default as IUserRole } from "./models/IUserRole";
export * from "./contexts/AppContext";
export { default as appController } from "./controllers/app.controller";
export { default as filesController } from "./controllers/files.controller";
export { default as userRolesController } from "./controllers/userRoles.controller";
export type { AddModModel } from "./controllers/userRoles.controller";
export { default as usersController } from "./controllers/users.controller";
export { default as filesHelper } from "./helpers/files.helper";
export * from "./helpers/userRoles.helper";
export { FETCHING_DATA, PROCESSING } from "./statusMessages";
