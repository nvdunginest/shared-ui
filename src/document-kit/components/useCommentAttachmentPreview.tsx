import { useState } from "react";
import { message } from "antd";

import filesHelper from "../../platform-kit/helpers/files.helper";

import AttachmentPreviewModal from "./AttachmentPreviewModal";

type Preview = { title: string; extension: string; uri: string; downloadUri?: string };

const PREVIEW_EXTENSIONS = ["pdf", "docx", "xlsx", "pptx"];
const OFFICE_EXTENSIONS = ["docx", "xlsx", "pptx"];

const getExtension = (fileName: string): string => fileName.split(".").pop()?.toLowerCase() ?? "";

// An attachment in a comment is embedded as a data: URL. pdf.js reads it through a blob URL; the Office
// viewer needs a URL it can reach, so the file goes through the same upload as the document attachments.
async function resolvePreview(fileName: string, fileData: string): Promise<Preview> {
  const extension = getExtension(fileName);
  const blob = await (await fetch(fileData)).blob();
  if (extension === "pdf") {
    return { title: fileName, extension, uri: URL.createObjectURL(blob) };
  }
  const viewId = await filesHelper.upload(new File([blob], fileName, { type: blob.type }));
  if (!viewId) throw new Error("upload failed");
  const uri = filesHelper.getFileStaticUrl(viewId);
  return { title: fileName, extension, uri, downloadUri: uri };
}

/**
 * Preview of the files attached inside a comment (the CKEditor attachment widget): `onAttachmentClick` goes to the
 * editor, `modal` is rendered once next to it. Only pdf/word/excel/powerpoint are previewed; other types are not
 * handled (the read-only view downloads them).
 */
export function useCommentAttachmentPreview(): {
  onAttachmentClick: (a: { fileName: string; fileData: string }) => boolean;
  modal: JSX.Element;
} {
  const [preview, setPreview] = useState<Preview | null>(null);

  const closePreview = () => {
    if (preview?.uri.startsWith("blob:")) URL.revokeObjectURL(preview.uri);
    setPreview(null);
  };

  const onAttachmentClick = ({ fileName, fileData }: { fileName: string; fileData: string }): boolean => {
    const extension = getExtension(fileName);
    if (!PREVIEW_EXTENSIONS.includes(extension)) return false;

    const hide = OFFICE_EXTENSIONS.includes(extension) ? message.loading("Đang mở tệp...", 0) : undefined;
    resolvePreview(fileName, fileData)
      .then(setPreview)
      .catch(() => message.error("Không thể mở tệp, vui lòng thử lại."))
      .finally(() => hide?.());
    return true;
  };

  const modal = (
    <AttachmentPreviewModal
      open={preview !== null}
      title={preview?.title}
      extension={preview?.extension ?? ""}
      uri={preview?.uri ?? ""}
      downloadUri={preview?.downloadUri}
      onClose={closePreview}
    />
  );

  return { onAttachmentClick, modal };
}
