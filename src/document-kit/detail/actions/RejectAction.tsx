import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { useEffect, useState } from "react";
import { StopOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { useAppContext } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Input, Modal } from "antd";
import { UUID } from "crypto";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";

export default function RejectAction(): JSX.Element {
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
    // Ẩn nút nếu người xử lý hiện tại chính là người tạo
    if (state.document.processorPositionId === state.document.creatorPositionId) {
      setEnable(false); return;
    }
    setEnable(CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments));
  }, [state.document, userId, departments]);

  const handleClose = () => {
    setOpen(false);
    setApprovalMessage("");
  };

  const handleOk = async () => {
    if (state.document === null) return;
    if (!approvalMessage.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    setIsLoading(true);
    try {
      await detail.api.reject(state.document.id, {
        approvalMessage: approvalMessage.trim(),
      });
      message.success("Từ chối thành công");
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
        icon={<StopOutlined />}
        $tone="danger"
        size="middle"
        onClick={() => setOpen(true)}
      >
        Từ chối
      </ActionBarButton>

      <Modal
        title={`Từ chối ${docName}`}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        closeIcon={false}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Đóng"
        confirmLoading={isLoading}
      >
        <Input.TextArea
          rows={4}
          placeholder="Lý do từ chối (bắt buộc)"
          value={approvalMessage}
          onChange={(e) => setApprovalMessage(e.target.value)}
        />
      </Modal>
    </>
  );
}
