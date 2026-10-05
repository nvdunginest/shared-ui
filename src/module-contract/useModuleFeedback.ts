import { useContext } from "react";

import { type ModuleFeedback, ModuleFeedbackContext } from "./feedbackContext";

export type { ModuleFeedback };

const OUTSIDE_ERROR =
  "[module-contract] useModuleFeedback() needs a <ModuleRoot> with feedback enabled (the default) above the component.";

/**
 * message / notification / modal bound to the nearest ModuleRoot: everything opened through
 * them mounts inside the root, never in document.body, and uses the default antd theme (or the
 * ModuleRoot `theme`), independent of the shell. Throws a clear Error when there is no ModuleRoot
 * with feedback enabled.
 */
export function useModuleFeedback(): ModuleFeedback {
  const api = useContext(ModuleFeedbackContext);
  if (!api) throw new Error(OUTSIDE_ERROR);
  return api;
}
