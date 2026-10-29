import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { useAppContext } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Input, Modal, Skeleton } from "antd";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import type { MinimalEditorRef } from "../../../editor";
import { UUID } from "crypto";
import styled from "styled-components";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";
import { extractMentions } from "../sections/discussion/CommentAction";

const MinimalEditor = lazy(() => import("@ptht365/shared-ui/editor").then((m) => ({ default: m.MinimalEditor })));

// Only used to tell whether the editor holds any text.
const htmlToPlainText = (html: string): string => {
  const doc = new DOMParser().parseFromString(html.replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, "\n"), "text/html");
  return (doc.body.textContent ?? "").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
};

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
  const editorRef = useRef<MinimalEditorRef>(null);
  const { users } = useSharedUsers();
  const withMentions = detail.approvalMentions === true;

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
    editorRef.current?.setData("");
  };

  const handleOk = async () => {
    if (state.document === null) return;

    const html = withMentions ? editorRef.current?.getData() ?? "" : "";
    const hasOpinion = withMentions ? htmlToPlainText(html) !== "" : approvalMessage.trim() !== "";

    if (!hasOpinion) {
      message.warning(`Vui lòng nhập nội dung ${detail.wording.approveVerb}`);
      return;
    }

    setIsLoading(true);
    try {
      await detail.api.approve(state.document.id, {
        // With mentions the opinion goes as the editor's HTML (the backend sanitizes it; the history renders it).
        approvalMessage: withMentions ? html : approvalMessage.trim(),
        ...(withMentions ? { mentionedUserIds: extractMentions(html, users) } : {}),
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
        {withMentions ? (
          <Suspense fallback={<Skeleton.Input active block size="large" />}>
            <EditorBoxStl>
              <MinimalEditor disable={isLoading} initialData="" ref={editorRef} />
            </EditorBoxStl>
            <HintStl>Ý kiến {detail.wording.approveVerb} (bắt buộc). Nhập @ để nhắc thêm người, họ sẽ nhận thông báo như các thành viên khác.</HintStl>
          </Suspense>
        ) : (
          <Input.TextArea
            rows={4}
            placeholder={`Ý kiến ${detail.wording.approveVerb} (bắt buộc)`}
            value={approvalMessage}
            onChange={(e) => setApprovalMessage(e.target.value)}
          />
        )}
      </Modal>
    </>
  );
}

const EditorBoxStl = styled.div`
  min-height: 120px;
  max-height: 260px;
  overflow: auto;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
`;

const HintStl = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;
