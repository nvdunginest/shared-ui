import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FilterOutlined } from "@ant-design/icons";
import {
  TabKey,
  useDocumentListContext,
} from "../context/list/index";
import { useGlobalContext } from "../context/global/index";
import PaginationQueryResult from "../models/PaginationQueryResult";
import {
  DocumentChangeNotification,
  useSignalRContext,
} from "../../signalr";
import { useContainerBreakpoint } from "@ptht365/shared-ui/module-contract";
import { Badge, Button, Empty, Input, Pagination, Skeleton, Spin } from "antd";
import styled from "styled-components";

import { colors } from "../../theme";

import type { DocumentQueryOptions, DocumentViewItemProps, ListDocument } from "../config";
import { useDocumentKit } from "../config";

import ActiveFilterChips from "./ActiveFilterChips";
import AdvancedSearchModal from "./AdvancedSearchModal";

export type DocumentTableProps = {
  tabKey: TabKey;
  hasStatusFilter?: boolean;
  hasDepartmentFilter?: boolean;
  hasSectorFilter?: boolean;
  hasProjectFilter?: boolean;
  viewItemComponent: React.ComponentType<DocumentViewItemProps<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  apiMethod?: (
    options: DocumentQueryOptions,
    companyId: string,
  ) => Promise<PaginationQueryResult<ListDocument>>;
  // Ẩn thanh tìm kiếm/bộ lọc nâng cao nội bộ — dùng khi component cha (vd
  // DocumentListScreen) đã tự cung cấp UI lọc/tìm kiếm riêng, tránh lặp UI
  // trong khi vẫn giữ nguyên logic fetch/phân trang/SignalR bên dưới.
  hideToolbar?: boolean;
  // Scroll container of the list items — lets a parent save/restore the scroll position
  // (narrow list is kept mounted but hidden while a document is open).
  scrollRef?: React.Ref<HTMLDivElement>;
  // Narrow list kept mounted while a document is open: do NOT refetch (with the global spinner)
  // just because the route changed, and refetch silently each time `refreshSignal` turns truthy
  // (the list became visible again) so the data stays on screen while it refreshes.
  /** Kept for callers: the list refetches only when its own inputs change, not on navigation. */
  keepDataOnNavigate?: boolean;
  refreshSignal?: boolean;
};

export default function DocumentTable({
  tabKey,
  hasStatusFilter = false,
  hasDepartmentFilter = false,
  hasSectorFilter = false,
  hasProjectFilter = false,
  viewItemComponent: ViewItem,
  apiMethod,
  hideToolbar = false,
  scrollRef,
  keepDataOnNavigate = false,
  refreshSignal = false,
}: DocumentTableProps) {
  const { features, perPageLabel } = useDocumentKit();
  // Lọc/phân trang được lưu ở global state theo từng tab, không dùng URL query nữa,
  // để không bị mất khi chuyển qua lại giữa các tab hoặc điều hướng sang trang khác rồi quay lại.
  const {
    state: listState,
    setTabFilter,
    setPendingCompanySwitch,
    initialOpenDone,
  } = useDocumentListContext();
  const {
    page,
    pageSize,
    statuses,
    keyword,
    departmentIds,
    sectorIds,
    projectIds,
  } = listState.filters[tabKey];

  // Đọc qua ref (không phải qua dependency của init) để: (1) đổi cờ không làm `init`
  // bị tạo lại (tránh gọi API dư), (2) luôn lấy giá trị mới nhất tại thời điểm fetch
  // xong, không bị "đóng băng" giá trị cũ nếu có nhiều lần đổi công ty liên tiếp.
  const pendingCompanySwitchRef = useRef(listState.pendingCompanySwitch);
  useEffect(() => {
    pendingCompanySwitchRef.current = listState.pendingCompanySwitch;
  }, [listState.pendingCompanySwitch]);

  // Chặn kết quả của 1 request cũ (đã bị 1 lần đổi công ty sau đó thay thế) ghi đè lên
  // kết quả mới hơn hoặc điều hướng nhầm.
  const latestRequestIdRef = useRef(0);

  const { selectedCompanyId } = useGlobalContext().globalState;

  // Ref giữ selectedCompanyId mới nhất — cùng lý do như pendingCompanySwitchRef, và đặc
  // biệt QUAN TRỌNG để tránh lặp lại sync loop đã fix ở 3307ca9: KHÔNG đưa selectedCompanyId
  // vào dependency array của effect subscribe SignalR (effect đó không cần re-run khi công
  // ty đổi, nó chỉ cần đọc giá trị MỚI NHẤT tại thời điểm nhận event).
  const selectedCompanyIdRef = useRef(selectedCompanyId);
  useEffect(() => {
    selectedCompanyIdRef.current = selectedCompanyId;
  }, [selectedCompanyId]);

  const { onDocumentChanged } = useSignalRContext();
  const routerNavigate = useNavigate();
  // useNavigate() changes identity on every route change, which would re-run init() (it is a
  // dependency of init) and refetch the list each time another document is opened. Always use a stable wrapper.
  const navigateRef = useRef(routerNavigate);
  useEffect(() => {
    navigateRef.current = routerNavigate;
  }, [routerNavigate]);
  const navigate = useCallback((to: string) => navigateRef.current(to), []);

  // Wide frame at "/" = list panel + empty detail pane: the first load of the list fills that pane. Read through a
  // ref so it does not become a dependency of init (it would refetch on every route change).
  const breakpoint = useContainerBreakpoint();
  const { pathname } = useLocation();
  const canAutoOpenFirst =
    features.autoOpenFirst && breakpoint === "wide" && pathname === "/" && !keepDataOnNavigate && !hideToolbar;
  const canAutoOpenFirstRef = useRef(canAutoOpenFirst);
  useEffect(() => {
    canAutoOpenFirstRef.current = canAutoOpenFirst;
  }, [canAutoOpenFirst]);

  // Local loading state: a list fetch must not dim the whole module (the global overlay is for user actions).
  const [fetching, setFetching] = useState(false);
  // False until the first list answer (or a long wait for a company) is in: until then show the skeleton,
  // never "Không có dữ liệu", which would flash for a moment before the first fetch starts.
  const [settled, setSettled] = useState(false);
  const [data, setData] =
    useState<PaginationQueryResult<ListDocument> | null>(null);

  const [searchTerm, setSearchTerm] = useState(keyword);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const hasActiveFilter =
    statuses.length > 0
    || sectorIds.length > 0
    || departmentIds.length > 0
    || projectIds.length > 0;

  useEffect(() => {
    if (selectedCompanyId) return undefined;
    // No company yet: the company list is still loading. If it never yields one, show the empty state.
    const timer = setTimeout(() => setSettled(true), NO_COMPANY_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [selectedCompanyId]);

  // Đổi công ty → xoá ngay danh sách cũ, tránh hiển thị nhầm dữ liệu công ty trước
  // trong lúc chờ danh sách mới tải xong.
  useEffect(() => {
    setData(null);
  }, [selectedCompanyId]);

  // `silent = true` khi được gọi từ SignalR handler (mục 4.2 solution doc): tờ trình đổi
  // trạng thái ở nơi khác không phải hành động của user hiện tại, không được che màn hình
  // bằng spinner toàn cục (AppContext.loading → <ModuleLoadingOverlay>) như lúc user tự đổi
  // filter/trang — nếu không sẽ làm mọi user trong company bị "đứng hình" mỗi khi có ai đó
  // duyệt/từ chối/comment 1 tờ trình.
  const init = useCallback(
    async (silent = false) => {
      const requestId = ++latestRequestIdRef.current;

      if (!selectedCompanyId || !apiMethod) {
        setData(null);
        if (pendingCompanySwitchRef.current) {
          pendingCompanySwitchRef.current = false;
          setPendingCompanySwitch(false);
        }
        return;
      }
      if (!silent) {
        setFetching(true);
      }
      try {
        const result = await apiMethod(
          {
            page,
            pageSize,
            statuses: statuses.length > 0 ? statuses : undefined,
            keyword: keyword || undefined,
            departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
            sectorIds: sectorIds.length > 0 ? sectorIds : undefined,
            projectIds: projectIds.length > 0 ? projectIds : undefined,
          },
          selectedCompanyId,
        );

        if (requestId !== latestRequestIdRef.current) return; // đã có request mới hơn thay thế
        setData(result);

        // Vào trang ở màn hình shell (chưa mở tài liệu nào) → mở tài liệu đầu tiên của danh sách.
        // Một kết quả rỗng (vd. dữ liệu công ty chưa kịp nạp) không tính là đã xử lý — lần tải sau sẽ mở.
        if (!initialOpenDone.current && !pendingCompanySwitchRef.current && result.items.length > 0) {
          initialOpenDone.current = true;
          // Entered on a document link (or a frame without the shell): nothing to open, just mark it handled.
          if (canAutoOpenFirstRef.current) {
            navigate(`/documents/${result.items[0].id}`);
            return;
          }
        }

        // Người dùng vừa chủ động đổi công ty ở selector (compact) → mở tờ trình đầu tiên
        // của danh sách mới, đồng bộ với tờ trình đang xem.
        if (pendingCompanySwitchRef.current) {
          pendingCompanySwitchRef.current = false;
          setPendingCompanySwitch(false);
          navigate(
            result.items.length > 0 ? `/documents/${result.items[0].id}` : "/",
          );
        }
      } catch {
        if (requestId === latestRequestIdRef.current) setData(null);
      } finally {
        if (requestId === latestRequestIdRef.current) setSettled(true);
        if (!silent && requestId === latestRequestIdRef.current)
          setFetching(false);
      }
    },
    [
      page,
      pageSize,
      statuses,
      keyword,
      departmentIds,
      sectorIds,
      projectIds,
      apiMethod,
      selectedCompanyId,
      setPendingCompanySwitch,
      initialOpenDone,
      navigate,
    ],
  );

  useEffect(() => {
    init();
  }, [init]);

  // Ref giữ init() mới nhất — bắt buộc vì effect subscribe SignalR chỉ chạy 1 lần khi mount
  // (deps = []), nếu gọi trực tiếp `init` từ closure ban đầu sẽ bị "đóng băng" giá trị filter/
  // page/selectedCompanyId cũ (stale closure) — không đưa `init` vào dependency array (sẽ phải
  // unsubscribe/subscribe lại SignalR mỗi lần đổi filter, không cần thiết và rườm rà).
  const initRef = useRef(init);
  useEffect(() => {
    initRef.current = init;
  }, [init]);

  // The list became visible again (see keepDataOnNavigate): refresh quietly, keep the rows on screen.
  const refreshSignalSeenRef = useRef(refreshSignal);
  useEffect(() => {
    if (refreshSignal && !refreshSignalSeenRef.current) initRef.current(true);
    refreshSignalSeenRef.current = refreshSignal;
  }, [refreshSignal]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (notification: DocumentChangeNotification) => {
      // AC5: bỏ qua nếu không thuộc công ty đang chọn — tránh gọi API dư
      // So sánh không phân biệt hoa/thường vì Guid.ToString() (BE) và id công ty trả về
      // từ dtaMdms (FE) không đảm bảo cùng casing.
      if (!selectedCompanyIdRef.current) return;
      if (
        notification.companyId.toLowerCase() !==
        selectedCompanyIdRef.current.toLowerCase()
      )
        return;

      // Debounce: nhiều event liên tiếp (vd nhiều user thao tác gần nhau) chỉ refetch 1 lần
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        initRef.current(true); // silent: không hiện spinner toàn cục
      }, 400);
    };

    const unsubscribe = onDocumentChanged(handler);

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chạy 1 lần khi mount — không phụ thuộc selectedCompanyId/init để tránh sync loop

  // Lazy loading search: debounce input, chỉ áp dụng khi khác giá trị hiện tại
  useEffect(() => {
    if (searchTerm === keyword) return;

    const handler = setTimeout(() => {
      setTabFilter(tabKey, { keyword: searchTerm, page: 1 });
    }, 400);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <ContainerStl>
      {!hideToolbar && (
        <>
          <ToolBarStl>
            <CommandBarStl>
              <Input
                value={searchTerm}
                placeholder="Tìm kiếm"
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                allowClear
                style={{ flex: 1, minWidth: 0 }}
              />
              {(hasStatusFilter || hasSectorFilter || hasProjectFilter || hasDepartmentFilter) && (
                <Badge dot={hasActiveFilter} offset={[-2, 2]}>
                  <Button
                    icon={<FilterOutlined />}
                    type={hasActiveFilter ? "primary" : "default"}
                    title="Tìm kiếm nâng cao"
                    onClick={() => setFilterModalOpen(true)}
                  />
                </Badge>
              )}
            </CommandBarStl>
            {(hasStatusFilter || hasSectorFilter || hasProjectFilter || hasDepartmentFilter) && (
              <FilterStl>
                <ActiveFilterChips
                  filters={listState.filters[tabKey]}
                  onChange={(patch) => setTabFilter(tabKey, patch)}
                />
              </FilterStl>
            )}
          </ToolBarStl>
          <AdvancedSearchModal
            open={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            tabKey={tabKey}
            hasStatusFilter={hasStatusFilter}
            hasSectorFilter={hasSectorFilter}
            hasProjectFilter={hasProjectFilter}
            hasDepartmentFilter={hasDepartmentFilter}
          />
        </>
      )}
      <DataStl ref={scrollRef}>
        {data === null && (fetching || !settled) ? (
          <Skeleton active title={false} paragraph={{ rows: 6 }} style={{ padding: 8 }} />
        ) : (
          <Spin spinning={fetching} wrapperClassName="document-list-spin">
            {data && data.totalCount > 0 ? (
              <ItemsListStl>
                {data.items.map((d) => (
                  <ViewItem document={d} key={d.id} />
                ))}
              </ItemsListStl>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Spin>
        )}
      </DataStl>
      <FooterStl>
        {data && data.totalCount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: 8,
            }}
          >
            <PaginationStl
              size="small"
              current={page}
              pageSize={pageSize}
              total={data.totalCount}
              onChange={(newPage, newPageSize) =>
                setTabFilter(tabKey, {
                  page: newPage,
                  pageSize: newPageSize ?? pageSize,
                })
              }
              locale={{ items_per_page: perPageLabel }}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        )}
      </FooterStl>
    </ContainerStl>
  );
}

/** How long a list waits for a company before it shows the empty state. */
const NO_COMPANY_SETTLE_MS = 2500;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  /* In a flex-column parent that also holds a title row, take only the remaining height
     (height: 100% alone would push the pagination out of the clipped parent). */
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToolBarStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CommandBarStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  gap: 6px;
`;

const FilterStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

// Fallback for Pagination active-item solid fill in case the installed AntD 5.x
// minor version does not honor `components.Pagination.itemActiveBg` token (§5.4).
const PaginationStl = styled(Pagination)`
  .ant-pagination-item-active {
    background: ${colors.primary};
    border-color: ${colors.primary};

    a {
      color: #fff;
    }
  }
`;

const DataStl = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
`;

// Khoảng cách giữa các item + đường kẻ phân cách nằm giữa khoảng trống đó
// (line ở giữa gap, không dính vào cạnh dưới của item phía trên)
const ItemsListStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  > * {
    position: relative;
  }

  > *:not(:last-child)::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 1px;
    background: ${colors.borderDividerLight};
  }
`;

const FooterStl = styled.div`
  display: flex;
  justify-content: center;
`;
