import { axiosBuilder } from "@ptht365/shared-ui/platform";
import { UUID } from "crypto";

async function getViewId(
  documentId: UUID,
  attachmentId: UUID,
): Promise<string> {
  const res = await (
    await axiosBuilder.getInstance()
  ).get(`/documents/${documentId}/attachments/${attachmentId}/file`);
  return res.data;
}

async function addAttachment(documentId: UUID, model: AddAttachmentModel) {
  const res = await (
    await axiosBuilder.getInstance()
  ).post(`/documents/${documentId}/attachments`, model);
  return res.data;
}

async function removeAttachment(
  documentId: UUID,
  attachmentId: UUID,
): Promise<unknown> {
  const res = await (
    await axiosBuilder.getInstance()
  ).delete(`/documents/${documentId}/attachments/${attachmentId}`);
  return res.data;
}

const attachmentsController = {
  getViewId,
  addAttachment,
  removeAttachment,
};

export default attachmentsController;

export type AddAttachmentModel = {
  filename: string;
  storageId: string;
  size: number;
};
