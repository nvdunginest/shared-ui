import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { useAppContext } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Input, Modal } from "antd";
import { UUID } from "crypto";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";

export default function CancelAction(): JSX.Element {
  const { message } = useModuleFeedback();
  const { detail } = useDocumentKit();
  const docName = getUiConfig().documentName;
  const { userId } = useAppContext().state;
  const { departments } = useGlobalContext().globalState;
  const { state, fetchDocument } = useDocumentContext();

  const [enable, setEnable] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (state.document === null) { setEnable(false); return; }
    if (
      !detail.statuses.cancelable.includes(state.document.status)
    ) { setEnable(false); return; }
    // US-08: tờ trình đã từng rời khỏi tay creator (Lưu-và-trình hoặc Chuyển xử lý)
    // thì không bao giờ còn Hủy được nữa, kể cả khi đã được trả về đúng creator.
    if (state.document.firstTransferredAt !== null) { setEnable(false); return; }
    // Chỉ người đang giữ vị trí Người xử lý mới được Hủy. Với tờ trình chưa từng
    // Chuyển xử lý (firstTransferredAt == null), ProcessorPositionId luôn trùng
    // CreatorPositionId (xem Document.CreateNewDocument), nên check này tương đương
    // "chỉ người tạo mới được Hủy" — khớp US-08 và Document.Delete() ở backend.
    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false); return;
    }
    setEnable(true);
  }, [state.document, userId, departments]);

  const handleClose = () => {
    setOpen(false);
    setReason("");
  };

  const handleOk = async () => {
    if (state.document === null) return;
    if (!reason.trim()) {
      message.warning("Vui lòng nhập lý do hủy");
      return;
    }
    setIsLoading(true);
    try {
      await detail.api.cancel(state.document.id, {
        reason: reason.trim(),
      });
      message.success(`Hủy ${docName} thành công`);
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
        icon={<DeleteOutlined />}
        $tone="danger"
        size="middle"
        onClick={() => setOpen(true)}
      >
        Hủy {docName}
      </ActionBarButton>

      <Modal
        title={`Hủy ${docName}`}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        closeIcon={false}
        okText="Xác nhận hủy"
        okButtonProps={{ danger: true }}
        cancelText="Đóng"
        confirmLoading={isLoading}
      >
        <Input.TextArea
          rows={4}
          placeholder="Lý do hủy (bắt buộc)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </>
  );
}
