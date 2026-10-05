export type ContainerTier = "narrow" | "medium" | "wide";

export interface ContainerBreakpoints {
  /** Minimum frame width (px) of the `medium` tier. */
  medium: number;
  /** Minimum frame width (px) of the `wide` tier. */
  wide: number;
}

/** Name of the CSS container created by ModuleRoot (`@container module-root (...)`). */
export const MODULE_ROOT_CONTAINER_NAME = "module-root";

/** Default tier boundaries, measured on the module frame, not on the window. */
export const CONTAINER_BREAKPOINTS: Readonly<{ medium: 672; wide: 1184 }> = Object.freeze({
  medium: 672,
  wide: 1184,
});

/** Tier used when the frame cannot be measured. */
export const DEFAULT_FALLBACK_TIER: ContainerTier = "wide";

/**
 * Pure. width < medium -> "narrow"; width < wide -> "medium"; otherwise "wide".
 * Boundaries belong to the upper tier. Widths are compared as given (callers floor them).
 */
export function resolveContainerTier(
  width: number,
  bp: ContainerBreakpoints = CONTAINER_BREAKPOINTS,
): ContainerTier {
  if (width < bp.medium) return "narrow";
  if (width < bp.wide) return "medium";
  return "wide";
}

/** `containerMinWidth("medium")` -> `"@container module-root (min-width: 672px)"`. */
export function containerMinWidth(
  tier: Exclude<ContainerTier, "narrow">,
  bp: ContainerBreakpoints = CONTAINER_BREAKPOINTS,
): string {
  return `@container ${MODULE_ROOT_CONTAINER_NAME} (min-width: ${bp[tier]}px)`;
}

/**
 * Exact complement of `containerMinWidth`: `containerMaxWidth("medium")` matches every width below the `medium`
 * boundary, with no gap for fractional widths (`not (min-width: 672px)`).
 */
export function containerMaxWidth(
  tier: Exclude<ContainerTier, "narrow">,
  bp: ContainerBreakpoints = CONTAINER_BREAKPOINTS,
): string {
  return `@container ${MODULE_ROOT_CONTAINER_NAME} (not (min-width: ${bp[tier]}px))`;
}
