import type { IBaseEntity } from "../../platform-kit";
import { UUID } from "crypto";

type IParticipant = IBaseEntity & {
  userId: UUID;
};

export default IParticipant;
