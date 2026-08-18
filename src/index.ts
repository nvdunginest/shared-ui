// ─── Platform ────────────────────────────────────────────────────────────────
export type { default as IBaseEntity } from "./platform/models/IBaseEntity";
export type { default as IDrive } from "./platform/models/IDrive";
export type { default as IUser } from "./platform/models/IUser";
export type { default as IUserRole } from "./platform/models/IUserRole";

export {
  AppContext,
  AppLoader,
  AppProvider,
  useAppContext,
} from "./platform/contexts/AppContext";
export type {
  AppState,
  AppStore,
  IFeature,
  ILog,
  LogType,
} from "./platform/contexts/AppContext/type";

export { default as axiosBuilder, getBaseUrl } from "./platform/axios.instance";
export { default as appController } from "./platform/controllers/app.controller";
export { default as filesController } from "./platform/controllers/files.controller";
export { default as usersController } from "./platform/controllers/users.controller";
export { default as userRolesController } from "./platform/controllers/userRoles.controller";
export type {
  AddMemberModel,
  AddModModel,
} from "./platform/controllers/userRoles.controller";

export { UserRoles } from "./platform/helpers/userRoles.helper";
export {
  chunkSize,
  default as filesHelper,
  getFileStaticUrl,
  upload,
} from "./platform/helpers/files.helper";
export type { FileUploadCallback } from "./platform/helpers/files.helper";

// ─── Components ──────────────────────────────────────────────────────────────
export { default as AclCheck } from "./components/AclCheck";
export { default as BackButton } from "./components/BackButton";
export { default as CollapsedSection } from "./components/CollapsedSection";
export { default as Forbidden } from "./components/Forbidden";
export { default as PropertyRender } from "./components/PropertyRender";
export { default as PropertyRenderContent } from "./components/PropertyRenderContent";
export { default as Section } from "./components/Section";
export { default as SelectUser } from "./components/SelectUser";
export { default as TitleBar } from "./components/TitleBar";
export { default as UserInfo } from "./components/UserInfo";
export { default as VerticalPropertyRenderContent } from "./components/VerticalPropertyRenderContent";

// ─── Editor ──────────────────────────────────────────────────────────────────
export { default as CustomEditor } from "./components/Editor/CustomEditor";
export type { EditorRef as CustomEditorRef } from "./components/Editor/CustomEditor";
export { default as CustomView } from "./components/Editor/CustomView";
export { default as DocumentEditor } from "./components/Editor/DocumentEditor";
export type { EditorRef as DocumentEditorRef } from "./components/Editor/DocumentEditor";
export { default as MinimalEditor } from "./components/Editor/MinimalEditor";
export type { UserMentionFeedItem } from "./components/Editor/MinimalEditor";

// ─── FileViewer ───────────────────────────────────────────────────────────────
export { default as FileViewer } from "./components/FileViewer/FileViewer";
export { default as OfficeViewer } from "./components/FileViewer/OfficeViewer";
export { default as PdfViewer } from "./components/FileViewer/PdfViewer";

// ─── Layout ──────────────────────────────────────────────────────────────────
export { default as AppLayout } from "./layout/AppLayout";
export { default as Loading } from "./layout/Loading";
export { default as MasterPage, extraWidth } from "./layout/MasterPage";
export { default as ResponsiveWrapper } from "./layout/ResponsiveWrapper";
export { default as ServiceVersion } from "./layout/ServiceVersion";
export { default as TeamsAppVersion } from "./layout/TeamsAppVersion";
export { useDeviceType } from "./layout/useDeviceType";
export { default as DesktopLayout } from "./layout/desktop/DesktopLayout";
export { default as DesktopNavigation } from "./layout/desktop/Navigation";
export { default as DesktopNavItem } from "./layout/desktop/NavItem";
export { default as AppInfo } from "./layout/desktop/AppInfo";
export { default as MobileLayout } from "./layout/mobile/MobileLayout";
export { default as MobileNavigation } from "./layout/mobile/Navigation";
export { default as MobileNavItem } from "./layout/mobile/NavItem";
export { default as MoreButton, hasActive } from "./layout/mobile/MoreButton";

// ─── Utils ───────────────────────────────────────────────────────────────────
export {
  cascaderFilter,
  floatFromString,
  formatDate,
  formatFileSize,
  formatNumber,
  getDiffDays,
  getMaxDate,
  getShortName,
  intFromString,
  isEmptyOrSpaces,
  readAmount,
  removeVietnameseTones,
  selectSearch,
  toCamelCase,
  toProperCase,
  valueFloatFormat,
} from "./utils";
