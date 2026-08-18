import { UUID } from "crypto";

import IBaseEntity from "./IBaseEntity";

type IUserRole = IBaseEntity & {
  role: string;
  userId: UUID;
};

export default IUserRole;
