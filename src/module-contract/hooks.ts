import { useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

import { type ContainerTier, DEFAULT_FALLBACK_TIER } from "./breakpoints";
import { ModuleRootContext } from "./context";

const noopSubscribe = () => () => undefined;
const outsideTier = () => DEFAULT_FALLBACK_TIER;

let warnedOutside = false;
function warnOutsideOnce(hook: string) {
  if (warnedOutside) return;
  warnedOutside = true;
  // eslint-disable-next-line no-console
  console.error(`[module-contract] ${hook}() was called outside a <ModuleRoot>. Falling back to "${DEFAULT_FALLBACK_TIER}".`);
}

/** Test helper: lets a test observe the "log once" behaviour again. */
export function resetOutsideWarning() {
  warnedOutside = false;
}

/** Tier of the nearest ModuleRoot. Re-renders ONLY when the tier changes (the snapshot is a string). */
export function useContainerBreakpoint(): ContainerTier {
  const ctx = useContext(ModuleRootContext);
  if (!ctx) warnOutsideOnce("useContainerBreakpoint");
  return useSyncExternalStore(
    ctx ? ctx.store.subscribe : noopSubscribe,
    ctx ? ctx.store.getTier : outsideTier,
    ctx ? ctx.store.getTier : outsideTier,
  );
}

/**
 * Integer px width of the nearest ModuleRoot, applied at most once per animation frame.
 * Re-renders on every px change: use sparingly. Outside a ModuleRoot it returns 0.
 */
export function useContainerWidth(): number {
  const ctx = useContext(ModuleRootContext);
  if (!ctx) warnOutsideOnce("useContainerWidth");
  const [width, setWidth] = useState<number>(() => ctx?.store.getWidth() ?? 0);

  useEffect(() => {
    if (!ctx) return undefined;
    const { store } = ctx;
    let frame = 0;
    setWidth(store.getWidth() ?? 0);
    const unsubscribe = store.subscribe(() => {
      if (frame) return;
      if (typeof requestAnimationFrame !== "function") {
        setWidth(store.getWidth() ?? 0);
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        setWidth(store.getWidth() ?? 0);
      });
    });
    return () => {
      unsubscribe();
      if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
    };
  }, [ctx]);

  return width;
}

/** () => root element of the nearest ModuleRoot, for third-party components needing a container. */
export function useModulePopupContainer(): () => HTMLElement {
  const ctx = useContext(ModuleRootContext);
  // Stable identity (usable in dependency arrays) for as long as the nearest root is the same.
  return useCallback(() => ctx?.getRootElement() ?? document.body, [ctx]);
}
