import type IBaseEntity from "../../platform-kit/models/IBaseEntity";
import { UUID } from "crypto";

type IPositionGroup = IBaseEntity & {
  companyId: UUID;
  groupCode: string;
  groupName: string;
  description: string | null;
  order: number;
  isActive: boolean;
  memberCount: number;
  userCount: number;
};

export default IPositionGroup;
