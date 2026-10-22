import { isSecretaryOfDocument } from "../../helpers/secretary.helper";
import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { useEffect, useState } from "react";
import { RollbackOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { useAppContext } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Input, Modal, Radio, Space, Typography } from "antd";
import { UUID } from "crypto";
import styled from "styled-components";

import { colors, radii } from "../../../theme";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";

type GivebackType = "redo" | "wrongTier";


export default function GivebackAction(): JSX.Element {
  const { message } = useModuleFeedback();
  const { detail } = useDocumentKit();
  const docName = getUiConfig().documentName;
  const principalMode = useDocumentKit().mdms.principalPositions;
  const descriptions: Record<GivebackType, string> = {
    redo: "Hồ sơ sẽ được trả về cho người tạo để chỉnh sửa và trình lại.",
    wrongTier: `Hồ sơ sẽ được trả về cho người đã trình đến bạn do không đúng ${detail.wording.tierName}.`,
  };
  const { userId } = useAppContext().state;
  const { departments, myPrincipalScopes, myPrincipalPositionIds } = useGlobalContext().globalState;
  const { state, fetchDocument } = useDocumentContext();

  const [enable, setEnable] = useState(false);
  const [open, setOpen] = useState(false);
  const [givebackType, setGivebackType] = useState<GivebackType>("redo");
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const doc = state.document;
    if (!doc) { setEnable(false); return; }
    if (!detail.statuses.processing.includes(doc.status)) { setEnable(false); return; }
    // Ẩn khi processor chính là creator (không có ai để trả)
    if (doc.processorPositionId === doc.creatorPositionId) { setEnable(false); return; }
    const isDirectActor = CheckActor(doc.companyId, userId, doc.processorPositionId, departments);
    const isSecretary = principalMode === "scopes"
      ? isSecretaryOfDocument(myPrincipalScopes, doc)
      : myPrincipalPositionIds.includes(doc.processorPositionId);
    setEnable(isDirectActor || isSecretary);
  }, [state.document, userId, departments, myPrincipalScopes, myPrincipalPositionIds, principalMode, detail.statuses]);

  const handleOpen = () => {
    setGivebackType("redo");
    setReason("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReason("");
  };

  const handleOk = async () => {
    const doc = state.document;
    if (!doc) return;
    if (!reason.trim()) {
      message.warning("Vui lòng nhập lý do trả lại");
      return;
    }
    setIsLoading(true);
    try {
      if (givebackType === "redo") {
        await detail.api.giveback(doc.id, { approvalMessage: reason.trim() });
      } else {
        await detail.api.returnToSubmitter(doc.id, { reason: reason.trim() });
      }
      message.success("Trả lại thành công");
      handleClose();
      fetchDocument(doc.id as UUID);
    } catch (ex) {
      message.error(extractApiErrorMessage(ex, "Có lỗi xảy ra, vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!enable) return <></>;

  return (
    <>
      <ActionBarButton icon={<RollbackOutlined />} $tone="warning" size="middle" onClick={handleOpen}>
        Trả lại
      </ActionBarButton>

      <Modal
        title={<><RollbackOutlined style={{ marginRight: 8 }} />Trả lại {docName}</>}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        okText="Xác nhận trả lại"
        cancelText="Đóng"
        confirmLoading={isLoading}
        width={480}
      >
        <ModalBodyStl>
          <Radio.Group
            value={givebackType}
            onChange={(e) => setGivebackType(e.target.value as GivebackType)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <RadioCardStl
                $selected={givebackType === "redo"}
                onClick={() => setGivebackType("redo")}
              >
                <Radio value="redo">
                  <Typography.Text strong>Làm lại</Typography.Text>
                </Radio>
                <RadioDescStl>Trả về cho người tạo {docName}</RadioDescStl>
              </RadioCardStl>

              <RadioCardStl
                $selected={givebackType === "wrongTier"}
                onClick={() => setGivebackType("wrongTier")}
              >
                <Radio value="wrongTier">
                  <Typography.Text strong>Sai {detail.wording.tierName}</Typography.Text>
                </Radio>
                <RadioDescStl>Trả về cho người đã trình đến bạn</RadioDescStl>
              </RadioCardStl>
            </Space>
          </Radio.Group>

          <DescriptionBoxStl>{descriptions[givebackType]}</DescriptionBoxStl>

          <Input.TextArea
            rows={3}
            placeholder="Nhập lý do trả lại (bắt buộc)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ModalBodyStl>
      </Modal>
    </>
  );
}

// ── styled ────────────────────────────────────────────────────────────────────

const ModalBodyStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
`;

const RadioCardStl = styled.div<{ $selected: boolean }>`
  border: 1.5px solid ${({ $selected }) => ($selected ? colors.primary : colors.borderInput)};
  border-radius: ${radii.lg}px;
  padding: 10px 12px 8px;
  background: ${({ $selected }) => ($selected ? colors.primaryBg : colors.bgMuted)};
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
`;

const RadioDescStl = styled.div`
  margin-top: 2px;
  margin-left: 24px;
  font-size: 12px;
  color: #888;
`;

const DescriptionBoxStl = styled.div`
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #7c6a00;
`;
