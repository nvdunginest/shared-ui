import { FC } from "react";
import { NavLink } from "react-router-dom";
import { IFeature, useAppContext } from "../../platform-kit";
import { colors, radii } from "../../theme";
import { Tooltip } from "antd";
import styled from "styled-components";

type Props = {
  features: IFeature[];
};

const isAllowed = (feature: IFeature, roles: string[]): boolean => {
  if (feature.roles.length === 0) return true;
  return feature.roles.some((group) => group.every((r) => roles.includes(r)));
};

const FooterIconNav: FC<Props> = ({ features }) => {
  const { state: appState } = useAppContext();
  const roles = appState.userRoles.map((x) => x.role);
  const visible = features.filter((f) => isAllowed(f, roles));

  if (visible.length === 0) return null;

  return (
    <ContainerStl>
      {visible.map((feature) => (
        <Tooltip key={feature.path} title={feature.label} placement="top">
          <LinkStl to={feature.path} className={({ isActive }) => (isActive ? "active" : "")}>
            {feature.icon}
          </LinkStl>
        </Tooltip>
      ))}
    </ContainerStl>
  );
};

export default FooterIconNav;

const ContainerStl = styled.div`
  width: 100%;
  flex: 0 0 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const LinkStl = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${radii.md}px;
  font-size: 16px;
  color: ${colors.iconDefault};
  transition: background 0.2s;

  &:hover {
    background-color: ${colors.iconHoverBg};
    color: ${colors.iconHover};
  }

  &.active {
    background-color: ${colors.primaryBg};
    color: ${colors.primary};
  }
`;
