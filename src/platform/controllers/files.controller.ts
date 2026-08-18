import axios from "axios";

import axiosBuilder, { getBaseUrl } from "../axios.instance";

async function startSession(): Promise<string> {
  const res = await (await axiosBuilder.getInstance()).post("/files/start-session");
  return res.data;
}

async function uploadChunk(id: number, sessionId: string, chunk: unknown): Promise<unknown> {
  const token = await axiosBuilder.getAccessToken();
  const res = await axios.post(`${getBaseUrl()}/files/upload-chunk`, chunk, {
    params: { id, sessionId },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 3600,
  });
  return res.data;
}

async function finishSession(sessionId: string): Promise<string> {
  const res = await (
    await axiosBuilder.getInstance({ params: { sessionId } })
  ).post("/files/finish-session");
  return res.data;
}

const filesController = { startSession, uploadChunk, finishSession };
export default filesController;
