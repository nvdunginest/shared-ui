import { FC, useEffect, useState } from "react";

import { orange } from "@ant-design/colors";
import { Space, Typography } from "antd";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { useAppContext } from "../../platform/contexts/AppContext";
import { IFeature } from "../../platform/contexts/AppContext/type";

type Props = {
  feature: IFeature;
};

const NavItem: FC<Props> = function ({ feature }: Props) {
  const { state: appState } = useAppContext();
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (feature.roles.length === 0) {
      setActive(true);
      return;
    }

    const roles = appState.userRoles.map((x) => x.role);

    for (let i = 0; i < feature.roles.length; i++) {
      let ok = true;
      for (let j = 0; j < feature.roles[i].length; j++) {
        if (!roles.includes(feature.roles[i][j])) {
          ok = false;
          break;
        }
      }
      if (ok) {
        setActive(true);
        return;
      }
    }

    setActive(false);
  }, [appState.userRoles, feature]);

  return active ? (
    <ContainerStl>
      <LinkStl
        key={feature.label}
        className={({ isActive }) => (isActive ? "active" : "")}
        to={feature.path}
        end
      >
        <ContentStl>
          <Space size="small" style={{ height: "32px" }}>
            {feature.icon}
            <Typography.Text style={{ paddingLeft: "6px", fontSize: "14px", fontWeight: 500 }}>
              {feature.label}
            </Typography.Text>
          </Space>
        </ContentStl>
      </LinkStl>
    </ContainerStl>
  ) : (
    <></>
  );
};

export default NavItem;

const ContainerStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 2px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  > div > div > div { color: white; }
  &:has(> .active) {
    &:hover { background-color: ${orange[6]}; * { color: white; } }
    background-color: ${orange[6]};
  }
  &:hover { background-color: ${orange[3]}; * { color: black; } }
`;

const LinkStl = styled(NavLink)`
  width: 100%;
  height: 100%;
  color: white;
  text-decoration: none;
  & * { color: white; }
  &:hover { color: white; }
  &.active { span, svg { color: white; } }
`;

const ContentStl = styled.div`
  padding: 0 6px;
  line-height: 32px;
  text-align: left;
  color: white;
  font-weight: 500;
  flex-grow: 1;
  white-space: nowrap;
  font-size: 14px;
`;
