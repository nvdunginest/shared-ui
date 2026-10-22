import {
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { formatFileSize } from "../../../text-utils";
import { Empty, Space, Typography } from "antd";
import styled from "styled-components";

import { flatSection, flatSectionLabel } from "../../../theme";
import { colors, radii } from "../../../theme";
import AddAttachmentAction from "../actions/AddAttachmentAction";
import { DownloadAttachmentAction } from "../actions/DownloadAttachmentAction";
import { OpenAttachmentAction } from "../actions/OpenAttachmentAction";
import { RemoveAttachmentAction } from "../actions/RemoveAttachmentAction";

// Đính kèm — tách ra tab "Tệp" riêng theo quyết định PO 7.6.3.
// Giữ nguyên 100% chức năng thêm/xoá/tải/mở file (di chuyển verbatim từ Main.tsx).

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf")
    return <FilePdfOutlined style={{ color: "#e53935", fontSize: 18 }} />;
  if (["doc", "docx"].includes(ext))
    return <FileWordOutlined style={{ color: "#1565c0", fontSize: 18 }} />;
  if (["xls", "xlsx"].includes(ext))
    return <FileExcelOutlined style={{ color: "#2e7d32", fontSize: 18 }} />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImageOutlined style={{ color: "#6a1b9a", fontSize: 18 }} />;
  return <FileOutlined style={{ color: "#546e7a", fontSize: 18 }} />;
}

export default function AttachmentsSection(): JSX.Element {
  const { document } = useDocumentContext().state;

  if (!document) return <Empty description="Không có dữ liệu" />;

  return (
    <SectionStl>
      <SectionLabelStl>
        <PaperClipOutlined />
        <span>Tệp đính kèm</span>
        <CountBadgeStl>{document.attachments.length}</CountBadgeStl>
        <div style={{ flex: 1 }} />
        <AddAttachmentAction />
      </SectionLabelStl>
      {document.attachments.length > 0 ? (
        <AttachmentListStl>
          {document.attachments.map((att) => (
            <AttachmentItemStl key={att.id}>
              {getFileIcon(att.filename)}
              <AttachmentInfoStl>
                <Typography.Text
                  strong
                  ellipsis={{ tooltip: att.filename }}
                  style={{ maxWidth: 220 }}
                >
                  {att.filename}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {formatFileSize(att.size)}
                </Typography.Text>
              </AttachmentInfoStl>
              <Space size={4}>
                <OpenAttachmentAction attachment={att} />
                <DownloadAttachmentAction attachment={att} />
                <RemoveAttachmentAction attachment={att} />
              </Space>
            </AttachmentItemStl>
          ))}
        </AttachmentListStl>
      ) : (
        <Typography.Text type="secondary">Không có tệp đính kèm</Typography.Text>
      )}
    </SectionStl>
  );
}

const SectionStl = styled.div`
  ${flatSection}
`;

const SectionLabelStl = styled.div`
  ${flatSectionLabel}
`;

const CountBadgeStl = styled.span`
  background: ${colors.primaryBg};
  color: ${colors.primary};
  border-radius: ${radii.pill}px;
  font-size: 11px;
  font-weight: 600;
  padding: 0 6px;
  line-height: 18px;
  min-width: 18px;
  text-align: center;
`;

const AttachmentListStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AttachmentItemStl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${radii.md}px;
  background: ${colors.bgMuted};
  border: 1px solid ${colors.borderDivider};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${colors.primary};
  }
`;

const AttachmentInfoStl = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;
