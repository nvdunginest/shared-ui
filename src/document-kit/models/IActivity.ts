import type { IBaseEntity } from "../../platform-kit";
import { UUID } from "crypto";

type IActivity = IBaseEntity & {
  userId: UUID;
  /** Backend activity type; see ActivityType for the ones the kit knows. */
  activityType: number;
  content: string;
  objectJsonData: string;
  actorJsonData: string;
  referenceId: UUID | null;
  isRecalled: boolean;
  recalledTime: string | null;
  /**
   * BR-48→BR-52: cờ tính sẵn từ BE (đúng tác giả, chưa thu hồi, chưa có reply, còn hạn 24h, tờ trình
   * chưa kết thúc) — FE chỉ đọc trực tiếp field này, KHÔNG tự tính lại điều kiện 24h theo đồng hồ
   * trình duyệt để tránh lệch timezone giữa server/client.
   */
  canRecall: boolean;
};

export default IActivity;
