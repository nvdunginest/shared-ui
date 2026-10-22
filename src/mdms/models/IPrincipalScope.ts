import { UUID } from "crypto";

/** A principal position the current user is secretary of, with the sectors covered (dta-mdms me/principal-positions/detail). */
type IPrincipalScope = {
  positionId: UUID;
  /** True when the relationship covers every sector; sectorIds is then empty */
  allSectors: boolean;
  sectorIds: UUID[];
};

export default IPrincipalScope;
