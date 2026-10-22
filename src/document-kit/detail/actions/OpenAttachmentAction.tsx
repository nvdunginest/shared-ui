import { EyeOutlined } from "@ant-design/icons";
import {
  AttachmentView,
  useDocumentContext,
} from "../../context/document/index";
import attachmentsController from "../../api/attachments.controller";
import IAttachment from "../../models/IAttachment";
import { filesHelper } from "../../../platform-kit";
import { Button } from "antd";
import { UUID } from "crypto";

type Props = {
  attachment: IAttachment;
};

export function OpenAttachmentAction({ attachment }: Props): JSX.Element {
  const { state, setCurrentAttachmentView, addAttachmentView } =
    useDocumentContext();

  const handleOpenAttachment = async (attachmentId: UUID, fileName: string) => {
    if (state.document === null) return;
    const exist = state.attachments.find(
      (x) => x.attachmentId === attachmentId
    );
    if (exist !== undefined) {
      setCurrentAttachmentView(exist);
    } else {
      try {
        const data = await attachmentsController.getViewId(
          state.document.id,
          attachmentId
        );

        const content: AttachmentView = {
          attachmentId,
          filename: fileName,
          extension: attachment.extension,
          uri: filesHelper.getFileStaticUrl(data),
        };

        addAttachmentView(content);
        setCurrentAttachmentView(content);
      } catch {
        // console.print("Cannot get url attachment", error);
      }
    }
  };

  return (
    <Button
      size="small"
      icon={<EyeOutlined />}
      onClick={() => {
        handleOpenAttachment(attachment.id, attachment.filename);
      }}
    >
      Xem
    </Button>
  );
}
