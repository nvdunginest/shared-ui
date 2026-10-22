import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { useEffect, useState } from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { useAppContext } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Input, Modal } from "antd";
import { UUID } from "crypto";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ApproveAction(): JSX.Element {
  const { message } = useModuleFeedback();
  const { detail } = useDocumentKit();
  const docName = getUiConfig().documentName;
  const { userId } = useAppContext().state;
  const { departments } = useGlobalContext().globalState;
  const { state, fetchDocument } = useDocumentContext();

  const [enable, setEnable] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    if (state.document === null) { setEnable(false); return; }
    if (!detail.statuses.processing.includes(state.document.status)) { setEnable(false); return; }
    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false); return;
    }

    // Chỉ hiện nút Phê duyệt khi tierId của vị trí người dùng khớp với document
    const userPosition = departments
      .filter((d) => d.companyId === state.document!.companyId)
      .flatMap((d) => d.positions)
      .find((p) => p.userId === userId?.toString() && p.id === state.document!.processorPositionId);

    if (!userPosition || userPosition.tierId !== state.document.tierId) {
      setEnable(false); return;
    }

    setEnable(true);

  }, [state.document, userId, departments]);

  const handleClose = () => {
    setOpen(false);
    setApprovalMessage("");
  };

  const handleOk = async () => {
    if (state.document === null) return;

    if (!approvalMessage.trim()) {
      message.warning(`Vui lòng nhập nội dung ${detail.wording.approveVerb}`);
      return;
    }

    setIsLoading(true);
    try {
      await detail.api.approve(state.document.id, {
        approvalMessage: approvalMessage || undefined,
      });
      message.success(`${cap(detail.wording.approveVerb)} thành công`);
      handleClose();
      fetchDocument(state.document.id as UUID);
    } catch (ex) {
      message.error(extractApiErrorMessage(ex, "Có lỗi xảy ra, vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!enable) return <></>;

  return (
    <>
      <ActionBarButton
        icon={<CheckCircleOutlined />}
        $tone="primary"
        size="middle"
        onClick={() => setOpen(true)}
      >
        {cap(detail.wording.approveVerb)}
      </ActionBarButton>

      <Modal
        title={`${cap(detail.wording.approveVerb)} ${docName}`}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        closeIcon={false}
        okText={cap(detail.wording.approveVerb)}
        cancelText="Hủy"
        confirmLoading={isLoading}
      >
        <Input.TextArea
          rows={4}
          placeholder={`Ý kiến ${detail.wording.approveVerb} (bắt buộc)`}
          value={approvalMessage}
          onChange={(e) => setApprovalMessage(e.target.value)}
        />
      </Modal>
    </>
  );
}
