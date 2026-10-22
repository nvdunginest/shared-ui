import { TabFilterState, TabKey, useDocumentListContext } from "../context/list/index";
import { Button, Modal, Space, Typography } from "antd";
import styled from "styled-components";

import { labelTextStyle } from "../../theme";

import ActiveFilterChips from "./ActiveFilterChips";
import FilterControls from "./FilterControls";

export type AdvancedSearchModalProps = {
  open: boolean;
  onClose: () => void;
  tabKey: TabKey;
  hasStatusFilter?: boolean;
  hasDepartmentFilter?: boolean;
  hasSectorFilter?: boolean;
  hasProjectFilter?: boolean;
};

/**
 * PO decision 7.6.2: structured filters (Status/Sector/Department) move from an
 * inline row into a fullscreen-style modal ("Tìm kiếm nâng cao"). The filters
 * themselves are reused unchanged (same Popover components, same setTabFilter
 * calls) — only their mount location changes.
 */
export default function AdvancedSearchModal({
  open,
  onClose,
  tabKey,
  hasStatusFilter = false,
  hasDepartmentFilter = false,
  hasSectorFilter = false,
  hasProjectFilter = false,
}: AdvancedSearchModalProps): JSX.Element {
  const { state: listState, setTabFilter } = useDocumentListContext();
  const filters = listState.filters[tabKey];

  const handleChange = (patch: Partial<TabFilterState>) => setTabFilter(tabKey, patch);

  const handleClearAll = () =>
    setTabFilter(tabKey, {
      statuses: [],
      sectorIds: [],
      departmentIds: [],
      projectIds: [],
      page: 1,
    });

  return (
    <Modal
      title="Tìm kiếm nâng cao"
      open={open}
      onCancel={onClose}
      width={900}
      centered={false}
      footer={
        <Space>
          <Button onClick={handleClearAll}>Xoá tất cả</Button>
          <Button type="primary" onClick={onClose}>Đóng</Button>
        </Space>
      }
    >
      <BodyStl>
        <FilterControls
          tabKey={tabKey}
          hasStatusFilter={hasStatusFilter}
          hasSectorFilter={hasSectorFilter}
          hasProjectFilter={hasProjectFilter}
          hasDepartmentFilter={hasDepartmentFilter}
        />

        <div>
          <Typography.Text style={labelTextStyle}>ĐANG LỌC</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <ActiveFilterChips filters={filters} onChange={handleChange} />
          </div>
        </div>
      </BodyStl>
    </Modal>
  );
}

const BodyStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
