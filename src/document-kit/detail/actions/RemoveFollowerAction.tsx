import { useEffect, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import followersController from "../../api/followers.controller";
import IFollower from "../../models/IFollower";
import { useAppContext } from "../../../platform-kit";
import { Popconfirm } from "antd";
import { UUID } from "crypto";

import { CheckActor } from "./AddAttachmentAction";

type Props = {
  follower: IFollower;
};

export default function RemoveFollowerAction({ follower }: Props): JSX.Element {
  const { userId } = useAppContext().state;
  const { state } = useDocumentContext();
  const { departments } = useGlobalContext().globalState;
  const [enable, setEnable] = useState(false);

  const handleRemoveConsultant = async (followerId: UUID) => {
    if (state.document === null) return;
    try {
      await followersController.removeConsultant(state.document.id, followerId);
    } catch {
      // console.print("Participant remove", error);
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
    <>
      {enable && (
        <Popconfirm
          title={`Xác nhận xóa người theo dõi`}
          description={`Xác nhận xóa người theo dõi`}
          onConfirm={() => handleRemoveConsultant(follower.id)}
          okText="Xác nhận"
          cancelText="Hủy bỏ"
        >
          <CloseOutlined style={{ fontSize: 10, color: "#888" }} />
        </Popconfirm>
      )}
    </>
  );
}
