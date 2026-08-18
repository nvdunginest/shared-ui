import { FC } from "react";

import { MoreOutlined } from "@ant-design/icons";
import { Dropdown, Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { useAppContext } from "../../platform/contexts/AppContext";
import { IFeature } from "../../platform/contexts/AppContext/type";
import IUserRole from "../../platform/models/IUserRole";

export const hasActive = (feature: IFeature, userRoles: IUserRole[]): boolean => {
  if (feature.roles.length === 0) return true;

  const roles = userRoles.map((x) => x.role);

  for (let i = 0; i < feature.roles.length; i++) {
    let ok = true;
    for (let j = 0; j < feature.roles[i].length; j++) {
      if (!roles.includes(feature.roles[i][j])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  return false;
};

const MoreButton: FC = function () {
  const { state: appState } = useAppContext();

  const moreFeature = appState.sideMenu
    .filter((f) => hasActive(f, appState.userRoles))
    .slice(3);

  return (
    <ContainerStl>
      <LinkStl>
        <Dropdown
          menu={{
            items: moreFeature.map((f, i) => ({
              key: i,
              label: (
                <Link to={f.path}>
                  <Flex gap={4}>{f.icon} {f.label}</Flex>
                </Link>
              ),
            })),
          }}
          placement="topRight"
        >
          <ContentStl>
            <MoreOutlined rotate={90} />
            <Typography.Text style={{ fontSize: "9px", textAlign: "center" }}>
              Xem thêm
            </Typography.Text>
          </ContentStl>
        </Dropdown>
      </LinkStl>
    </ContainerStl>
  );
};

export default MoreButton;

const ContainerStl = styled.div`
  height: 100%;
  width: 100%;
  cursor: pointer;
  > div > div > div { color: white; }
`;
const LinkStl = styled.div`
  width: 100%;
  height: 100%;
  color: white;
  text-decoration: none;
  display: flex;
  & * { color: white; }
  span { text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
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
