import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Tooltip, Typography } from "antd";
import { UUID } from "crypto";
import styled from "styled-components";

import PersonAvatar from "./person/PersonAvatar";

type Props = {
  userId: UUID;
  simple?: boolean;
  extra?: React.ReactNode;
  /** Overrides the displayed name (e.g. a stored snapshot name) instead of the live user's. */
  name?: string;
  /**
   * Position title ("Chức danh · Phòng", see getPositionSubtitle). Given = the "Chức danh" kind:
   * name, position title, e-mail. Omitted = the "Người" kind: name and e-mail only.
   */
  subtitle?: string;
  /** @deprecated e-mail is part of both kinds; kept so apps not yet ported still compile. */
  hideEmail?: boolean;
};

export default function UserInfo({
  userId,
  simple = false,
  extra,
  name,
  subtitle,
}: Props): JSX.Element {
  const { users } = useSharedUsers();
  const user = users.find((user) => user.id === userId);

  const displayName = name ?? (user ? user.displayName : "Anonymous");
  const email = user?.mail || null;

  const card = (
    <ContainerStl>
      <PersonAvatar name={displayName} userId={userId} />
      <ContentStl>
        <LineStl>
          <Typography.Text strong ellipsis={{ tooltip: displayName }}>
            {displayName}
          </Typography.Text>
        </LineStl>
        {subtitle && (
          <LineStl>
            <Typography.Text ellipsis={{ tooltip: subtitle }}>{subtitle}</Typography.Text>
          </LineStl>
        )}
        <FooterStl>
          <Typography.Text type="secondary" style={{ flexGrow: 1 }} ellipsis={{ tooltip: email ?? "N/A" }}>
            {email ?? "N/A"}
          </Typography.Text>
          {extra}
        </FooterStl>
      </ContentStl>
    </ContainerStl>
  );

  return simple ? (
    <Tooltip color="#e6ede3" styles={{ root: { maxWidth: "unset" } }} title={card}>
      <Typography.Text strong>{displayName}</Typography.Text>
    </Tooltip>
  ) : (
    card
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

const ContentStl = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

const LineStl = styled.div`
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
