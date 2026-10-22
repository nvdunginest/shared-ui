import { FC } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { useContainerBreakpoint } from "@ptht365/shared-ui/module-contract";
import styled from "styled-components";

import DocumentListMobile from "./DocumentListMobile";
import DocumentListScreen from "./DocumentListScreen";

import { colors, radii, shadows } from "../../theme";
import { getUiConfig } from "../../ui";

// Parent of every route. Narrow frames: the mobile document list is rendered here and stays mounted
// (only hidden) while another screen is open, so going back keeps tab, filters, search text, scroll
// position and the already loaded data. Other tiers render only the routes.
const ListHost: FC = () => {
  const isNarrow = useContainerBreakpoint() === "narrow";
  const onList = useMatch({ path: "/", end: true }) !== null;

  return (
    <>
      {isNarrow && (
        <MobileListStl $visible={onList}>
          <DocumentListMobile active={onList} />
        </MobileListStl>
      )}
      <Outlet />
    </>
  );
};

export default ListHost;

// Index route element (inside OutlookShell). Wide frames land in the shell: the list panel on the left and
// this empty state on the right until a document is picked. Medium frames land on the list screen; on
// narrow frames ListHost shows the mobile list.
export const IndexScreen: FC = () => {
  const breakpoint = useContainerBreakpoint();
  if (breakpoint === "narrow") return null;
  if (breakpoint === "medium") return <DocumentListScreen />;
  return <EmptyStl>Chọn một {getUiConfig().documentName} trong danh sách để xem chi tiết</EmptyStl>;
};

const MobileListStl = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  width: 100%;
  flex: 1;
  min-height: 0;
`;

const EmptyStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${radii.lg}px;
  background: ${colors.bgSurface};
  box-shadow: ${shadows.card};
  color: ${colors.textTertiary};
  font-size: 14px;
`;
