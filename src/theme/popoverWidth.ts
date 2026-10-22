// Popover bodies were a fixed 400px, wider than a narrow module frame (375px) and so clipped by it.
// 100cqw is the width of the module root (container-type: inline-size, ModuleRoot); the popover is
// rendered inside the root through getPopupContainer. 48px = popover padding + edge gap.
const POPOVER_CONTENT_MAX_WIDTH_PX = 400;
const POPOVER_EDGE_ALLOWANCE_PX = 48;

export const POPOVER_CONTENT_WIDTH = `min(${POPOVER_CONTENT_MAX_WIDTH_PX}px, calc(100cqw - ${POPOVER_EDGE_ALLOWANCE_PX}px))`;
