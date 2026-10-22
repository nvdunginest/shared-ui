import { FC } from "react";
import { TabFilterState, TabKey, useDocumentListContext } from "../context/list/index";
import ActiveFilterChips from "../home/ActiveFilterChips";
import FilterControls from "../home/FilterControls";
import { useModulePopupContainer } from "@ptht365/shared-ui/module-contract";
import { Button, Drawer, Space, Typography } from "antd";
import styled from "styled-components";

import { labelTextStyle } from "../../theme";

// Bottom sheet height inside the module frame (percent of the module root).
// Tall enough for the filter popovers (opened from the sheet) to fit in the module frame.
const SHEET_HEIGHT = "85%";

type Props = {
  open: boolean;
  onClose: () => void;
  tabKey: TabKey;
  hasStatusFilter?: boolean;
  hasDepartmentFilter?: boolean;
  hasSectorFilter?: boolean;
  hasProjectFilter?: boolean;
};

const CLEARED_FILTERS: Partial<TabFilterState> = {
  statuses: [],
  sectorIds: [],
  departmentIds: [],
  projectIds: [],
  page: 1,
};

// Filters of the narrow document list. Mounted INSIDE the module root (getContainer), so it never
// covers the shell header; filters apply immediately (list updates behind the sheet).
const MobileFilterSheet: FC<Props> = ({ open, onClose, tabKey, ...flags }) => {
  const getContainer = useModulePopupContainer();
  const { state: listState, setTabFilter } = useDocumentListContext();
  const filters = listState.filters[tabKey];

  return (
    <Drawer
      title="Bộ lọc"
      placement="bottom"
      height={SHEET_HEIGHT}
      open={open}
      onClose={onClose}
      getContainer={getContainer}
      rootStyle={{ position: "absolute" }}
      footer={
        // Left-aligned: the shell floating button sits at the bottom right of the frame.
        <Space>
          <Button type="primary" onClick={onClose}>Xong</Button>
          <Button onClick={() => setTabFilter(tabKey, CLEARED_FILTERS)}>Xoá tất cả</Button>
        </Space>
      }
    >
      <BodyStl>
        <FilterControls tabKey={tabKey} {...flags} />
        <div>
          <Typography.Text style={labelTextStyle}>ĐANG LỌC</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <ActiveFilterChips filters={filters} onChange={(patch) => setTabFilter(tabKey, patch)} />
          </div>
        </div>
      </BodyStl>
    </Drawer>
  );
};

export default MobileFilterSheet;

const BodyStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
