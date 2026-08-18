import { UUID } from "crypto";

import { green } from "@ant-design/colors";
import { Tooltip, Typography } from "antd";
import styled from "styled-components";

import { useAppContext } from "../platform/contexts/AppContext";
import { getShortName } from "../utils";

type Props = {
  userId: UUID;
  simple?: boolean;
  extra?: React.ReactNode;
};

export default function UserInfo({ userId, simple = false, extra }: Props): JSX.Element {
  const { users } = useAppContext().state;
  const user = users.find((u) => u.id === userId);

  const first = `${user ? user.displayName : "Anonymous"} (${user ? user.mail : "N/A"})`;
  const second = `${user ? user.department : "N/A"} (${user ? user.jobTitle : "N/A"})`;

  const cardContent = (
    <ContainerStl>
      <SiderStl>
        <IconStl>{getShortName(user ? user.displayName : "Anonymous")}</IconStl>
      </SiderStl>
      <ContentStl>
        <MainStl>
          <Typography.Text strong ellipsis={{ tooltip: first }}>
            {first}
          </Typography.Text>
        </MainStl>
        <FooterStl>
          <Typography.Text type="secondary" style={{ flexGrow: 1 }} ellipsis={{ tooltip: second }}>
            {second}
          </Typography.Text>
          {extra}
        </FooterStl>
      </ContentStl>
    </ContainerStl>
  );

  return simple ? (
    <Tooltip
      color="#e6ede3"
      styles={{ root: { maxWidth: "unset" } }}
      title={cardContent}
    >
      <Typography.Text strong>{user ? user.displayName : "Anonymous"}</Typography.Text>
    </Tooltip>
  ) : (
    cardContent
  );
}

const ContainerStl = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
  align-items: center;
  gap: 8px;
`;
const SiderStl = styled.div`
  display: flex;
  height: 100%;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
`;
const ContentStl = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;
const MainStl = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const FooterStl = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 4px;
`;
const IconStl = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${green[6]};
  color: white;
  font-weight: bold;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
