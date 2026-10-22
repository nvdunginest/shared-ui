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
import { Button, Flex, Form, Popover, Space } from "antd";

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

  const handleOpenChange = () => {
    setOpen(!open);
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

  return (
    <Space size={1}>
      {enable && users && state.document && (
        <>
          <Popover
            title="Thêm người theo dõi"
            content={
              <Flex vertical>
                <div style={{ width: POPOVER_CONTENT_WIDTH }}>
                  <Form form={form} size="small">
                    <Form.Item name="userIds">
                      <SelectUserChip mode="multiple" />
                    </Form.Item>
                  </Form>
                </div>
                <div>
                  <Button
                    type="primary"
                    size="small"
                    disabled={!enable}
                    onClick={handleSubmit}
                    icon={<SendOutlined />}
                  >
                    Gửi
                  </Button>
                </div>
              </Flex>
            }
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
          />
          <Button
            icon={<PlusCircleOutlined />}
            type="primary"
            size="small"
            // loading={loading}
            onClick={() => {
              setOpen(true);
            }}
          >
            Thêm
          </Button>
        </>
      )}
    </Space>
  );
}
