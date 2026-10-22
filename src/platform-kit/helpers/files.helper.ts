import { getBaseUrl } from "@ptht365/shared-ui/platform";
import filesController from "../controllers/files.controller";

const { startSession, uploadChunk, finishSession } = filesController;

export const chunkSize = 1048576 * 0.5; // 1MB * number

function getFileStaticUrl(viewId: string): string {
  return `${getBaseUrl()}/files/${viewId}`;
}

export type FileUploadCallback = {
  onFailed?: (message: string) => void;
  onProgress?: (percent: number) => void;
};

async function upload(
  file: File,
  callback?: FileUploadCallback,
  chunkSize = 1048576 * 0.5,
): Promise<string | null> {
  const chunkCount =
    file.size % chunkSize === 0
      ? file.size / chunkSize
      : Math.floor(file.size / chunkSize) + 1;

  try {
    const sessionId = await startSession();
    let begin = 0;
    let end = chunkSize;
    for (let id = 1; id <= chunkCount; id++) {
      const chunk = file.slice(begin, end);
      try {
        await uploadChunk(id, sessionId, chunk);
        begin = end;
        end = end + chunkSize;
        if (callback?.onProgress) callback.onProgress(id / chunkCount);
      } catch {
        if (callback?.onFailed)
          callback.onFailed(`Upload chunk fail id: ${id}`);
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
