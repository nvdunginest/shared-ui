import {
  CONTAINER_BREAKPOINTS,
  type ContainerBreakpoints,
  type ContainerTier,
  DEFAULT_FALLBACK_TIER,
  resolveContainerTier,
} from "./breakpoints";

export const ATTR_ROOT = "data-module-root";
export const ATTR_WIDTH = "data-frame-width";
export const ATTR_TIER = "data-frame-tier";

export interface ContainerStoreOptions {
  breakpoints?: ContainerBreakpoints;
  fallbackTier?: ContainerTier;
}

export interface ContainerStore {
  subscribe(listener: () => void): () => void;
  /** Last measured non-zero integer width, or undefined before the first valid measurement. */
  getWidth(): number | undefined;
  /** Tier of the last valid width, or the fallback tier when nothing valid was measured. */
  getTier(): ContainerTier;
  /** Starts observing `element` and measures it once immediately. */
  attach(element: HTMLElement): void;
  detach(): void;
}

/**
 * Measurement store of one ModuleRoot. Plain object, not React state: ResizeObserver callbacks
 * write the data attributes straight to the DOM and only notify React when the width changed.
 * Rules: width is floored (so JS and `@container` queries agree on every boundary), a width of
 * 0 (module hidden) is ignored, and without ResizeObserver the root itself is re-measured on
 * window resize (the window width is never read).
 */
export function createContainerStore(options: ContainerStoreOptions = {}): ContainerStore {
  const breakpoints = options.breakpoints ?? CONTAINER_BREAKPOINTS;
  const fallbackTier = options.fallbackTier ?? DEFAULT_FALLBACK_TIER;
  const listeners = new Set<() => void>();
  let element: HTMLElement | null = null;
  let width: number | undefined;
  let observer: ResizeObserver | null = null;
  let onWindowResize: (() => void) | null = null;

  const writeAttributes = () => {
    if (!element) return;
    element.setAttribute(ATTR_TIER, getTier());
    if (width !== undefined) element.setAttribute(ATTR_WIDTH, String(width));
  };

  function getTier(): ContainerTier {
    return width === undefined ? fallbackTier : resolveContainerTier(width, breakpoints);
  }

  const accept = (raw: number) => {
    const next = Math.floor(raw);
    if (!Number.isFinite(next) || next <= 0 || next === width) return;
    width = next;
    writeAttributes();
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getWidth: () => width,
    getTier,
    attach(target) {
      this.detach();
      element = target;
      element.setAttribute(ATTR_TIER, getTier());
      accept(target.getBoundingClientRect().width || target.clientWidth);
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver((entries) => {
          const entry = entries[entries.length - 1];
          if (entry) accept(entry.contentRect.width);
        });
        observer.observe(target);
      } else {
        onWindowResize = () => {
          if (element) accept(element.getBoundingClientRect().width || element.clientWidth);
        };
        window.addEventListener("resize", onWindowResize);
      }
    },
    detach() {
      observer?.disconnect();
      observer = null;
      if (onWindowResize) window.removeEventListener("resize", onWindowResize);
      onWindowResize = null;
      element = null;
    },
  };
}
