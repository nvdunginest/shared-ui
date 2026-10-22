import type { IBaseEntity } from "../../platform-kit";
import { UUID } from "crypto";

type IFollower = IBaseEntity & {
  userId: UUID;
};

export default IFollower;
