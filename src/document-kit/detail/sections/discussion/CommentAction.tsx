import { useDocumentKit } from "../../../config";
import { lazy, Suspense, useRef, useState } from "react";
import {
  GlobalOutlined,
  LockOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useDocumentContext } from "../../../context/document/index";
import activitiesController from "../../../api/activities.controller";
import IActivity from "../../../models/IActivity";
import type { MinimalEditorRef } from "../../../../editor";
import { isEmptyOrSpaces } from "../../../../text-utils";
import { ISharedUser, useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Button, Skeleton, Switch, Typography } from "antd";
import { UUID } from "crypto";
import { styled } from "styled-components";

import { colors } from "../../../../theme";

// ckeditor5 is heavy: load it when the comment box first renders, not with the module.
const MinimalEditor = lazy(() => import("@ptht365/shared-ui/editor").then((m) => ({ default: m.MinimalEditor })));

type Props = {
  parentComment?: IActivity;
  /** Called after a comment is posted successfully (used to close the inline reply composer). */
  onPosted?: () => void;
};

function extractMentions(html: string, users: ISharedUser[]): UUID[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const mentionElements = doc.querySelectorAll("span.mention");
  const mentions: UUID[] = [];

  mentionElements.forEach((el) => {
    const mail = el.getAttribute("data-mention");
    if (!mail) return;
    const user = users.find((u) => `@${u.mail}` === mail);
    if (!user) return;
    mentions.push(user.id as UUID);
  });

  return mentions;
}

export default function CommentAction({ parentComment, onPosted }: Props): JSX.Element {
  const { users } = useSharedUsers();
  const { state } = useDocumentContext();
  const id = state.document?.id;
  const status = state.document?.status;
  const { detail } = useDocumentKit();
  const isFinished = status !== undefined && detail.statuses.finished.includes(status);
  const canComment = status !== undefined && detail.statuses.canComment.includes(status);
  const [loading, setLoading] = useState(false);
  const [isPrivateInput, setIsPrivate] = useState(false);
  // Finished documents only accept private comments.
  const isPrivate = isFinished || isPrivateInput;

  const ref = useRef<MinimalEditorRef>(null);

  const attachFromMinimalButton = () => {
    ref.current?.openAttachmentDialog();
  };

  const handlePostComment = async () => {
    if (id) {
      setLoading(true);
      try {
        const msg = ref.current?.getData();
        ref.current?.setData("");
        if (msg === undefined || isEmptyOrSpaces(msg)) return;
        await activitiesController.addComment(id, {
          content: msg,
          refId: parentComment?.id ?? undefined,
          objectData: {
            isPrivate,
            mentionedUserIds: extractMentions(msg, users),
          },
        });
        onPosted?.();
      } catch (error) {
        // console.print("Submit comment", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!canComment) {
    return (
      <Typography.Text type="secondary">
        Tờ trình đã kết thúc — không thể bình luận.
      </Typography.Text>
    );
  }

  return (
    <ContainerStl>
      <WrapperStl>
        <Suspense fallback={<Skeleton.Input active block size="large" />}>
          <MinimalEditor disable={loading} initialData="" ref={ref} />
        </Suspense>
        <div style={{ padding: "4px", display: "flex", flexDirection: "row" }}>
          <Button
            type="text"
            shape="circle"
            icon={<PaperClipOutlined />}
            onClick={attachFromMinimalButton}
          ></Button>
          <Button
            type="text"
            shape="circle"
            icon={<SendOutlined style={{ color: colors.primary }} />}
            onClick={handlePostComment}
          ></Button>
        </div>
      </WrapperStl>
      {!parentComment && (
        <PrivacySwitchStl
          disabled={isFinished}
          checkedChildren={
            <span>
              <LockOutlined /> Riêng tư
            </span>
          }
          unCheckedChildren={
            <span>
              <GlobalOutlined /> Công khai
            </span>
          }
          value={isPrivate}
          onChange={setIsPrivate}
        />
      )}
    </ContainerStl>
  );
}

// Public (unchecked) state uses a green background with white text for contrast.
const PrivacySwitchStl = styled(Switch)`
  &.ant-switch:not(.ant-switch-checked) {
    background: #389e0d;

    &:hover:not(.ant-switch-disabled) {
      background: #237804;
    }

    .ant-switch-inner {
      color: #fff;
    }
  }
`;

const WrapperStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  border-radius: 12px;
  border: 1px solid #d9d9d9 !important;
  background: #fff;
`;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`;
