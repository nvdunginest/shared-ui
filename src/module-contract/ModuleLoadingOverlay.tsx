import type { ReactNode } from "react";
import { Spin } from "antd";
import styled from "styled-components";

export interface ModuleLoadingOverlayProps {
  spinning: boolean;
  tip?: ReactNode;
  /** Dim mask behind the spinner. Default true, colour rgba(0,0,0,.45) like antd's fullscreen Spin. */
  mask?: boolean;
}

const OVERLAY_Z_INDEX = 1000;
const MASK_COLOR = "rgba(0, 0, 0, 0.45)";
const TIP_FONT_SIZE = 14;

const Overlay = styled.div<{ $mask: boolean }>`
  position: absolute;
  inset: 0;
  z-index: ${OVERLAY_Z_INDEX};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ $mask }) => ($mask ? MASK_COLOR : "transparent")};
`;

const Tip = styled.div`
  color: #fff;
  font-size: ${TIP_FONT_SIZE}px;
  line-height: 1.5;
  text-align: center;
  padding: 0 16px;
`;

/**
 * Full-frame loading layer. Replaces `<Spin fullscreen>` (position: fixed; 100vw x 100vh), which
 * exceeds the module frame and covers the shell header. Covers only the ModuleRoot.
 */
export function ModuleLoadingOverlay({ spinning, tip, mask = true }: ModuleLoadingOverlayProps) {
  if (!spinning) return null;
  return (
    <Overlay $mask={mask} role="status" aria-busy="true" data-testid="module-loading-overlay">
      <Spin size="large" />
      {tip ? <Tip>{tip}</Tip> : null}
    </Overlay>
  );
}
