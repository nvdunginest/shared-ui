import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { vi } from "vitest";

import { DocumentKitProvider, type DocumentKitConfig } from "../../src/document-kit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no matchMedia (antd's grid hooks and the list use it).
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

export const Row = ({ document }: { document: { id: string } }) => <div data-row={document.id}>{document.id}</div>;

export function makeConfig(over: Partial<DocumentKitConfig> = {}): DocumentKitConfig {
  const page = (items: { id: string }[]) => ({ page: 1, pageSize: 20, totalCount: items.length, totalPages: 1, items });
  return {
    companyStorageKey: "test_company",
    menu: [
      { label: "Trang chủ", short: "Home", path: "/", icon: <i />, roles: [] },
      { label: "Tạo mới tờ trình", short: "Tạo", path: "/create", icon: <i />, roles: [] },
    ],
    tabs: ["related", "waiting", "me", "following"].map((key) => ({
      key: key as "related",
      label: `tab ${key}`,
      scopeTitle: `title ${key}`,
      icon: <i />,
      apiMethod: vi.fn(async () => page([{ id: "d1" }, { id: "d2" }])),
      viewItemComponent: Row,
      hasStatusFilter: true,
    })),
    statuses: [{ status: 1, text: "Đang xử lý" }],
    perPageLabel: "TT/trang",
    getWaitingCounts: vi.fn(async () => ({})),
    mdms: { sectors: false, principalPositions: "ids" },
    features: { autoOpenFirst: true, backToShell: false, createShortcut: false },
    ...over,
  };
}

export function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="path">{pathname}</span>;
}

export async function mount(node: ReactElement, config: DocumentKitConfig, initialPath = "/") {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root: Root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <DocumentKitProvider config={config}>
          <Routes>
            <Route path="*" element={<>{node}<LocationProbe /></>} />
          </Routes>
        </DocumentKitProvider>
      </MemoryRouter>,
    );
  });
  return { host, path: () => host.querySelector("[data-testid=path]")?.textContent, unmount: () => act(async () => root.unmount()).then(() => host.remove()) };
}
