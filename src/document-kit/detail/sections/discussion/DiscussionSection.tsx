import { useState } from "react";
import { useDocumentContext } from "../../../context/document/index";
import activitiesController, {
  CommentObjectData,
} from "../../../api/activities.controller";
import { useDocumentKit } from "../../../config";
import { ActivityType } from "../../../models/ActivityType";
import IActivity from "../../../models/IActivity";
import { useAppContext } from "../../../../platform-kit";
import { isEmptyOrSpaces } from "../../../../text-utils";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { UUID } from "crypto";
import styled from "styled-components";

import { colors } from "../../../../theme";
import SectionView from "../SectionView";

import BaseActivityItem from "./BaseActivityItem";
import CommentAction from "./CommentAction";
import CommentContent from "./CommentContent";

const RECALL_FALLBACK_ERROR_MESSAGE = "Không thể thu hồi bình luận. Vui lòng thử lại.";

const hasReply = (activities: IActivity[], activityId: UUID): boolean =>
  activities.some(
    (x) => x.activityType === ActivityType.COMMENT && x.referenceId === activityId
  );

const canView = (activity: IActivity, userId: UUID | undefined): boolean => {
  if (!userId) return false;
  const objectData: CommentObjectData | null = JSON.parse(
    isEmptyOrSpaces(activity.objectJsonData)
      ? '{"isPrivate": false, "mentionedUserIds": []}'
      : activity.objectJsonData
  );
  const isPrivate = objectData ? objectData.isPrivate : false;

  if (isPrivate) {
    return (
      objectData?.mentionedUserIds.includes(userId) ||
      activity.userId === userId
    );
  }
  return true;
};

export default function DiscussionSection() {
  const { message } = useModuleFeedback();
  const { state, fetchDocument } = useDocumentContext();
  const { detail } = useDocumentKit();
  const { userId } = useAppContext().state;
  const documentId = state.document?.id;
  const [replyingTo, setReplyingTo] = useState<UUID | null>(null);

  const handleRecall = async (activityId: UUID) => {
    if (!documentId) return;
    try {
      await activitiesController.recallComment(documentId, activityId);
      fetchDocument(documentId);
    } catch (error: unknown) {
      const serverMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      message.error(
        isEmptyOrSpaces(serverMessage ?? "")
          ? RECALL_FALLBACK_ERROR_MESSAGE
          : serverMessage
      );
      // AC12: nếu vừa có người reply ngay trước khi bấm — đồng bộ lại UI để ẩn nút Thu hồi
      fetchDocument(documentId);
    }
  };

  if (!state.document) return <></>;

  const activities = state.document.activities;
  const canComment = detail.statuses.canComment.includes(state.document.status);
  const byTime = (a: IActivity, b: IActivity) =>
    new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
  const comments = activities.filter((x) => x.activityType === ActivityType.COMMENT);
  const roots = comments.filter((x) => x.referenceId === null).filter((x) => canView(x, userId)).sort(byTime);

  return (
    <SectionView>
      <ComposerStl>
        <CommentAction />
      </ComposerStl>
      <ListStl>
        {roots.map((root) => {
          const replies = comments.filter((x) => x.referenceId === root.id).sort(byTime);
          return (
            <ThreadStl key={root.id}>
              <BaseActivityItem
                activity={root}
                canRecall={!hasReply(activities, root.id)}
                onRecall={() => handleRecall(root.id)}
                onReply={canComment ? () => setReplyingTo(root.id) : undefined}
              >
                <CommentContent activity={root} />
              </BaseActivityItem>
              {(replies.length > 0 || replyingTo === root.id) && (
                <RepliesStl>
                  {replies.map((reply) => (
                    <BaseActivityItem
                      key={reply.id}
                      activity={reply}
                      canRecall={!hasReply(activities, reply.id)}
                      onRecall={() => handleRecall(reply.id)}
                      onReply={canComment ? () => setReplyingTo(root.id) : undefined}
                    >
                      <CommentContent activity={reply} />
                    </BaseActivityItem>
                  ))}
                  {replyingTo === root.id && (
                    <CommentAction parentComment={root} onPosted={() => setReplyingTo(null)} />
                  )}
                </RepliesStl>
              )}
            </ThreadStl>
          );
        })}
      </ListStl>
    </SectionView>
  );
}

const ComposerStl = styled.div`
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.borderDivider};
`;

const ListStl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 16px 0 0;
  list-style: none;
`;

const ThreadStl = styled.li`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Replies sit under the parent, indented past its avatar.
const RepliesStl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0 0 0 42px;
  list-style: none;
`;
