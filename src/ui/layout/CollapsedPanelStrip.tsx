import { FC, ReactNode } from "react";
import { colors, radii, spacing } from "../../theme";
import styled from "styled-components";

// Shared "collapsed strip" — a thin vertical rail with a toggle icon + rotated
// label, used both by OutlookShell (list panel collapsed) and MasterPage
// (extra panel collapsed). Previously duplicated almost verbatim in both files.
type Props = {
  icon: ReactNode;
  label: string;
  title: string;
  onClick: () => void;
  display?: "flex" | "none";
};

const CollapsedPanelStrip: FC<Props> = ({ icon, label, title, onClick, display = "flex" }) => (
  <ContainerStl style={{ display }}>
    <ButtonStl type="button" title={title} onClick={onClick}>
      {icon}
    </ButtonStl>
    <LabelStl>{label}</LabelStl>
  </ContainerStl>
);

export default CollapsedPanelStrip;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: ${spacing.sm}px 0;
  background: ${colors.bgSurface};
  border-radius: ${radii.lg}px;
`;

const ButtonStl = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  border-radius: ${radii.sm}px;
  color: ${colors.primary};
  cursor: pointer;

  &:hover {
    background: ${colors.primaryBg};
  }
`;

const LabelStl = styled.span`
  writing-mode: vertical-rl;
  font-size: 11px;
  font-weight: 600;
  color: ${colors.textTertiary};
  letter-spacing: 0.06em;
`;
