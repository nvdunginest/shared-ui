import IUser from "../models/IUser";
import axiosBuilder from "../axios.instance";

async function getUsers(): Promise<IUser[]> {
  const res = await (await axiosBuilder.getInstance()).get("/users");
  return res.data;
}

const usersController = { getUsers };
export default usersController;
