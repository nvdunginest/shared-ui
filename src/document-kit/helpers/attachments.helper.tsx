import {
  FileExcelOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import { filesHelper } from "../../platform-kit";
import attachmentsController from "../api/attachments.controller";
import { UUID } from "crypto";

const { getViewId: getAttachmentViewId } = attachmentsController;

async function downloadAttachment(
  documentId: UUID,
  attachmentId: UUID,
  fileName: string
) {
  const viewId = await getAttachmentViewId(documentId, attachmentId);
  const link = document.createElement("a");
  // link.href = href;
  link.href = filesHelper.getFileStaticUrl(viewId);
  link.download = fileName;
  link.target = "_blank";
  // Construct the URI
  document.body.appendChild(link);
  link.click();
  // Cleanup the DOM
  document.body.removeChild(link);

  return true;
}

const getIconRender = (extension: string) => {
  switch (extension.toUpperCase()) {
    case ".XLSX":
    case ".XLS":
      return <FileExcelOutlined />;

    case ".PDF":
      return <FilePdfOutlined />;

    case ".DOCX":
    case ".DOC":
      return <FileWordOutlined />;

    case ".PPTX":
    case ".PPT":
      return <FilePptOutlined />;

    default:
      return <FileOutlined />;
  }
};

const attachmentsHelper = {
  downloadAttachment,
  getIconRender,
};

export default attachmentsHelper;
