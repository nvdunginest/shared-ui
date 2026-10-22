import type { UUID } from "crypto";

import type { IBaseEntity } from "../../platform-kit";
import type IActivity from "./IActivity";
import type IAttachment from "./IAttachment";
import type IFollower from "./IFollower";

/**
 * What the sections of the detail screen (discussion, history, attachments) read of a document. A document that has
 * no status at all (outgoing documents) simply omits it.
 */
export type DocumentCore = IBaseEntity & {
  id: UUID;
  status?: number;
  activities: IActivity[];
  attachments: IAttachment[];
};

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
