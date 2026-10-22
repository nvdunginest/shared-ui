import { FC, useEffect, useState } from "react";
import { css, keyframes, styled } from "styled-components";

import logo from "../assets/van-phu-logo-full.png";
import { colors } from "../../theme";

type Props = {
  /** Text under the progress bar. */
  tip?: string;
  /** Opaque white page (startup) or a translucent veil over the content (user actions). */
  variant?: "page" | "veil";
  /** Milliseconds to wait before showing, so a fast request does not flash the loader. */
  delay?: number;
};

const LOGO_WIDTH = 176;
const LOGO_HEIGHT = 27;

/**
 * Full-frame loading layer of the module: company logo above an indeterminate progress bar.
 * Replaces the dark-masked spinner. Covers only the module root (position: absolute).
 */
const BrandedLoading: FC<Props> = ({ tip, variant = "page", delay = 0 }) => {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <OverlayStl $variant={variant} role="status" aria-busy="true" aria-live="polite" data-testid="module-loading-overlay">
      <StackStl>
        <LogoStl src={logo} alt="Van Phu" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
        <TrackStl aria-hidden="true">
          <BarStl />
        </TrackStl>
        {tip ? <TipStl>{tip}</TipStl> : null}
      </StackStl>
    </OverlayStl>
  );
};

export default BrandedLoading;

const slide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const OverlayStl = styled.div<{ $variant: "page" | "veil" }>`
  position: absolute;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: ${({ $variant }) => ($variant === "page" ? "#fff" : "rgba(255, 255, 255, 0.82)")};
  /* The page variant continues the shell's own loader: no fade, or both logos ghost through each other. */
  animation: ${({ $variant }) => ($variant === "veil" ? css`${fadeIn} 0.15s ease-out` : "none")};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// Logo and bar keep their place whether or not a tip is shown (the tip hangs below them).
const StackStl = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const LogoStl = styled.img`
  display: block;
  width: ${LOGO_WIDTH}px;
  height: auto;
  max-width: 60%;
  user-select: none;
`;

const TrackStl = styled.div`
  position: relative;
  width: 176px;
  max-width: 60%;
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: ${colors.primaryBg};
`;

const BarStl = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  width: 30%;
  border-radius: 2px;
  background: ${colors.primary};
  animation: ${slide} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
    opacity: 0.6;
  }
`;

const TipStl = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  width: 320px;
  max-width: 80vw;
  margin-top: 16px;
  transform: translateX(-50%);
  color: ${colors.textTertiary};
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
`;
