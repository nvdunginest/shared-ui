import type { UUID } from "crypto";

import type { IPrincipalScope } from "../../mdms";

type SecretaryDocumentRef = {
  processorPositionId: UUID;
  sectorId?: UUID | null;
};

/**
 * UX hint only (the backend re-checks on execution): true when the user is a secretary of the document's processor
 * position and the relationship covers all sectors or the document's sector. A document without a sector matches
 * only all-sector relationships.
 */
export function isSecretaryOfDocument(scopes: IPrincipalScope[], doc: SecretaryDocumentRef): boolean {
  return scopes.some(
    (s) =>
      s.positionId === doc.processorPositionId &&
      (s.allSectors || (!!doc.sectorId && s.sectorIds.includes(doc.sectorId))),
  );
}
