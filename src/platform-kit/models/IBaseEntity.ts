import { UUID } from "crypto";

type IBaseEntity = {
  id: UUID;
  createdTime: Date;
  updatedTime: Date;
  tenantId: UUID;
};

export default IBaseEntity;
