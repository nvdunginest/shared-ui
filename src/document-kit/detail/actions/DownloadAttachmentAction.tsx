import { DownloadOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import attachmentsHelper from "../../helpers/attachments.helper";
import IAttachment from "../../models/IAttachment";
import { Button } from "antd";

type Props = {
  attachment: IAttachment;
};

export function DownloadAttachmentAction({ attachment }: Props): JSX.Element {
  const { state } = useDocumentContext();

  const handleDownloadFile = async () => {
    if (state.document === null) return;

    try {
      await attachmentsHelper.downloadAttachment(
        state.document.id,
        attachment.id,
        attachment.filename
      );
    } catch {
      // console.print("Cannot download file!", error);
    }
  };

  return (
    <Button
      size="small"
      type="primary"
      icon={<DownloadOutlined />}
      onClick={() => {
        handleDownloadFile();
      }}
    >
      Tải
    </Button>
  );
}
