import type IBaseEntity from "../../platform-kit/models/IBaseEntity";
import { UUID } from "crypto";

type ITier = IBaseEntity & {
  tierName: string;
  order: number;
  companyId: UUID;
  isActive: boolean;
};

export default ITier;
