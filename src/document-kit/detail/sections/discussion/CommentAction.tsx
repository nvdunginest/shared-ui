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
import { useCommentAttachmentPreview } from "../../../components/useCommentAttachmentPreview";
import type { MinimalEditorRef } from "../../../../editor";
import { extractApiErrorMessage } from "../../../helpers/apiError.helper";
import { getUiConfig } from "../../../../ui";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { isAxiosError } from "axios";
import { isEmptyOrSpaces } from "../../../../text-utils";
import { ISharedUser, useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Button, Skeleton, Switch } from "antd";
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

export function extractMentions(html: string, users: ISharedUser[]): UUID[] {
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
  const { message } = useModuleFeedback();
  const id = state.document?.id;
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const ref = useRef<MinimalEditorRef>(null);
  const { onAttachmentClick, modal } = useCommentAttachmentPreview();

  const attachFromMinimalButton = () => {
    ref.current?.openAttachmentDialog();
  };

  const handlePostComment = async () => {
    if (!id) return;
    const msg = ref.current?.getData();
    if (msg === undefined || isEmptyOrSpaces(msg)) return;
    setLoading(true);
    try {
      await activitiesController.addComment(id, {
        content: msg,
        refId: parentComment?.id ?? undefined,
        objectData: {
          isPrivate,
          mentionedUserIds: extractMentions(msg, users),
        },
      });
      // Clear the box only when the comment went through: on an error the user keeps what they typed.
      ref.current?.setData("");
      onPosted?.();
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const documentName = getUiConfig().documentName;
      if (status === 404) {
        message.error(`Bạn không (còn) có quyền bình luận vào ${documentName} này.`);
      } else {
        message.error(extractApiErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerStl>
      <WrapperStl>
        <Suspense fallback={<Skeleton.Input active block size="large" />}>
          <MinimalEditor disable={loading} initialData="" ref={ref} onAttachmentClick={onAttachmentClick} />
          {modal}
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
