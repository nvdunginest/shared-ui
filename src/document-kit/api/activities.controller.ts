import { axiosBuilder } from "@ptht365/shared-ui/platform";

async function addComment(documentId: string, model: AddCommentModel) {
  const res = await (
    await axiosBuilder.getInstance()
  ).post(`/documents/${documentId}/activities/comment`, model);
  return res.data;
}

async function recallComment(documentId: string, activityId: string) {
  const res = await (
    await axiosBuilder.getInstance()
  ).put(`/documents/${documentId}/activities/${activityId}/recall`);
  return res.data;
}

const activitiesController = {
  addComment,
  recallComment,
};

export default activitiesController;

export type AddCommentModel = {
  content: string;
  refId?: string;
  objectData?: CommentObjectData;
};

export type CommentObjectData = {
  isPrivate: boolean;
  mentionedUserIds: string[];
};
