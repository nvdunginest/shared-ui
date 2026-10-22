import type IBaseEntity from "../../platform-kit/models/IBaseEntity";

type ICompany = IBaseEntity & {
  companyCode: string;
  companyName: string;
  order: number;
  isActive: boolean;
};

export default ICompany;
