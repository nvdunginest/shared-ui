// Tester's own checks (independent of the Dev suite): popup kinds the Dev suite does not open (DatePicker, Dropdown, Tooltip,
// Popconfirm, Popover, Cascader, TreeSelect), 320 px frame, nested roots, no ResizeObserver, window width never read.
import { act } from "react";
import { Cascader, DatePicker, Dropdown, Popconfirm, Popover, Tooltip, TreeSelect } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleLoadingOverlay, ModuleRoot, resolveContainerTier, useContainerBreakpoint, useContainerWidth } from "../../src/module-contract";
import { frame, installDom, mount, resizeFrame, rootOf } from "../module-contract/helpers";

beforeEach(() => installDom());
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 80)); });

describe("every popup kind portals into the root (US6-AC2)", () => {
  const kinds: Array<[string, () => JSX.Element, string]> = [
    ["DatePicker", () => <DatePicker open />, ".ant-picker-dropdown"],
    ["Dropdown", () => <Dropdown open menu={{ items: [{ key: "1", label: "one" }] }}><span>t</span></Dropdown>, ".ant-dropdown"],
    ["Tooltip", () => <Tooltip open title="tip"><span>t</span></Tooltip>, ".ant-tooltip"],
    ["Popconfirm", () => <Popconfirm open title="sure"><span>t</span></Popconfirm>, ".ant-popover"],
    ["Popover", () => <Popover open content="body"><span>t</span></Popover>, ".ant-popover"],
    ["Cascader", () => <Cascader open options={[{ value: "a", label: "A" }]} />, ".ant-select-dropdown"],
    ["TreeSelect", () => <TreeSelect open treeData={[{ value: "a", title: "A" }]} />, ".ant-select-dropdown"],
  ];
  for (const [name, make, sel] of kinds) {
    it(`${name} is inside [data-module-root], not a child of document.body`, async () => {
      const { container } = mount(<ModuleRoot>{make()}</ModuleRoot>);
      await settle();
      const root = rootOf(container);
      expect(root.querySelector(sel), `${name} popup missing inside root`).not.toBeNull();
      expect(document.body.querySelectorAll(`:scope > ${sel}`)).toHaveLength(0);
    });
  }
});

describe("tiers, nesting, fallback (US1-AC6, US2-AC6)", () => {
  it("renders and reports narrow in a 320 px frame without throwing", () => {
    frame.width = 320;
    function P() { return <span data-testid="p">{useContainerBreakpoint()}:{useContainerWidth()}</span>; }
    const { container } = mount(<ModuleRoot><P /></ModuleRoot>);
    expect(container.querySelector("[data-testid=p]")?.textContent).toBe("narrow:320");
  });
  it("nested roots: inner root measures itself, outer keeps its own", () => {
    function P({ id }: { id: string }) { return <i data-testid={id}>{useContainerBreakpoint()}</i>; }
    const { container } = mount(<ModuleRoot><P id="outer" /><ModuleRoot><P id="inner" /></ModuleRoot></ModuleRoot>);
    expect(container.querySelectorAll("[data-module-root]")).toHaveLength(2);
    expect(container.querySelector("[data-testid=outer]")?.textContent).toBe("medium");
    expect(container.querySelector("[data-testid=inner]")?.textContent).toBe("medium");
  });
  it("without ResizeObserver: falls back, never throws, and still ignores window.innerWidth", () => {
    installDom({ withResizeObserver: false });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1900 });
    frame.width = 600;
    function P() { return <i data-testid="t">{useContainerBreakpoint()}</i>; }
    const { container } = mount(<ModuleRoot><P /></ModuleRoot>);
    expect(container.querySelector("[data-testid=t]")?.textContent).toBe("narrow");
    frame.width = 700;
    act(() => { window.dispatchEvent(new Event("resize")); });
    expect(container.querySelector("[data-testid=t]")?.textContent).toBe("medium");
  });
  it("the window width never decides the tier (window 1900, frame 671 -> narrow; frame 672 -> medium)", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1900 });
    frame.width = 671;
    const { container } = mount(<ModuleRoot><span /></ModuleRoot>);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("narrow");
    resizeFrame(672);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("medium");
  });
  it("resolveContainerTier boundaries 671/672/1183/1184 and fractional 671.9 floors upstream", () => {
    expect([671, 672, 1183, 1184].map((w) => resolveContainerTier(w))).toEqual(["narrow", "medium", "medium", "wide"]);
  });
});

describe("ModuleLoadingOverlay", () => {
  it("renders nothing when not spinning and a status region with tip when spinning", () => {
    const { container } = mount(<ModuleRoot><ModuleLoadingOverlay spinning={false} /></ModuleRoot>);
    expect(container.querySelector("[role=status]")).toBeNull();
    const m2 = mount(<ModuleRoot><ModuleLoadingOverlay spinning tip="Loading tip" /></ModuleRoot>);
    const el = m2.container.querySelector("[role=status]") as HTMLElement;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.textContent).toContain("Loading tip");
  });
});
