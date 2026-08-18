import { UUID } from "crypto";

type IUser = {
  id: UUID;
  displayName: string;
  mail: string;
  department: string | null;
  jobTitle: string | null;
};

export default IUser;
