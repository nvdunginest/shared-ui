import { UUID } from "crypto";

import IUserRole from "../models/IUserRole";
import axiosBuilder from "../axios.instance";

async function getMods(): Promise<IUserRole[]> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/mods");
  return res.data;
}

async function getMembers(): Promise<IUserRole[]> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/members");
  return res.data;
}

async function getMyRoles(): Promise<IUserRole[]> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/me");
  return res.data;
}

async function checkAdmin(): Promise<boolean> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/me/is-admin");
  return res.data;
}

async function checkMod(): Promise<boolean> {
  const res = await (await axiosBuilder.getInstance()).get("/user-roles/me/is-mod");
  return res.data;
}

async function addMod(model: AddModModel): Promise<unknown> {
  const res = await (await axiosBuilder.getInstance()).post("/user-roles/mods", model);
  return res.data;
}

async function removeMod(userId: UUID): Promise<unknown> {
  const res = await (await axiosBuilder.getInstance()).delete(`/user-roles/mods/${userId}`);
  return res.data;
}

async function addMember(model: AddMemberModel): Promise<unknown> {
  const res = await (await axiosBuilder.getInstance()).post("/user-roles/members", model);
  return res.data;
}

async function removeMember(userId: UUID, role: string): Promise<unknown> {
  const res = await (
    await axiosBuilder.getInstance()
  ).delete(`/user-roles/members/${userId}/${role}`);
  return res.data;
}

const userRolesController = {
  getMods,
  getMembers,
  getMyRoles,
  checkAdmin,
  checkMod,
  addMod,
  removeMod,
  addMember,
  removeMember,
};

export default userRolesController;

export type AddModModel = { userId: UUID };
export type AddMemberModel = { userId: UUID; role: string };
