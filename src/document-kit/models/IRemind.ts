import type { IBaseEntity } from "../../platform-kit";
import { UUID } from "crypto";

type IRemind = IBaseEntity & {
  userId: UUID;
  isSeen: boolean;
};

export default IRemind;
