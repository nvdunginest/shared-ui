import type { ISharedUser } from "@ptht365/shared-ui/shared-users";

import type IDepartment from "../models/IDepartment";

export type ActorDisplay = {
  name: string;
  positionName: string;
  departmentName: string;
  email?: string;
};

/**
 * Resolve thông tin hiển thị của một actor từ departments / users.
 *
 * - isFinalized=false (đang xử lý): lấy người đang giữ vị trí (position.userId)
 * - isFinalized=true  (đã kết thúc): dùng storedUserId đã lưu + snapshotFullName (ưu tiên)
 */
export function resolveActor(
  positionId: string,
  storedUserId: string,
  snapshotFullName: string | null | undefined,
  isFinalized: boolean,
  departments: IDepartment[],
  users: ISharedUser[],
): ActorDisplay {
  const allPositions = departments.flatMap((d) => d.positions);
  const position = allPositions.find((p) => p.id === positionId);
  const department = departments.find((d) =>
    d.positions.some((p) => p.id === positionId),
  );

  const resolvedUserId = isFinalized ? storedUserId : position?.userId;
  const user = resolvedUserId ? users.find((u) => u.id === resolvedUserId) : undefined;

  const name = isFinalized
    ? (snapshotFullName ?? user?.displayName ?? "N/A")
    : (user?.displayName ?? "Chưa bổ nhiệm");

  return {
    name,
    positionName: position?.positionName ?? "—",
    departmentName: department?.departmentName ?? "",
    email: user?.mail,
  };
}

/**
 * The org-chart role a user holds (for people who are tied to a user, not to a position, such as a
 * document's secretaries). Prefers an active position of `companyId`; undefined when they hold none.
 */
export function findHeldPosition(
  userId: string,
  departments: IDepartment[],
  companyId?: string | null,
): { positionName: string; departmentName: string } | undefined {
  const held = departments
    .filter((d) => !companyId || d.companyId === companyId)
    .flatMap((d) => d.positions.filter((p) => p.userId === userId).map((p) => ({ p, d })));
  const best = held.find(({ p, d }) => p.isActive && d.isActive) ?? held[0];
  return best ? { positionName: best.p.positionName, departmentName: best.d.departmentName } : undefined;
}
