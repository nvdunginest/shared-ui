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

const userRolesController = {
  getMyRoles,
  checkAdmin,
};

export default userRolesController;
