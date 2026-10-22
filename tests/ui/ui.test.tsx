import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { appState } = vi.hoisted(() => ({ appState: { loading: false, status: "Đang tải dữ liệu" } }));
vi.mock("../../src/platform-kit", () => ({ useAppContext: () => ({ state: appState }) }));
vi.mock("@ptht365/shared-ui/shared-users", () => ({
  useSharedUsers: () => ({ users: [{ id: "u1", displayName: "Nguyễn Việt Dũng", mail: "a@b.c", jobTitle: null, department: null }] }),
}));

import {
  BackToListButton,
  BrandedLoading,
  configureUi,
  ExpandingTabBar,
  Loading,
  readPanelFlag,
  TitleBar,
  UserInfo,
  writePanelFlag,
} from "../../src/ui";

let host: HTMLDivElement;
let root: Root;

async function render(node: React.ReactElement) {
  await act(async () => root.render(node));
}

beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => undefined); // useContainerBreakpoint warns outside a ModuleRoot
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("ui entry", () => {
  it("BackToListButton takes its label from configureUi", async () => {
    configureUi({ documentName: "báo cáo" });
    await render(
      <MemoryRouter>
        <BackToListButton />
      </MemoryRouter>,
    );
    expect(host.querySelector("button")?.getAttribute("aria-label")).toBe("Về danh sách báo cáo");
  });

  it("panel state is stored under the configured prefix", () => {
    configureUi({ panelStoragePrefix: "rept.panel." });
    writePanelFlag("list.collapsed", true);
    expect(localStorage.getItem("rept.panel.list.collapsed")).toBe("1");
    expect(readPanelFlag("list.collapsed")).toBe(true);
    expect(readPanelFlag("missing")).toBeNull();
  });

  it("TitleBar shows the title and calls onClose", async () => {
    const onClose = vi.fn();
    await render(<TitleBar title="Tiêu đề" onClose={onClose} />);
    expect(host.textContent).toContain("Tiêu đề");
    await act(async () => host.querySelector("button")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ExpandingTabBar selects the clicked tab and shows the count badge", async () => {
    const onChange = vi.fn();
    await render(
      <ExpandingTabBar
        items={[
          { key: "a", label: "Tất cả", icon: <i /> },
          { key: "b", label: "Chờ xử lý", icon: <i />, count: 3 },
        ]}
        activeKey="a"
        onChange={onChange}
      />,
    );
    const tabs = host.querySelectorAll("[role=tab]");
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    await act(async () => tabs[1].dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(host.textContent).toContain("3");
  });

  it("UserInfo resolves the user from the shared users", async () => {
    await render(<UserInfo userId={"u1" as never} />);
    expect(host.textContent).toContain("Nguyễn Việt Dũng");
  });

  it("BrandedLoading announces itself and shows the tip; a delay hides it at first", async () => {
    vi.useFakeTimers();
    await render(<BrandedLoading tip="Đang tải" delay={200} />);
    expect(host.querySelector("[role=status]")).toBeNull();
    await act(async () => vi.advanceTimersByTime(250));
    expect(host.querySelector("[role=status]")?.textContent).toContain("Đang tải");
    vi.useRealTimers();
  });

  it("Loading: first load shows at once, later loads are delayed", async () => {
    vi.useFakeTimers();
    appState.loading = false;
    await render(<Loading />);
    expect(host.querySelector("[role=status]")).toBeNull();

    appState.loading = true; // first load: no delay
    await render(<Loading />);
    expect(host.querySelector("[role=status]")?.textContent).toContain("Đang tải dữ liệu");

    appState.loading = false;
    await render(<Loading />);
    expect(host.querySelector("[role=status]")).toBeNull();

    appState.loading = true; // later load: hidden until the delay has passed
    await render(<Loading />);
    expect(host.querySelector("[role=status]")).toBeNull();
    await act(async () => vi.advanceTimersByTime(250));
    expect(host.querySelector("[role=status]")).not.toBeNull();

    // it stays up for its minimum time after the load ended, then goes
    appState.loading = false;
    await render(<Loading />);
    expect(host.querySelector("[role=status]")).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(700));
    expect(host.querySelector("[role=status]")).toBeNull();

    // a load that ends before the delay never shows anything
    appState.loading = true;
    await render(<Loading />);
    await act(async () => vi.advanceTimersByTime(100));
    appState.loading = false;
    await render(<Loading />);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(host.querySelector("[role=status]")).toBeNull();
    vi.useRealTimers();
  });
});
