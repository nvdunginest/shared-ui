import { UUID } from "crypto";

import IUserRole from "../models/IUserRole";
import { axiosBuilder } from "@ptht365/shared-ui/platform";

async function getMyRoles(): Promise<IUserRole[]> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/me");
  return res.data;
}

async function checkAdmin(): Promise<boolean> {
  const res = await (
    await axiosBuilder.getInstance()
  ).get("/user-roles/me/is-admin");
  return res.data;
}

async function getMods(): Promise<IUserRole[]> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/mods");
  return res.data;
}

async function addMod(model: AddModModel): Promise<unknown> {
  const res = await (
    await axiosBuilder.getInstance()
  ).post("/user-roles/mods", model);
  return res.data;
}

async function removeMod(userId: UUID): Promise<unknown> {
  const res = await (
    await axiosBuilder.getInstance()
  ).delete(`/user-roles/mods/${userId}`);
  return res.data;
}

const userRolesController = {
  getMyRoles,
  checkAdmin,
  getMods,
  addMod,
  removeMod,
};

export default userRolesController;

export type AddModModel = {
  userId: UUID;
};
