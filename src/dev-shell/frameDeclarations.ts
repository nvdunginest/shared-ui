/**
 * Declarations of the shell's `ModuleFrame` (shell: frontend/presentation/pages/Module.tsx), copied
 * here so the simulator frame stays identical. The optional parity test in the shell
 * (tests/ui-module-contract/moduleFrameParity.test.ts) compares these with Module.tsx.
 */
export const MODULE_FRAME_DECLARATIONS: Readonly<Record<string, string>> = Object.freeze({
  position: "relative",
  width: "100%",
  height: "100%",
  padding: "0",
  overflow: "hidden",
  isolation: "isolate",
  background: "#FFFFFF",
});

/** Shell numbers (shell: frontend/shared/theme/layoutTokens.ts SHELL_LAYOUT). */
export const SIM_HEADER_HEIGHT = 56;
export const SIM_SIDER_WIDTHS = [0, 80, 240] as const;
export type SimSider = (typeof SIM_SIDER_WIDTHS)[number];
/** Width from which the shell shows a Sider on its own screens (never on module routes). */
export const SIM_SIDER_MIN_WINDOW = 768;
export const SIM_WIDTH_PRESETS = [375, 768, 1024, 1280, 1440, 1920] as const;
export const SIM_MIN_WIDTH = 200;
export const SIM_Z_INDEX = { sider: 50, header: 60 } as const;
