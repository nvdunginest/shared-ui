import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BankOutlined,
  LeftOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDocumentListContext } from "../context/list/index";
import { useGlobalContext } from "../context/global/index";
import GlobalCompanySelector from "../components/GlobalCompanySelector";
import {
  LIST_PANEL_WIDTH,
  LIST_PANEL_WIDTH_MEDIUM,
} from "./OutlookShell";
import ActiveFilterChips from "../home/ActiveFilterChips";
import DocumentTable from "../home/DocumentTable";
import DepartmentFilter from "../home/filters/DepartmentFilter";
import ProjectFilter from "../home/filters/ProjectFilter";
import SectorFilter from "../home/filters/SectorFilter";
import StatusFilter from "../home/filters/StatusFilter";
import {
  colors,
  labelTextStyle,
  radii,
  shadows,
  spacing,
} from "../../theme";
import { containerMaxWidth } from "@ptht365/shared-ui/module-contract";
import { Badge, Button, Input } from "antd";
import styled from "styled-components";

import { FooterIconNav, useDeviceType } from "../../ui";
import { findCreateFeature, getFooterFeatures, useDocumentKit } from "../config";

// Màn hình hiển thị khi chưa chọn tờ trình nào (route index trong OutlookShell):
// khung trái là bộ lọc + tìm kiếm, khung chính bên phải là danh sách tờ trình đầy
// đủ — theo bố cục "Lọc + Kết quả" trong docs/ui/new_ui.html, thay cho trạng thái
// trống tĩnh trước đây (EmptyDetailState).
export default function DocumentListScreen(): JSX.Element {
  const { tabs: TAB_CONFIGS, menu, features } = useDocumentKit();
  const createFeature = findCreateFeature(menu);
  const footerFeatures = getFooterFeatures(menu);
  // Only the wide frame has the OutlookShell at "/"; narrower frames show this list there already.
  const device = useDeviceType();
  const canBackToShell = features.backToShell && device === "xl";
  const navigate = useNavigate();
  const {
    state: listState,
    setActiveTab,
    setTabFilter,
  } = useDocumentListContext();
  const { activeTab } = listState;
  const { selectedCompanyId, waitingCounts } = useGlobalContext().globalState;
  const waitingCount = selectedCompanyId
    ? waitingCounts[selectedCompanyId] ?? 0
    : 0;
  const filters = listState.filters[activeTab];
  const activeConfig =
    TAB_CONFIGS.find((t) => t.key === activeTab) ?? TAB_CONFIGS[0];

  const [searchTerm, setSearchTerm] = useState(filters.keyword);

  // Mỗi tab giữ keyword riêng — đồng bộ lại ô tìm kiếm khi người dùng đổi phạm vi.
  useEffect(() => {
    setSearchTerm(filters.keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm === filters.keyword) return;

    const handler = setTimeout(() => {
      setTabFilter(activeTab, { keyword: searchTerm, page: 1 });
    }, 400);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const hasAnyFilterOption =
    activeConfig.hasStatusFilter ||
    activeConfig.hasSectorFilter ||
    activeConfig.hasProjectFilter ||
    activeConfig.hasDepartmentFilter;

  const handleClearAll = () =>
    setTabFilter(activeTab, {
      statuses: [],
      sectorIds: [],
      departmentIds: [],
      projectIds: [],
      keyword: "",
      page: 1,
    });

  return (
    <ScreenStl>
      <FilterSidebarStl>
        <SidebarTopStl>
          <CompanyHighlightStl>
            <BankOutlined style={{ fontSize: 16 }} />
            <CompanySelectWrapperStl>
              <GlobalCompanySelector compact />
            </CompanySelectWrapperStl>
          </CompanyHighlightStl>
        </SidebarTopStl>

        <SidebarHeaderStl>
          <span style={labelTextStyle}>Lọc theo</span>
          <ClearAllStl type="button" onClick={handleClearAll}>
            Xoá
          </ClearAllStl>
        </SidebarHeaderStl>

        <Input
          prefix={<SearchOutlined style={{ color: colors.textQuaternary }} />}
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
          allowClear
        />

        <SidebarSectionStl>
          <span style={labelTextStyle}>Phạm vi</span>
          {TAB_CONFIGS.map((t) => (
            <ScopeItemStl
              key={t.key}
              type="button"
              className={t.key === activeTab ? "active" : ""}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.key === "waiting" && (
                <Badge count={waitingCount} overflowCount={99} size="small" />
              )}
            </ScopeItemStl>
          ))}
        </SidebarSectionStl>

        {hasAnyFilterOption && (
          <SidebarSectionStl>
            <span style={labelTextStyle}>Bộ lọc</span>
            <FilterDropdownsStl>
              {activeConfig.hasStatusFilter && (
                <StatusFilter
                  checkedKeysProp={filters.statuses}
                  setCheckedKeysProp={(keys) =>
                    setTabFilter(activeTab, { statuses: keys, page: 1 })
                  }
                />
              )}
              {activeConfig.hasSectorFilter && (
                <SectorFilter
                  checkedKeysProp={filters.sectorIds}
                  setCheckedKeysProp={(keys) =>
                    setTabFilter(activeTab, { sectorIds: keys, page: 1 })
                  }
                />
              )}
              {activeConfig.hasProjectFilter && (
                <ProjectFilter
                  checkedKeysProp={filters.projectIds}
                  setCheckedKeysProp={(keys) =>
                    setTabFilter(activeTab, { projectIds: keys, page: 1 })
                  }
                />
              )}
              {activeConfig.hasDepartmentFilter && (
                <DepartmentFilter
                  checkedKeysProp={filters.departmentIds}
                  setCheckedKeysProp={(keys) =>
                    setTabFilter(activeTab, { departmentIds: keys, page: 1 })
                  }
                />
              )}
            </FilterDropdownsStl>
            <ActiveFilterChips
              filters={filters}
              onChange={(patch) => setTabFilter(activeTab, patch)}
            />
          </SidebarSectionStl>
        )}

        <FooterSpacerStl />
        <FooterIconNav features={footerFeatures} />
      </FilterSidebarStl>

      <ResultsMainStl>
        <ResultsHeaderStl>
          <ResultsTitleGroupStl>
            {canBackToShell && (
              <Button
                size="small"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => navigate("/")}
                title="Về màn hình chính"
                aria-label="Về màn hình chính"
                style={{ flexShrink: 0 }}
              />
            )}
            <ResultsTitleStl>{activeConfig.scopeTitle}</ResultsTitleStl>
          </ResultsTitleGroupStl>
          {createFeature && (
            <CreateButtonStl
              type="button"
              onClick={() => navigate(createFeature.path)}
            >
              <PlusOutlined style={{ fontSize: 11 }} />
              {createFeature.label}
            </CreateButtonStl>
          )}
        </ResultsHeaderStl>
        <DocumentTable
          key={activeConfig.key}
          tabKey={activeConfig.key}
          apiMethod={activeConfig.apiMethod}
          viewItemComponent={activeConfig.viewItemComponent}
          hasStatusFilter={activeConfig.hasStatusFilter}
          hasDepartmentFilter={activeConfig.hasDepartmentFilter}
          hasSectorFilter={activeConfig.hasSectorFilter}
          hasProjectFilter={activeConfig.hasProjectFilter}
          hideToolbar
        />
      </ResultsMainStl>
    </ScreenStl>
  );
}

const SidebarTopStl = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const CompanyHighlightStl = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  height: 32px;
  box-sizing: border-box;
  padding: 0 6px 0 10px;
  border: 1.5px solid ${colors.primaryBorder};
  border-radius: ${radii.md}px;
  background: ${colors.primaryBg};
  color: ${colors.primary};
`;

const CompanySelectWrapperStl = styled.div`
  flex: 1;
  min-width: 0;
`;

const CreateButtonStl = styled.button`
  flex-shrink: 0;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: 0;
  border-radius: ${radii.sm}px;
  background: ${colors.primary};
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${colors.primaryHover};
  }
`;

const ResultsHeaderStl = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.sm}px;
`;

const ResultsTitleStl = styled.h2`
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: ${colors.textBase};
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ScreenStl = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  border-radius: ${radii.lg}px;
  background: ${colors.bgPage};
  box-shadow: ${shadows.card};

  /* Narrow frames: filters on top, results below, the whole screen scrolls (no clipped content). */
  ${containerMaxWidth("medium")} {
    flex-direction: column;
    overflow-y: auto;
  }
`;

const FilterSidebarStl = styled.div`
  width: ${LIST_PANEL_WIDTH}px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg}px;
  padding: ${spacing.md}px;
  background: ${colors.bgSurface};
  border-right: 1px solid ${colors.borderPanel};
  overflow-y: auto;

  /* Frame-based, not window-based: medium frames get the narrower list, narrow frames stack. */
  ${containerMaxWidth("wide")} {
    width: ${LIST_PANEL_WIDTH_MEDIUM}px;
  }
  ${containerMaxWidth("medium")} {
    width: 100%;
    overflow-y: visible;
    border-right: none;
    border-bottom: 1px solid ${colors.borderPanel};
  }
`;

const SidebarHeaderStl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ClearAllStl = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${colors.textTertiary};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: ${colors.danger};
  }
`;

const SidebarSectionStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs}px;
`;

const FilterDropdownsStl = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xs}px;
`;

const ScopeItemStl = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: 7px 10px;
  border: 0;
  border-radius: ${radii.md}px;
  background: transparent;
  color: ${colors.textBase};
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  font-family: inherit;

  .ant-badge {
    margin-left: auto;
  }

  &:hover {
    background: ${colors.bgMuted};
  }

  &.active {
    background: ${colors.primaryBg};
    color: ${colors.primary};
  }
`;

const ResultsTitleGroupStl = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
`;

// Pushes FooterIconNav to the bottom of the sidebar when the content above is shorter than the
// panel; it still scrolls with the content when longer.
const FooterSpacerStl = styled.div`
  flex: 1;
  min-height: 0;
`;

const ResultsMainStl = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${spacing.md}px;

  /* Narrow: the results keep one full screen of height below the filters. */
  ${containerMaxWidth("medium")} {
    flex: 0 0 auto;
    height: 100%;
  }
`;
