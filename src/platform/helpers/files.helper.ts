import { getBaseUrl } from "../axios.instance";
import filesController from "../controllers/files.controller";

const { startSession, uploadChunk, finishSession } = filesController;

export const chunkSize = 1048576 * 0.5;

export function getFileStaticUrl(viewId: string): string {
  return `${getBaseUrl()}/files/${viewId}`;
}

export type FileUploadCallback = {
  onFailed?: (message: string) => void;
  onProgress?: (percent: number) => void;
};

export async function upload(
  file: File,
  callback?: FileUploadCallback,
  uploadChunkSize = chunkSize
): Promise<string | null> {
  const chunkCount =
    file.size % uploadChunkSize === 0
      ? file.size / uploadChunkSize
      : Math.floor(file.size / uploadChunkSize) + 1;

  try {
    const sessionId = await startSession();
    let begin = 0;
    let end = uploadChunkSize;
    for (let id = 1; id <= chunkCount; id++) {
      const chunk = file.slice(begin, end);
      try {
        await uploadChunk(id, sessionId, chunk);
        begin = end;
        end = end + uploadChunkSize;
        if (callback?.onProgress) callback.onProgress(id / chunkCount);
      } catch {
        if (callback?.onFailed) callback.onFailed(`Upload chunk fail id: ${id}`);
        return null;
      }
    }
    return await finishSession(sessionId);
  } catch (err) {
    console.log(err);
    if (callback?.onFailed) callback.onFailed("Start session fail");
    return null;
  }
}

const filesHelper = { getFileStaticUrl, upload };
export default filesHelper;
