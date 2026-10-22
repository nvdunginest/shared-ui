import { UUID } from "crypto";

import IPosition from "./IPosition";

// Flat department from GET org-chart/companies/{id}/departments/flat (positions[] embedded).
type IDepartment = {
  id: UUID;
  tenantId: UUID;
  departmentCode: string;
  departmentName: string;
  order: number;
  isActive: boolean;
  companyId: UUID;
  parentId: UUID | null;
  positions: IPosition[];
};

export default IDepartment;
