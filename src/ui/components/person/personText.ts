// One place that decides how a person and their title are written, so every app reads the same.
//
// Two kinds of display, never mixed:
//   - "Người": a user of the directory -> name + e-mail (no title: Azure AD jobTitle is not shown);
//   - "Chức danh": a person in the org-chart role they act in (processor, approver, history,
//     "chọn người (chức danh)") -> name + "Position · Department" + e-mail.

const SEPARATOR = " · ";
export const UNASSIGNED_HOLDER_LABEL = "Chưa bổ nhiệm";

const joinParts = (...parts: Array<string | null | undefined>): string =>
  parts.map((part) => part?.trim()).filter(Boolean).join(SEPARATOR);

/** Org-chart position title line: "Trưởng phòng · Phòng Kế toán". */
export const getPositionSubtitle = (positionName?: string | null, departmentName?: string | null): string =>
  joinParts(positionName, departmentName) || "—";

/** Label of a position option once picked: "Nguyễn Văn A — Trưởng phòng". */
export const getPositionHolderLabel = (holderName: string | null | undefined, positionName: string): string =>
  `${holderName?.trim() || UNASSIGNED_HOLDER_LABEL} — ${positionName}`;

/** Text a search box matches against for a user or a position holder (accent-insensitive matching is the caller's). */
export const getPersonSearchText = (...parts: Array<string | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
