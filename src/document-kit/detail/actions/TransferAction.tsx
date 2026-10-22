import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { extractApiErrorMessage } from "../../helpers/apiError.helper";
import { useEffect, useState } from "react";
import { SwapOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import { filterChainActiveDepartments } from "../../helpers/selectOptions.helper";
import { useAppContext } from "../../../platform-kit";
import { removeVietnameseTones } from "../../../text-utils";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Input, Modal, Select } from "antd";
import { UUID } from "crypto";

import ActionBarButton from "./ActionBarButton";
import { CheckActor } from "./AddAttachmentAction";

export default function TransferAction(): JSX.Element {
  const { message } = useModuleFeedback();
  const { detail } = useDocumentKit();
  const docName = getUiConfig().documentName;
  const { userId } = useAppContext().state;
  const { users } = useSharedUsers();
  const { departments, companies } = useGlobalContext().globalState;
  const { state, fetchDocument } = useDocumentContext();

  const [enable, setEnable] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<UUID | null>(null);

  useEffect(() => {
    if (state.document === null) { setEnable(false); return; }
    if (
      !detail.statuses.notEnded.includes(state.document.status)
    ) { setEnable(false); return; }
    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false); return;
    }
    setEnable(true);

  }, [state.document, userId, departments]);

  const handleClose = () => {
    setOpen(false);
    setApprovalMessage("");
    setSelectedPositionId(null);
  };

  const handleOk = async () => {
    if (state.document === null) return;
    if (!selectedPositionId) {
      message.warning("Vui lòng chọn người nhận xử lý");
      return;
    }
    if (!approvalMessage.trim()) {
      message.warning("Vui lòng nhập nội dung chuyển xử lý");
      return;
    }

    const position = departments
      .filter((d) => d.companyId === state.document!.companyId)
      .flatMap((d) => d.positions)
      .find((p) => p.id === selectedPositionId);

    if (!position || !position.userId) {
      message.error("Vị trí không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      await detail.api.transfer(state.document.id, {
        approvalMessage: approvalMessage.trim(),
        userId: position.userId as UUID,
        positionId: selectedPositionId,
      });
      message.success("Chuyển xử lý thành công");
      handleClose();
      fetchDocument(state.document.id as UUID);
    } catch (ex) {
      message.error(extractApiErrorMessage(ex, "Có lỗi xảy ra, vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  // Mode B (selectable): new assignee's whole chain must be active (position, department, ancestors, company).
  const documentCompany = companies.find((c) => c.id === state.document?.companyId);
  const chainActiveDepartments = filterChainActiveDepartments(
    departments.filter((d) => d.companyId === state.document?.companyId),
    documentCompany?.isActive ?? true,
  );

  const positionOptions = state.document
    ? chainActiveDepartments
      .map((dept) => ({
        label: dept.departmentName,
        options: dept.positions
          .filter((p) => p.isActive && p.userId !== null && p.id !== state.document!.processorPositionId)
          .map((p) => {
            const user = users.find((u) => u.id === p.userId);
            const canApprove = p.tierId === state.document!.tierId;
            return {
              label: `${p.positionName}${user ? ` — ${user.displayName}` : ""}${canApprove ? ` ✅ Có thể ${detail.wording.approveVerb}` : ""}`,
              searchText: `${p.positionName} ${user?.displayName ?? ""} ${user?.mail ?? ""}`,
              value: p.id,
            };
          }),
      }))
      .filter((g) => g.options.length > 0)
    : [];

  const filterPositionOption = (input: string, option?: { label?: string; searchText?: string }) => {
    if (!option) return false;

    const normalizedInput = removeVietnameseTones(input).toLowerCase().trim();
    if (!normalizedInput) return true;

    const normalizedLabel = removeVietnameseTones(option.label ?? "").toLowerCase();
    const normalizedSearchText = removeVietnameseTones(option.searchText ?? "").toLowerCase();

    return normalizedLabel.includes(normalizedInput) || normalizedSearchText.includes(normalizedInput);
  };

  if (!enable) return <></>;

  return (
    <>
      <ActionBarButton
        icon={<SwapOutlined />}
        $tone="info"
        size="middle"
        onClick={() => setOpen(true)}
      >
        Chuyển xử lý
      </ActionBarButton>

      <Modal
        title="Chuyển xử lý"
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        closeIcon={false}
        okText="Chuyển"
        cancelText="Đóng"
        confirmLoading={isLoading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Người nhận xử lý</div>
            <Select
              style={{ width: "100%" }}
              placeholder="Tìm theo tên, email, chức vụ..."
              options={positionOptions}
              value={selectedPositionId}
              onChange={(v) => setSelectedPositionId(v as UUID)}
              showSearch
              filterOption={filterPositionOption}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Nội dung chuyển xử lý</div>
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung (bắt buộc)"
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
