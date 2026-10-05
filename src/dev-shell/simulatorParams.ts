import {
  SIM_MIN_WIDTH,
  SIM_SIDER_MIN_WINDOW,
  SIM_SIDER_WIDTHS,
  type SimSider,
} from "./frameDeclarations";

export type SimWidth = number | "auto";

export interface SimulatorState {
  enabled: boolean;
  width: SimWidth;
  sider: SimSider;
}

export const SIM_DEFAULT_WIDTH = 1280;
/** The shell shows no Sider on module routes (frame = window), so the default frame has none. */
export const SIM_DEFAULT_SIDER: SimSider = 0;

/** `?sim=0` disables, `?w=<px>|auto` and `?sider=0|80|240` preset the toolbar. Invalid values are ignored. */
export function parseSimulatorParams(
  search: string,
  defaults: { width?: SimWidth; sider?: SimSider } = {},
): SimulatorState {
  const params = new URLSearchParams(search);
  let width: SimWidth = defaults.width ?? SIM_DEFAULT_WIDTH;
  let sider: SimSider = defaults.sider ?? SIM_DEFAULT_SIDER;

  const w = params.get("w");
  if (w === "auto") width = "auto";
  else if (w !== null && /^\d+$/.test(w) && Number(w) >= SIM_MIN_WIDTH) width = Number(w);

  const s = Number(params.get("sider"));
  if (params.get("sider") !== null && (SIM_SIDER_WIDTHS as readonly number[]).includes(s)) sider = s as SimSider;

  return { enabled: params.get("sim") !== "0", width, sider };
}

/** Frame width = window width minus Sider (the real shell also removes the right safe-area inset, 0 here). */
export function simFrameWidth(windowWidth: number, sider: number): number {
  return Math.max(0, windowWidth - sider);
}

/**
 * Note about the Sider choice, or null. Never blocks.
 * The real shell has NO Sider on module routes at any width, and none below 768px on any screen.
 * 80/240 are kept to simulate a module embedded in a screen that has a Sider.
 */
export function siderWarning(windowWidth: number, sider: SimSider): string | null {
  if (sider === 0) return null;
  if (windowWidth < SIM_SIDER_MIN_WINDOW) {
    return `The real shell has no Sider below ${SIM_SIDER_MIN_WINDOW}px.`;
  }
  return "The shell shows no Sider on module routes (frame = window). 80/240 simulate a module embedded next to a Sider.";
}
