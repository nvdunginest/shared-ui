import type { UUID } from "crypto";

import type { IBaseEntity } from "../../platform-kit";
import type IActivity from "./IActivity";
import type IAttachment from "./IAttachment";
import type IFollower from "./IFollower";

/** The fields of a document the kit itself reads; each app's own `IDocument` extends it with its domain fields. */
export type DocumentBase = IBaseEntity & {
  id: UUID;
  companyId: UUID;
  status: number;
  title: string;
  creatorUserId: UUID;
  creatorPositionId: UUID;
  processorUserId: UUID;
  processorPositionId: UUID;
  tierId: UUID;
  sectorId?: UUID | null;
  /** First time the document left its creator; null = never (then the creator may still cancel it). */
  firstTransferredAt: string | null;
  activities: IActivity[];
  attachments: IAttachment[];
  followers: IFollower[];
};
