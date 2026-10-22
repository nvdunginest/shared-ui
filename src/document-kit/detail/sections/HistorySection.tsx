import { useDocumentContext } from "../../context/document/index";
import { ActivityType } from "../../models/ActivityType";
import styled from "styled-components";

import BaseActivityItem from "./HistoryActivityItem";
import SectionView from "./SectionView";

export default function HistorySection() {
  const { state } = useDocumentContext();

  return state.document ? (
    <SectionView>
      <ListStl>
        {state.document.activities
          .filter((x) => x.activityType !== ActivityType.COMMENT)
          .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
          .map((activity) => (
            <BaseActivityItem key={activity.id} activity={activity} />
          ))}
      </ListStl>
    </SectionView>
  ) : (
    <></>
  );
}

const ListStl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0;
  padding: 12px 0 0;
  list-style: none;
`;
