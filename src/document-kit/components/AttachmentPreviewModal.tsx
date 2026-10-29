import { lazy, type ReactNode, Suspense } from "react";
import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, Spin } from "antd";
import styled from "styled-components";

// pdf.js / Office viewers are heavy: load them on demand, not with the module.
const FileViewer = lazy(() =>
  import("@ptht365/shared-ui/file-viewer").then((m) => ({ default: m.FileViewer })),
);

type Props = {
  open: boolean;
  title?: string;
  /** Extension with or without the leading dot: pdf, docx, xlsx, pptx. */
  extension: string;
  uri: string;
  /** Optional download target shown in the title bar. */
  downloadUri?: string;
  /** Optional list of the other files (left side, on top in a narrow window) to switch without closing the modal. */
  sidebar?: ReactNode;
  onClose: () => void;
};

/** Preview of an attachment in a modal (replaces the side drawer). */
export default function AttachmentPreviewModal({
  open,
  title,
  extension,
  uri,
  downloadUri,
  sidebar,
  onClose,
}: Props): JSX.Element {
  return (
    <Modal
      open={open}
      title={
        <TitleStl>
          <span>{title ?? "Xem tệp đính kèm"}</span>
          {downloadUri && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={downloadUri}
              download={title}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tải xuống
            </Button>
          )}
          <Button danger size="small" type="primary" icon={<CloseOutlined />} aria-label="Đóng" title="Đóng" onClick={onClose} />
        </TitleStl>
      }
      closable={false}
      width="min(1100px, 92vw)"
      centered
      footer={null}
      destroyOnClose
      onCancel={onClose}
      styles={{ body: { padding: 0, height: "78vh" } }}
    >
      {open && (
        <BodyStl>
          {sidebar && <SideStl>{sidebar}</SideStl>}
          <ViewerStl>
            <Suspense fallback={<CenterStl><Spin /></CenterStl>}>
              <FileViewer extension={extension} uri={uri} />
            </Suspense>
          </ViewerStl>
        </BodyStl>
      )}
    </Modal>
  );
}

const TitleStl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  > span:first-child {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const BodyStl = styled.div`
  height: 100%;
  display: flex;
  min-height: 0;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const SideStl = styled.aside`
  flex: 0 0 260px;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;

  @media (max-width: 767px) {
    flex: 0 0 auto;
    max-height: 120px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ViewerStl = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
`;

const CenterStl = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
