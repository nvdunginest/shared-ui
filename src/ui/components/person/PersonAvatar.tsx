import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import styled from "styled-components";

import { getShortName } from "../../../text-utils";
import { getAvatarColor, getAvatarColorForUser } from "../avatarColor";

export type PersonAvatarSize = "small" | "default";

type Props = {
  name: string;
  /** Used to find the user (and so the color) when `jobTitle` is not known. */
  userId?: string | null;
  mail?: string | null;
  jobTitle?: string | null;
  /** small = 20px (list rows), default = 32px (cards, history, comments). */
  size?: PersonAvatarSize;
};

const DIMENSIONS: Record<PersonAvatarSize, { box: number; font: number }> = {
  small: { box: 20, font: 9 },
  default: { box: 32, font: 13 },
};

/** The single initials avatar of the apps: same initials, colors and sizes everywhere. */
export default function PersonAvatar({ name, userId, mail, jobTitle, size = "default" }: Props): JSX.Element {
  const { users } = useSharedUsers();
  const color =
    jobTitle !== undefined ? getAvatarColor(jobTitle) : getAvatarColorForUser(users, { id: userId, mail, name });
  const { box, font } = DIMENSIONS[size];

  return (
    <AvatarStl $color={color} $box={box} $font={font} aria-hidden>
      {getShortName(name || "?").toUpperCase()}
    </AvatarStl>
  );
}

const AvatarStl = styled.span<{ $color: string; $box: number; $font: number }>`
  flex: 0 0 auto;
  width: ${({ $box }) => $box}px;
  height: ${({ $box }) => $box}px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  color: #fff;
  font-size: ${({ $font }) => $font}px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
