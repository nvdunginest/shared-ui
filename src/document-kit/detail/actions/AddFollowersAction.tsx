import { useEffect, useState } from "react";
import { PlusCircleOutlined, SendOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import followersController from "../../api/followers.controller";
import { useAppContext } from "../../../platform-kit";
import { SelectUserChip } from "../../../ui";
import { POPOVER_CONTENT_WIDTH } from "../../../theme";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { PROCESSING } from "../../../platform-kit";
import { Button, Flex, Form, Popover } from "antd";

import { CheckActor } from "./AddAttachmentAction";

export default function AddFollowersAction(): JSX.Element {
  const { setLoading, setStatus } = useAppContext();
  const { userId } = useAppContext().state;
  const { users } = useSharedUsers();
  const { state } = useDocumentContext();
  const { departments } = useGlobalContext().globalState;
  const [form] = Form.useForm();

  const [enable, setEnable] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const handleClearForm = () => {
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (state.document === null || form.getFieldValue("userIds").length === 0)
      return;

    setLoading(true);
    setStatus(PROCESSING);
    try {
      await followersController.addConsultant(state.document.id, {
        userIds: form.getFieldValue("userIds"),
      });
      handleClearForm();
    } catch {
      // console.print("Cannot add participant", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.document === null) {
      setEnable(false);
      return;
    }

    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false);
      return;
    }

    setEnable(true);
  }, [state.document, userId, departments]);

  if (!enable || !users || !state.document) return <></>;

  return (
    <Popover
      // The submit button lives in the title bar: the user dropdown opens over the body and would hide it.
      title={
        <Flex align="center" justify="space-between" gap={12}>
          <span>Thêm người theo dõi</span>
          <Button type="primary" size="small" onClick={handleSubmit} icon={<SendOutlined />}>
            Gửi
          </Button>
        </Flex>
      }
      content={
        <div style={{ width: POPOVER_CONTENT_WIDTH }}>
          <Form form={form} size="middle">
            <Form.Item name="userIds" style={{ marginBottom: 0 }}>
              <SelectUserChip mode="multiple" size="middle" />
            </Form.Item>
          </Form>
        </div>
      }
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Button
        icon={<PlusCircleOutlined />}
        type="primary"
        size="small"
        style={{ verticalAlign: "middle" }}
      >
        Thêm
      </Button>
    </Popover>
  );
}
