import type IBaseEntity from "../../platform-kit/models/IBaseEntity";

type ISector = IBaseEntity & {
  sectorName: string;
  order: number;
  isActive: boolean;
};

export default ISector;
