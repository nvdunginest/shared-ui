import { type ContainerTier, useContainerBreakpoint } from "@ptht365/shared-ui/module-contract";

// Only these three values exist now (one per container tier); the old sm / md / xxl no longer occur.
export type DeviceType = "xs" | "lg" | "xl";

// The module no longer reads the window: the layout follows the width of the module frame
// (ModuleRoot), which is smaller than the window when the shell Sider is open. The old names are
// kept so every caller stays unchanged:
//   narrow (< 672)  -> "xs"  (single pane, mobile layout)
//   medium (< 1184) -> "lg"  (list + detail, secondary panel behind a button)
//   wide   (>= 1184)-> "xl"  (three panes)
// Note: the "mobile" threshold moved from a 992 px window to a 672 px frame (PO decision, solution 5.3).
const TIER_TO_DEVICE: Record<ContainerTier, DeviceType> = {
  narrow: "xs",
  medium: "lg",
  wide: "xl",
};

export const useDeviceType = (): DeviceType => TIER_TO_DEVICE[useContainerBreakpoint()];
