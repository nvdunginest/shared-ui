import { createContext } from "react";
import type { App } from "antd";

/** message / notification / modal hooks of the nearest ModuleRoot (antd `App.useApp()` shape). */
export type ModuleFeedback = ReturnType<typeof App.useApp>;

/** null outside a ModuleRoot, or when the root was created with feedback={false}. */
export const ModuleFeedbackContext = createContext<ModuleFeedback | null>(null);
