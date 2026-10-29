import { useState } from "react";
import { FileExcelOutlined, FileOutlined, FilePdfOutlined, FilePptOutlined, FileWordOutlined } from "@ant-design/icons";
import { message, Spin } from "antd";
import { UUID } from "crypto";
import styled from "styled-components";

import { filesHelper } from "../../platform-kit";
import { colors } from "../../theme";
import attachmentsController from "../api/attachments.controller";
import { type AttachmentView, useDocumentContext } from "../context/document/index";
import type IAttachment from "../models/IAttachment";

import AttachmentPreviewModal from "./AttachmentPreviewModal";

const getFileIcon = (extension: string) => {
  const ext = extension.replace(".", "").toLowerCase();
  if (ext === "pdf") return <FilePdfOutlined style={{ color: "#e53935" }} />;
  if (["doc", "docx"].includes(ext)) return <FileWordOutlined style={{ color: "#1565c0" }} />;
  if (["xls", "xlsx"].includes(ext)) return <FileExcelOutlined style={{ color: "#2e7d32" }} />;
  if (["ppt", "pptx"].includes(ext)) return <FilePptOutlined style={{ color: "#d84315" }} />;
  return <FileOutlined style={{ color: "#757575" }} />;
};

/**
 * Preview of the document attachments in a modal. The other attachments are listed next to the viewer, so the user
 * switches file without closing the modal (replaces the per-app drawer).
 */
export default function DocumentAttachmentPreview(): JSX.Element {
  const { state, setCurrentAttachmentView, addAttachmentView } = useDocumentContext();
  const { document, currentAttachmentView, attachments: opened } = state;
  const [loadingId, setLoadingId] = useState<UUID | null>(null);

  const attachments: IAttachment[] = document?.attachments ?? [];

  const openAttachment = async (attachment: IAttachment) => {
    if (!document || loadingId) return;
    const cached = opened.find((x) => x.attachmentId === attachment.id);
    if (cached) {
      setCurrentAttachmentView(cached);
      return;
    }
    setLoadingId(attachment.id);
    try {
      const viewId = await attachmentsController.getViewId(document.id, attachment.id);
      const view: AttachmentView = {
        attachmentId: attachment.id,
        filename: attachment.filename,
        extension: attachment.extension,
        uri: filesHelper.getFileStaticUrl(viewId),
      };
      addAttachmentView(view);
      setCurrentAttachmentView(view);
    } catch {
      message.error("Không thể mở tệp, vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const sidebar =
    attachments.length > 1 ? (
      <ListStl>
        {attachments.map((a) => {
          const active = a.id === currentAttachmentView?.attachmentId;
          return (
            <ItemStl
              key={a.id}
              type="button"
              $active={active}
              title={a.filename}
              onClick={() => void openAttachment(a)}
            >
              {loadingId === a.id ? <Spin size="small" /> : getFileIcon(a.extension)}
              <span>{a.filename}</span>
            </ItemStl>
          );
        })}
      </ListStl>
    ) : undefined;

  return (
    <AttachmentPreviewModal
      open={currentAttachmentView !== null}
      title={currentAttachmentView?.filename}
      extension={currentAttachmentView?.extension ?? ""}
      uri={currentAttachmentView?.uri ?? ""}
      downloadUri={currentAttachmentView?.uri}
      sidebar={sidebar}
      onClose={() => setCurrentAttachmentView(null)}
    />
  );
}

const ListStl = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 2px;
`;

const ItemStl = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? colors.primaryBg : "transparent")};
  color: ${({ $active }) => ($active ? colors.primary : colors.textHeading)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${colors.primaryBg};
  }

  > .anticon {
    flex-shrink: 0;
    font-size: 16px;
  }

  > span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
