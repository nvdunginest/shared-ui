import type IBaseEntity from "../../platform-kit/models/IBaseEntity";

type IProject = IBaseEntity & {
  projectCode: string;
  projectName: string;
  isActive: boolean;
};

export default IProject;
