import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleLoadingOverlay } from "../../src/module-contract";
import { compact, cssFor, installDom, mount } from "./helpers";

beforeEach(() => installDom());
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("ModuleLoadingOverlay", () => {
  it("renders nothing when not spinning", () => {
    const { container } = mount(<ModuleLoadingOverlay spinning={false} tip="x" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a status region with the tip and a spinner", () => {
    const { container } = mount(<ModuleLoadingOverlay spinning tip="Đang khởi động" />);
    const el = container.querySelector("[role=status]") as HTMLElement;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.textContent).toContain("Đang khởi động");
    expect(el.querySelector(".ant-spin")).not.toBeNull();
  });

  it("is absolute (never fixed, no vw/vh) with z-index 1000 and the antd mask colour", () => {
    const { container } = mount(<ModuleLoadingOverlay spinning />);
    const css = compact(cssFor(container.querySelector("[role=status]")!));
    expect(css).toMatch(/position:absolute;inset:0(px)?;z-index:1000;/);
    expect(css).toContain("background:rgba(0,0,0,0.45)");
    expect(css).not.toMatch(/position:fixed|100vw|100vh/);
  });

  it("mask={false} is transparent", () => {
    const { container } = mount(<ModuleLoadingOverlay spinning mask={false} />);
    expect(compact(cssFor(container.querySelector("[role=status]")!))).toContain("background:transparent");
  });
});
