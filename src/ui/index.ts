// Light entry (bundled into each app): presentational components and layout pieces shared by the document apps.
// Per-app wording and storage keys come from configureUi().
export { configureUi, getUiConfig } from "./config";
export type { UiConfig } from "./config";
export { default as DebugFrameLabel } from "./components/DebugFrameLabel";
export { default as ExpandingTabBar } from "./components/ExpandingTabBar";
export type { ExpandingTabItem } from "./components/ExpandingTabBar";
export { default as TitleBar } from "./components/TitleBar";
export { default as UserInfo } from "./components/UserInfo";
export { getAvatarColor, getAvatarColorForUser } from "./components/avatarColor";
export { default as SelectUser } from "./components/SelectUser";
export { default as SelectUserChip } from "./components/SelectUserChip";
export { default as AppLayout } from "./layout/AppLayout";
export { default as ResponsiveWrapper } from "./layout/ResponsiveWrapper";
export { useDeviceType } from "./layout/useDeviceType";
export type { DeviceType } from "./layout/useDeviceType";
export { default as MasterPage, extraWidth, useMasterPageExtra } from "./layout/MasterPage";
export { default as CollapsedPanelStrip } from "./layout/CollapsedPanelStrip";
export { default as FooterIconNav } from "./layout/FooterIconNav";
export { default as BackToListButton } from "./layout/BackToListButton";
export { default as Loading } from "./layout/Loading";
export { default as BrandedLoading } from "./layout/BrandedLoading";
export { readPanelFlag, writePanelFlag } from "./layout/panelPersistence";
export { navigateTo, setNavigate } from "./navigation/navigation";
export { default as Navigator } from "./navigation/Navigator";
export { FROM_LIST_STATE, useBackToList } from "./navigation/useBackToList";
export { useUnsavedChangesGuard } from "./navigation/useUnsavedChangesGuard";
