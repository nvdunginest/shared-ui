import type { IBaseEntity } from "../../platform-kit";

type IAttachment = IBaseEntity & {
  filename: string;
  extension: string;
  storageId: string;
  size: number;
};

export default IAttachment;
