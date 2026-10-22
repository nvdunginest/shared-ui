import { createContext, FC, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { useContainerBreakpoint } from "@ptht365/shared-ui/module-contract";
import styled from "styled-components";

import { CollapsedPanelStrip, getUiConfig } from "../../ui";
import DocumentListPanel from "./DocumentListPanel";

import { colors } from "../../theme";

import { readPanelFlag, writePanelFlag } from "../../ui";
import { ResponsiveWrapper } from "../../ui";

// Export để DocumentListScreen (trang danh sách độc lập) dùng chung bề rộng panel
// trái, giữ 2 trang nhất quán về layout.
export const LIST_PANEL_WIDTH = 340;
// Medium frames (two panes, 672-1183 px) get a narrower list so the detail pane keeps its room.
export const LIST_PANEL_WIDTH_MEDIUM = 300;
const LIST_PANEL_COLLAPSED_WIDTH = 34;

// Cho phép DocumentListPanel (con của ListPanelStl) yêu cầu thu gọn/mở rộng
// chính panel bao ngoài nó — chỉ dùng nội bộ trong cây OutlookShell, không
// phải state nghiệp vụ nên không đặt trong DocumentListContext.
type ListPanelVisibility = {
  /** True only inside the desktop shell, where the list panel can actually be collapsed. */
  available: boolean;
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};
const ListPanelVisibilityContext = createContext<ListPanelVisibility>({
  available: false,
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});
export const useListPanelVisibility = () => useContext(ListPanelVisibilityContext);

const OutlookShellDesktop: FC = () => {
  const { documentName } = getUiConfig();
  const [collapsed, setCollapsedState] = useState(() => readPanelFlag("list.collapsed") ?? false);
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    writePanelFlag("list.collapsed", value);
  };
  const breakpoint = useContainerBreakpoint();
  const listWidth = breakpoint === "wide" ? LIST_PANEL_WIDTH : LIST_PANEL_WIDTH_MEDIUM;
  // Tablet (medium frame): the list panel is hidden, the document gets the whole width. The panel stays
  // mounted (see note below) so coming back to a wide frame does not reload the list.
  const hideList = breakpoint === "medium";
  const toggle = () => setCollapsed(!collapsed);

  return (
    <ListPanelVisibilityContext.Provider value={{ available: !hideList, collapsed, toggle, setCollapsed }}>
      <ContainerStl>
        <ListPanelStl $collapsed={collapsed} $width={listWidth} $hidden={hideList}>
          {/* Luôn giữ DocumentListPanel mounted (chỉ ẩn/hiện bằng CSS) — nếu
              unmount rồi mount lại khi mở panel, DocumentTable sẽ chạy lại
              effect `init()` và gọi API load lại toàn bộ danh sách, dù dữ
              liệu đã được đồng bộ liên tục qua SignalR (silent refetch khi
              có thay đổi) nên không cần load lại. */}
          <CollapsedStripStl style={{ display: collapsed ? "flex" : "none" }}>
            <CollapsedPanelStrip
              icon={<RightOutlined style={{ fontSize: 12 }} />}
              label={`DANH SÁCH ${documentName.toUpperCase()}`}
              title={`Hiện danh sách ${documentName}`}
              onClick={toggle}
            />
          </CollapsedStripStl>
          <ListPanelContentStl style={{ display: collapsed ? "none" : "flex" }}>
            <DocumentListPanel />
          </ListPanelContentStl>
        </ListPanelStl>
        {!hideList && (
          <DividerStl>
            <DividerLineStl />
          </DividerStl>
        )}
        <DetailPanelStl>
          <Outlet />
        </DetailPanelStl>
      </ContainerStl>
    </ListPanelVisibilityContext.Provider>
  );
};

// Narrow frames: a single pane, the index route (list screen) or the open document.
const OutlookShellMobile: FC = () => <Outlet />;

const OutlookShell: FC = () => (
  <ResponsiveWrapper desktop={<OutlookShellDesktop />} mobile={<OutlookShellMobile />} />
);

export default OutlookShell;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const ListPanelStl = styled.div<{ $collapsed: boolean; $width: number; $hidden: boolean }>`
  width: ${({ $collapsed, $width, $hidden }) => ($hidden ? 0 : $collapsed ? LIST_PANEL_COLLAPSED_WIDTH : $width)}px;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.15s ease;
`;

// Wrapper chỉ định kích thước — phần visual (nền/bo góc/icon/label) đã tách
// sang CollapsedPanelStrip dùng chung với MasterPage.
const CollapsedStripStl = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ListPanelContentStl = styled.div`
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
`;

const DividerStl = styled.div`
  width: 8px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
`;

const DividerLineStl = styled.div`
  width: 1px;
  height: 100%;
  background: ${colors.borderDivider};
`;

const DetailPanelStl = styled.div`
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
`;
