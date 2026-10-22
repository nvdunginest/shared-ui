import { TabFilterState, TabKey, useDocumentListContext } from "../context/list/index";
import { Space } from "antd";

import DepartmentFilter from "./filters/DepartmentFilter";
import ProjectFilter from "./filters/ProjectFilter";
import SectorFilter from "./filters/SectorFilter";
import StatusFilter from "./filters/StatusFilter";

export type FilterControlsProps = {
  tabKey: TabKey;
  hasStatusFilter?: boolean;
  hasDepartmentFilter?: boolean;
  hasSectorFilter?: boolean;
  hasProjectFilter?: boolean;
};

/**
 * The structured filter buttons (status, sector, project, document type, department) of one tab.
 * Shared by AdvancedSearchModal and the narrow filter sheet; each filter is the same Popover
 * component and applies through setTabFilter.
 */
export default function FilterControls({
  tabKey,
  hasStatusFilter = false,
  hasDepartmentFilter = false,
  hasSectorFilter = false,
  hasProjectFilter = false,
}: FilterControlsProps): JSX.Element {
  const { state: listState, setTabFilter } = useDocumentListContext();
  const filters = listState.filters[tabKey];

  const handleChange = (patch: Partial<TabFilterState>) => setTabFilter(tabKey, patch);

  return (
    <Space wrap size={8}>
      {hasStatusFilter && (
        <StatusFilter
          checkedKeysProp={filters.statuses}
          setCheckedKeysProp={(keys) => handleChange({ statuses: keys, page: 1 })}
        />
      )}
      {hasSectorFilter && (
        <SectorFilter
          checkedKeysProp={filters.sectorIds}
          setCheckedKeysProp={(keys) => handleChange({ sectorIds: keys, page: 1 })}
        />
      )}
      {/* Project / Document type filters live on the same tabs as the Sector filter (AC2 US-06) */}
      {hasProjectFilter && (
        <ProjectFilter
          checkedKeysProp={filters.projectIds}
          setCheckedKeysProp={(keys) => handleChange({ projectIds: keys, page: 1 })}
        />
      )}
      {hasDepartmentFilter && (
        <DepartmentFilter
          checkedKeysProp={filters.departmentIds}
          setCheckedKeysProp={(keys) => handleChange({ departmentIds: keys, page: 1 })}
        />
      )}
    </Space>
  );
}
