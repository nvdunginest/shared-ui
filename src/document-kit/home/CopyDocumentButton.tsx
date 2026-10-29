import { MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CopyOutlined } from "@ant-design/icons";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Button } from "antd";
import { UUID } from "crypto";

import { useAppContext } from "../../platform-kit";
import { getUiConfig } from "../../ui";
import { colors } from "../../theme";
import { useDocumentKit } from "../config";
import { useGlobalContext } from "../context/global/index";
import { extractApiErrorMessage } from "../helpers/apiError.helper";

type Props = {
  documentId: string;
  /** Department of the copied document: the copy is filed under it when the user holds a position there. */
  departmentId?: string;
};

/**
 * "Sao chép" on a list item: after a confirmation, creates a new DRAFT owned by the user from the content and info of
 * the document (never its activity, followers, participants or attachments) and opens it.
 */
export default function CopyDocumentButton({ documentId, departmentId }: Props): JSX.Element {
  const { detail } = useDocumentKit();
  const { message, modal } = useModuleFeedback();
  const { state } = useAppContext();
  const { myDepartments } = useGlobalContext().globalState;
  const navigate = useNavigate();
  const [copying, setCopying] = useState(false);

  const copy = detail.api.copy;
  if (!copy) return <></>;

  const documentName = getUiConfig().documentName;

  const run = async (): Promise<void> => {
    const candidates = myDepartments.filter((d) => d.isActive);
    const department = candidates.find((d) => d.id === departmentId) ?? candidates[0];
    const position = department?.positions.find((p) => p.userId === state.userId && p.isActive);
    if (!department || !position) {
      message.error(`Bạn chưa có chức danh đang hoạt động để tạo bản sao ${documentName}.`);
      return;
    }

    setCopying(true);
    try {
      const newId = await copy(documentId as UUID, { positionId: position.id, departmentId: department.id });
      message.success(`Đã tạo bản sao ${documentName} ở trạng thái nháp.`);
      navigate(`/documents/${newId}`);
    } catch (ex) {
      message.error(extractApiErrorMessage(ex, `Không thể sao chép ${documentName}, vui lòng thử lại.`));
    } finally {
      setCopying(false);
    }
  };

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation(); // the item itself opens the document
    modal.confirm({
      title: `Sao chép ${documentName}`,
      content: `Tạo một ${documentName} mới ở trạng thái nháp từ nội dung và thông tin của ${documentName} này? Hoạt động, người theo dõi, người tham gia và file đính kèm không được sao chép.`,
      okText: "Sao chép",
      cancelText: "Hủy",
      onOk: run,
    });
  };

  return (
    <Button
      type="text"
      size="small"
      loading={copying}
      icon={<CopyOutlined />}
      onClick={handleClick}
      title={`Sao chép ${documentName}`}
      aria-label={`Sao chép ${documentName}`}
      style={{ color: colors.textTertiary }}
    />
  );
}
