import { useDocumentKit } from "../config";

export type { TabConfig } from "../config";

/** Scope tabs of the document list, shared by the wide list screen and the narrow (mobile) list. */
export const useTabConfigs = () => useDocumentKit().tabs;
