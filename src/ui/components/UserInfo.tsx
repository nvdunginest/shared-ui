import { getShortName } from "../../text-utils";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Tooltip, Typography } from "antd";
import { UUID } from "crypto";
import styled from "styled-components";

import { getAvatarColor } from "./avatarColor";

type Props = {
  userId: UUID;
  simple?: boolean;
  extra?: React.ReactNode;
  /** Overrides the displayed name (e.g. a stored snapshot name) instead of the live user's. */
  name?: string;
  /** Overrides the second line (default: "department (jobTitle)"). */
  subtitle?: string;
  /** Show only the name on the first line, without "(email)". */
  hideEmail?: boolean;
};

export default function UserInfo({
  userId,
  simple = false,
  extra,
  name,
  subtitle,
  hideEmail = false,
}: Props): JSX.Element {
  const { users } = useSharedUsers();
  const user = users.find((user) => user.id === userId);

  const displayName = name ?? (user ? user.displayName : "Anonymous");
  const first = hideEmail ? displayName : `${displayName} (${user ? user.mail : "N/A"})`;
  const second = subtitle ?? `${user ? user.department : "N/A"} (${user ? user.jobTitle : "N/A"})`;
  const avatarColor = getAvatarColor(user?.jobTitle);

  return simple ? (
    <Tooltip
      color="#e6ede3"
      styles={{
        root: {
          maxWidth: "unset",
        },
      }}
      title={
        <ContainerStl>
          <SiderStl>
            <IconStl $color={avatarColor}>
              {getShortName(displayName)}
            </IconStl>
          </SiderStl>
          {/* <Avatar style={{ backgroundColor: green[6] }}>
        {getShortName(displayName)}
      </Avatar> */}
          <ContentStl>
            <MainStl>
              <Typography.Text strong ellipsis={{ tooltip: first }}>
                {first}
              </Typography.Text>
            </MainStl>
            <FooterStl>
              <Typography.Text
                type="secondary"
                style={{ flexGrow: 1 }}
                ellipsis={{ tooltip: second }}
              >
                {second}
              </Typography.Text>
              {extra}
            </FooterStl>
          </ContentStl>
        </ContainerStl>
      }
    >
      <Typography.Text strong>
        {displayName}
      </Typography.Text>
    </Tooltip>
  ) : (
    <ContainerStl>
      <SiderStl>
        <IconStl $color={avatarColor}>{getShortName(displayName)}</IconStl>
      </SiderStl>

      <ContentStl>
        <MainStl>
          <Typography.Text strong ellipsis={{ tooltip: first }}>
            {first}
          </Typography.Text>
        </MainStl>
        <FooterStl>
          <Typography.Text
            type="secondary"
            style={{ flexGrow: 1 }}
            ellipsis={{ tooltip: second }}
          >
            {second}
          </Typography.Text>
          {extra}
        </FooterStl>
      </ContentStl>
    </ContainerStl>
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

const IconStl = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;

  border-radius: 50%;
  background-color: ${({ $color }) => $color};

  color: white;
  font-weight: bold;
  font-size: 13px;

  display: flex;
  align-items: center;
  justify-content: center;
`;
