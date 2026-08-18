import IBaseEntity from "./IBaseEntity";

type IDrive = IBaseEntity & {
  objectKey: string;
  spDriveId: string;
  itemId: string;
};

export default IDrive;
