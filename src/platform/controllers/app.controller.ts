import axiosBuilder from "../axios.instance";

async function getVersion(): Promise<string> {
  const res = await (await axiosBuilder.getInstance()).get("/app/version");
  return res.data;
}

const appController = { getVersion };
export default appController;
