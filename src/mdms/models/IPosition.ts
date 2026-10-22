import { UUID } from "crypto";

type IPosition = {
  id: UUID;
  departmentId: UUID;
  tierId: UUID | null;
  tierName: string | null;
  positionName: string;
  positionAlias: string | null;
  userId: string | null;
  order: number;
  isActive: boolean;
  /** Personnel level of the position (norm lookup); null/absent when not assigned. */
  personnelLevelId?: UUID | null;
};

export default IPosition;
