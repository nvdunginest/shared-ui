import { useContainerBreakpoint, useContainerWidth } from "@ptht365/shared-ui/module-contract";

// Development-only badge. It shows the width of the module FRAME (not the window), which is what
// the layout follows. absolute inside the module root, never fixed to the window.
const LABEL_STYLE = {
  position: "absolute",
  bottom: 16,
  right: 16,
  padding: "8px 12px",
  background: "rgba(0, 0, 0, 0.7)",
  color: "white",
  borderRadius: 4,
  fontSize: 12,
  zIndex: 900,
  pointerEvents: "none",
} as const;

export default function DebugFrameLabel(): JSX.Element {
  const tier = useContainerBreakpoint();
  const width = useContainerWidth();
  return (
    <div style={LABEL_STYLE} data-testid="debug-frame-label">
      {tier} · {width}px
    </div>
  );
}
