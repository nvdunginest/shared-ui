import { FC, PropsWithChildren } from "react";
import { RollbackOutlined, UndoOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../../context/document/index";
import { CommentObjectData } from "../../../api/activities.controller";
import { useDocumentSections } from "../../../config";
import { getActivityActorName, parseActorSnapshot } from "../../../helpers/activities.helper";
import IActivity from "../../../models/IActivity";
import { useAppContext } from "../../../../platform-kit";
import { formatDate, isEmptyOrSpaces } from "../../../../text-utils";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Popconfirm } from "antd";
import { styled } from "styled-components";

import { PersonAvatar } from "../../../../ui";
import { colors } from "../../../../theme";

const formatDateString = "hh:mm dd/MM/yyyy";

type Props = PropsWithChildren & {
  activity: IActivity;
  canRecall?: boolean;
  onRecall?: () => void;
  /** Opens the reply composer; omitted when the document no longer accepts comments. */
  onReply?: () => void;
};

const BaseActivityItem: FC<Props> = ({
  activity,
  children,
  canRecall = false,
  onRecall,
  onReply,
}: Props) => {
  const { userId } = useAppContext().state;
  const { state } = useDocumentContext();
  const { users } = useSharedUsers();
  const detail = useDocumentSections();
  const activityRenderConfigs = detail.activities;
  const actor = parseActorSnapshot(activity.actorJsonData);
  const displayName = getActivityActorName(activity, users);
  const positionName = actor.PositionName;

  const config = activityRenderConfigs.find(
    (x) => x.activityType === activity.activityType
  );

  const objectData: CommentObjectData | null = JSON.parse(
    isEmptyOrSpaces(activity.objectJsonData)
      ? '{"isPrivate": false, "mentionedUserIds": []}'
      : activity.objectJsonData
  );
  const isPrivate = objectData ? objectData.isPrivate : false;

  const documentNotEnded =
    state.document !== null && detail.statuses.notEnded.includes(state.document.status as number);

  // BE tính sẵn activity.canRecall (đúng tác giả, chưa thu hồi, chưa có reply, còn hạn 24h, tờ trình
  // chưa kết thúc) theo current user tại thời điểm query — FE không tự tính lại điều kiện 24h theo
  // đồng hồ trình duyệt để tránh lệch timezone giữa server/client.
  const canShowRecall =
    !!onRecall &&
    activity.userId === userId &&
    !activity.isRecalled &&
    canRecall &&
    activity.canRecall &&
    documentNotEnded;

  return config !== undefined ? (
    <WrapperStl>
      <AvatarWrapStl>
        <PersonAvatar name={displayName} userId={activity.userId} />
      </AvatarWrapStl>
      <MainStl>
        <NameStl>{displayName}</NameStl>
        {positionName && <PositionStl>{positionName}</PositionStl>}
        <BubbleStl $isRecalled={activity.isRecalled}>{children}</BubbleStl>
        <MetaStl>
          <span>{formatDate(new Date(activity.createdTime), formatDateString)}</span>
          {!activity.referenceId && (
            <span>
              · {isPrivate ? "Riêng tư" : "Công khai"}
            </span>
          )}
          {onReply && (
            <ActionLinkStl type="button" onClick={onReply}>
              <RollbackOutlined /> Trả lời
            </ActionLinkStl>
          )}
          {canShowRecall && (
            <Popconfirm
              title="Thu hồi bình luận"
              description="Bạn có chắc chắn muốn thu hồi bình luận này?"
              okText="Thu hồi"
              cancelText="Hủy"
              onConfirm={onRecall}
            >
              <ActionLinkStl type="button">
                <UndoOutlined /> Thu hồi
              </ActionLinkStl>
            </Popconfirm>
          )}
        </MetaStl>
      </MainStl>
    </WrapperStl>
  ) : (
    <></>
  );
};

export default BaseActivityItem;

const WrapperStl = styled.li`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  align-items: flex-start;
  list-style: none;
`;

const AvatarWrapStl = styled.div`
  flex: 0 0 auto;
`;

const MainStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const NameStl = styled.div`
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: ${colors.textHeading};
`;

const PositionStl = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: ${colors.textTertiary};
`;

const BubbleStl = styled.div<{ $isRecalled?: boolean }>`
  max-width: 100%;
  color: ${colors.textBase};
  font-size: 14px;
  font-style: ${({ $isRecalled }) => ($isRecalled ? "italic" : "normal")};
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 14px;
  background-color: #f3f3f3;
  opacity: ${({ $isRecalled }) => ($isRecalled ? 0.7 : 1)};
  overflow-wrap: anywhere;
`;

const MetaStl = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  column-gap: 8px;
  padding-left: 4px;
  font-size: 12px;
  line-height: 20px;
  color: ${colors.textTertiary};
`;

const ActionLinkStl = styled.button`
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.primary};
  &:hover {
    color: ${colors.primaryHover};
  }
`;
