import { axiosBuilder } from "@ptht365/shared-ui/platform";
import { UUID } from "crypto";

async function add(documentId: UUID, model: AddFollowersModel) {
  const res = await (
    await axiosBuilder.getInstance()
  ).post(`/documents/${documentId}/followers`, model);
  return res.data;
}

async function remove(documentId: UUID, followerId: UUID) {
  const res = await (
    await axiosBuilder.getInstance()
  ).delete(`/documents/${documentId}/followers/${followerId}`);
  return res.data;
}

const followersController = {
  addConsultant: add,
  removeConsultant: remove,
};

export default followersController;

export type AddFollowersModel = {
  userIds: UUID[];
};
