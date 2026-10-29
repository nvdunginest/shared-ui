import { FC, PropsWithChildren, Suspense, lazy } from "react";
import { useDocumentSections } from "../../config";
import { getActivityActorName, parseActorSnapshot } from "../../helpers/activities.helper";
import { ActivityType } from "../../models/ActivityType";
import IActivity from "../../models/IActivity";
import { formatDate } from "../../../text-utils";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { styled } from "styled-components";

import { PersonAvatar } from "../../../ui";
import { colors } from "../../../theme";

// ckeditor5 is heavy: load it on demand, only for opinions that carry mentions (stored as HTML).
const CustomView = lazy(() => import("@ptht365/shared-ui/editor").then((m) => ({ default: m.CustomView })));
const isHtmlContent = (content: string): boolean => /^\s*<(p|span|div|ul|ol)\b/i.test(content);

const formatDateString = "hh:mm dd/MM/yyyy";

type Props = PropsWithChildren & {
  activity: IActivity;
};

const BaseActivityItem: FC<Props> = ({ activity }: Props) => {
  const { users } = useSharedUsers();
  const activityRenderConfigs = useDocumentSections().activities;
  const actor = parseActorSnapshot(activity.actorJsonData);
  const displayName = getActivityActorName(activity, users);
  const positionName = actor.PositionName;

  const config = activityRenderConfigs.find(
    (x) => x.activityType === activity.activityType
  );

  return config !== undefined ? (
    <WrapperStl>
      <PersonAvatar name={displayName} userId={activity.userId} />
      <MainStl>
        <NameStl>{displayName}</NameStl>
        {positionName && <PositionStl>{positionName}</PositionStl>}
        <ActionTextStl>{config.text}</ActionTextStl>
        {config.showContent && activity.content && (
          <NoteStl $tone={getNoteTone(activity.activityType)}>
            {isHtmlContent(activity.content) ? (
              <Suspense fallback={activity.content}>
                <CustomView data={activity.content} />
              </Suspense>
            ) : (
              activity.content
            )}
          </NoteStl>
        )}
        <TimeStl>{formatDate(new Date(activity.createdTime), formatDateString)}</TimeStl>
      </MainStl>
    </WrapperStl>
  ) : (
    <></>
  );
};

export default BaseActivityItem;

type NoteTone = "success" | "warning" | "danger" | "neutral";

// Note colour by outcome: approve = green, sent back = amber, rejected/cancelled = red.
const getNoteTone = (type: number): NoteTone => {
  switch (type) {
    case ActivityType.APPROVE:
      return "success";
    case ActivityType.GIVEBACK:
    case ActivityType.RETURN_TO_SUBMITTER:
      return "warning";
    case ActivityType.REJECT:
    case ActivityType.CANCEL:
    case ActivityType.CANCEL_DOCUMENT:
      return "danger";
    default:
      return "neutral";
  }
};

const NOTE_COLORS: Record<NoteTone, { bg: string; border: string }> = {
  success: { bg: "#F6FFED", border: "#73D13D" },
  warning: { bg: colors.importantBg, border: colors.importantBorder },
  danger: { bg: colors.dangerBg, border: "#E57373" },
  neutral: { bg: "rgba(0, 0, 0, 0.04)", border: "#d0d0d0" },
};

const WrapperStl = styled.li`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  align-items: flex-start;
  list-style: none;
`;

const MainStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
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

const ActionTextStl = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${colors.textBase};
`;

const NoteStl = styled.div<{ $tone: NoteTone }>`
  margin-top: 4px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: ${colors.textSecondary};
  font-style: ${({ $tone }) => ($tone === "warning" ? "italic" : "normal")};
  background: ${({ $tone }) => NOTE_COLORS[$tone].bg};
  border-left: 3px solid ${({ $tone }) => NOTE_COLORS[$tone].border};
  border-radius: 0 6px 6px 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const TimeStl = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${colors.textTertiary};
`;
