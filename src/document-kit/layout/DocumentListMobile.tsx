import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BankOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDocumentListContext } from "../context/list/index";
import { useGlobalContext } from "../context/global/index";
import { ExpandingTabBar } from "../../ui";
import GlobalCompanySelector from "../components/GlobalCompanySelector";
import ActiveFilterChips from "../home/ActiveFilterChips";
import DocumentTable from "../home/DocumentTable";
import { colors, radii, shadows } from "../../theme";
import { Badge, Button, Input } from "antd";
import styled from "styled-components";

import { findCreateFeature, useDocumentKit } from "../config";

import MobileFilterSheet from "./MobileFilterSheet";

const SEARCH_DEBOUNCE_MS = 400;

type Props = {
  // False while another screen (a document, create...) is shown on top; the list stays mounted so
  // its data, filters, search text and scroll position survive the trip.
  active: boolean;
};

// Document list for narrow (mobile) frames. Compact: one header row (company), one row
// (search + filter button), one tab row, an optional one-line chips row; everything else is the list.
// Create is a floating button at the bottom right.
const DocumentListMobile: FC<Props> = ({ active }) => {
  const { tabs: TAB_CONFIGS, menu } = useDocumentKit();
  const createFeature = findCreateFeature(menu);
  const navigate = useNavigate();
  const { state: listState, setActiveTab, setTabFilter } = useDocumentListContext();
  const { selectedCompanyId, waitingCounts } = useGlobalContext().globalState;
  const { activeTab } = listState;
  const filters = listState.filters[activeTab];
  const config = TAB_CONFIGS.find((t) => t.key === activeTab) ?? TAB_CONFIGS[0];
  const waitingCount = selectedCompanyId ? waitingCounts[selectedCompanyId] ?? 0 : 0;

  const [searchTerm, setSearchTerm] = useState(filters.keyword);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Each tab keeps its own keyword: re-sync the search box when the tab changes.
  useEffect(() => {
    setSearchTerm(filters.keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm === filters.keyword) return undefined;
    const handler = setTimeout(
      () => setTabFilter(activeTab, { keyword: searchTerm, page: 1 }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Scroll position: remember it while visible, restore it when the list becomes visible again
  // (display: none resets the scroller). A tab change starts from the top.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef(0);
  useEffect(() => {
    savedScrollTop.current = 0;
  }, [activeTab]);
  useLayoutEffect(() => {
    if (active && scrollerRef.current) scrollerRef.current.scrollTop = savedScrollTop.current;
  }, [active]);
  const rememberScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    if (el === scrollerRef.current && el.clientHeight > 0) savedScrollTop.current = el.scrollTop;
  };

  const filterCount =
    filters.statuses.length +
    filters.sectorIds.length +
    filters.departmentIds.length +
    filters.projectIds.length;

  return (
    <ScreenStl>
      <HeaderStl>
        <RowStl>
          <CompanyHighlightStl>
            <BankOutlined style={{ fontSize: 16 }} />
            <CompanySelectWrapperStl>
              <GlobalCompanySelector compact />
            </CompanySelectWrapperStl>
          </CompanyHighlightStl>
        </RowStl>
        <RowStl>
          <Input
            prefix={<SearchOutlined style={{ color: colors.textQuaternary }} />}
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            allowClear
            style={{ flex: 1, minWidth: 0 }}
          />
          <Badge count={filterCount} size="small" offset={[-2, 2]}>
            <Button
              icon={<FilterOutlined />}
              type={filterCount > 0 ? "primary" : "default"}
              aria-label="Bộ lọc"
              title="Bộ lọc"
              onClick={() => setSheetOpen(true)}
            />
          </Badge>
        </RowStl>
      </HeaderStl>
      <ExpandingTabBar
        items={TAB_CONFIGS.map((t) => ({
          key: t.key,
          label: t.label,
          icon: t.icon,
          count: t.key === "waiting" ? waitingCount : 0,
        }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />
      {filterCount > 0 && (
        <ChipsStl>
          <ActiveFilterChips
            singleLine
            filters={filters}
            onChange={(patch) => setTabFilter(activeTab, patch)}
          />
        </ChipsStl>
      )}
      <ResultsStl onScrollCapture={rememberScroll}>
        <DocumentTable
          key={config.key}
          tabKey={config.key}
          apiMethod={config.apiMethod}
          viewItemComponent={config.viewItemComponent}
          hasStatusFilter={config.hasStatusFilter}
          hasDepartmentFilter={config.hasDepartmentFilter}
          hasSectorFilter={config.hasSectorFilter}
          hasProjectFilter={config.hasProjectFilter}
          hideToolbar
          scrollRef={scrollerRef}
          keepDataOnNavigate
          refreshSignal={active}
        />
      </ResultsStl>
      {createFeature && (
        <CreateFabStl
          type="button"
          aria-label={createFeature.label}
          title={createFeature.label}
          onClick={() => navigate(createFeature.path)}
        >
          <PlusOutlined />
        </CreateFabStl>
      )}
      <MobileFilterSheet
        open={sheetOpen && active}
        onClose={() => setSheetOpen(false)}
        tabKey={config.key}
        hasStatusFilter={config.hasStatusFilter}
        hasDepartmentFilter={config.hasDepartmentFilter}
        hasSectorFilter={config.hasSectorFilter}
        hasProjectFilter={config.hasProjectFilter}
      />
    </ScreenStl>
  );
};

export default DocumentListMobile;

const ScreenStl = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  border-radius: ${radii.lg}px;
  background: ${colors.bgSurface};
  box-shadow: ${shadows.card};
`;

const HeaderStl = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 8px 0;
`;

const RowStl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Stands out so the user picks the right company before acting
const CompanyHighlightStl = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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

const CreateFabStl = styled.button`
  position: absolute;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 2;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${colors.primary};
  color: #fff;
  font-size: 22px;
  box-shadow: ${shadows.card}, 0 4px 12px rgba(0, 0, 0, 0.25);
  cursor: pointer;

  &:hover,
  &:active {
    background: ${colors.primaryHover};
  }
`;

const ChipsStl = styled.div`
  flex: 0 0 auto;
  padding: 0 8px;
`;

const ResultsStl = styled.div`
  flex: 1;
  min-height: 0;
  padding: 0 8px 4px;
`;
