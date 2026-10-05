import { createContext } from "react";

import type { ContainerStore } from "./containerStore";

export interface ModuleRootContextValue {
  store: ContainerStore;
  /** Element of the root, available after mount. */
  getRootElement: () => HTMLElement | null;
}

/** null outside a ModuleRoot. Hooks never throw on null (except useModuleFeedback, see its doc). */
export const ModuleRootContext = createContext<ModuleRootContextValue | null>(null);
