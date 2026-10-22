import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import attachmentsController from "../../api/attachments.controller";
import IAttachment from "../../models/IAttachment";
import { useAppContext } from "../../../platform-kit";
import { Button, Popconfirm } from "antd";

import { CheckActor } from "./AddAttachmentAction";

type Props = {
  attachment: IAttachment;
};

export function RemoveAttachmentAction({ attachment }: Props): JSX.Element {
  const { detail } = useDocumentKit();
  const { userId: userId } = useAppContext().state;
  const { state } = useDocumentContext();
  const { departments } = useGlobalContext().globalState;
  const [enable, setEnable] = useState(false);

  const handleRemove = async () => {
    if (state.document === null) return;
    try {
      await attachmentsController.removeAttachment(
        state.document.id,
        attachment.id
      );
    } catch {
      // console.print("Cannot remove original attachment", error);
    }
  };

  useEffect(() => {
    if (state.document === null) {
      setEnable(false);
      return;
    }

    if (
      !detail.statuses.notEnded.includes(state.document.status)
    ) {
      setEnable(false);
      return;
    }

    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false);
      return;
    }

    setEnable(true);
  }, [state.document, userId, departments]);

  return (
    <Popconfirm
      title={`Xóa tài liệu ${detail.wording.approveVerb}`}
      description="Bạn có muốn xóa tài liệu này?"
      onConfirm={handleRemove}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
    >
      <Button
        type="primary"
        size="small"
        danger
        disabled={!enable}
        icon={<DeleteOutlined />}
      >
        Xóa
      </Button>
    </Popconfirm>
  );
}
