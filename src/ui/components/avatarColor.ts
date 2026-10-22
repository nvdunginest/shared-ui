// Avatar background color by the person's Azure AD job title, the same everywhere initials-avatars
// are drawn (list items, info panel, discussion, history, mentions):
//   - contains "Chủ tịch Hội đồng quản trị", but not "Phó Chủ tịch ..." -> orange
//   - contains "Tổng giám đốc"                                           -> green
//   - anything else (or unknown)                                         -> earth brown
// The match ignores case and Vietnamese diacritics. The chairman rule wins when both appear.

import type { ISharedUser } from "@ptht365/shared-ui/shared-users";
import { avatarColors } from "../../theme";

import { removeVietnameseTones } from "../../utils";

const CHAIRMAN_TITLE = "chu tich hoi dong quan tri";
// A vice chairman is not the chairman, even though the title contains the same words.
const VICE_CHAIRMAN_TITLE = "pho chu tich";
const CEO_TITLE = "tong giam doc";

const normalize = (text: string): string => removeVietnameseTones(text).toLowerCase();

export function getAvatarColor(jobTitle?: string | null): string {
  const title = normalize(jobTitle ?? "");
  if (title.includes(CHAIRMAN_TITLE) && !title.includes(VICE_CHAIRMAN_TITLE)) return avatarColors.chairman;
  if (title.includes(CEO_TITLE)) return avatarColors.ceo;
  return avatarColors.default;
}

/** Looks the person up in the shared users (by id, then e-mail, then display name) and colors by their job title. */
export function getAvatarColorForUser(
  users: ISharedUser[],
  who: { id?: string | null; mail?: string | null; name?: string | null },
): string {
  const user =
    (who.id ? users.find((u) => u.id === who.id) : undefined) ??
    (who.mail ? users.find((u) => u.mail === who.mail) : undefined) ??
    (who.name ? users.find((u) => u.displayName === who.name) : undefined);
  return getAvatarColor(user?.jobTitle);
}
