// Shared styled-components CSS recipes built on top of design tokens (theme.ts).
// Keep these composable via `${mixin}` interpolation inside `styled.xxx` templates —
// avoids re-declaring the same border/radius/shadow combo (surface card) in every file.

import { css } from "styled-components";

import { colors, radii, shadows } from "./tokens";

// "Surface card" — white panel, subtle border, soft shadow, rounded corners.
// Used by: Document/Main (header + content pane), InfoSection, AttachmentsSection.
export const surfaceCard = css`
  background: ${colors.bgSurface};
  border-radius: ${radii.lg}px;
  border: 1px solid ${colors.borderPanel};
  box-shadow: ${shadows.card};
`;

// Flat section — no card chrome; the section label carries a bottom rule instead.
export const flatSection = css`
  flex-shrink: 0;
  padding: 10px 0 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const flatSectionLabel = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.borderPanel};
  color: ${colors.textHeading};
  font-weight: 600;
  font-size: 14px;
`;
