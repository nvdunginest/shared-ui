import type { ISharedUser } from "@ptht365/shared-ui/shared-users";

import type IActivity from "../models/IActivity";
import type IActorSnapshot from "../models/IActorSnapshot";

/**
 * Actor (tên, chức danh) được BE chụp lại tại thời điểm phát sinh activity, lưu trong
 * activity.actorJsonData — dùng để hiển thị đúng lịch sử, không phụ thuộc dữ liệu user hiện tại.
 */
export const parseActorSnapshot = (actorJsonData: string): IActorSnapshot => {
  try {
    return JSON.parse(actorJsonData) as IActorSnapshot;
  } catch {
    return {};
  }
};

/**
 * Name of the person behind an activity. Comments store an empty `Fullname` in the actor snapshot
 * (only the user id is filled), so fall back to the display name of that user.
 */
export const getActivityActorName = (activity: IActivity, users: ISharedUser[]): string => {
  const actor = parseActorSnapshot(activity.actorJsonData);
  // A snapshot written before the name was resolved properly may hold an e-mail: never show that.
  if (actor.Fullname && !actor.Fullname.includes("@")) return actor.Fullname;
  const userId = activity.userId || actor.UserId;
  return users.find((u) => u.id === userId)?.displayName ?? "";
};

/** How one activity type is described in the history ("Đã phê duyệt tờ trình"); the wording is the app's. */
export type ActivityRenderConfig = {
  activityType: number;
  text: string;
  showContent: boolean;
};
