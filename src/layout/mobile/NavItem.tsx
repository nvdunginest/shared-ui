import { FC, useEffect, useState } from "react";

import { Typography } from "antd";
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
          {feature.icon}
          <Typography.Text style={{ fontSize: "9px", textAlign: "center" }}>
            {feature.short}
          </Typography.Text>
        </ContentStl>
      </LinkStl>
    </ContainerStl>
  ) : (
    <></>
  );
};

export default NavItem;

const ContainerStl = styled.div`
  height: 100%;
  width: 100%;
  cursor: pointer;
  > div > div > div { color: white; }
`;
const LinkStl = styled(NavLink)`
  width: 100%;
  height: 100%;
  color: white;
  text-decoration: none;
  display: flex;
  & * { color: white; }
  span { text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
  &.active { border-bottom: 2px solid white !important; }
`;
const ContentStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;
