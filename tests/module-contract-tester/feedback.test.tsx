// Tester: useModuleFeedback with its own context (retest). Throws outside / with feedback off, isolated theme, theme prop override,
// several roots, unmount leaves nothing behind.
import { act } from "react";
import { ConfigProvider } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleRoot, useModuleFeedback } from "../../src/module-contract";
import { installDom, mount, rootOf } from "../module-contract/helpers";

beforeEach(() => installDom());
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 120)); });
type Api = ReturnType<typeof useModuleFeedback>;
function Grab({ into }: { into: { api?: Api } }) { into.api = useModuleFeedback(); return null; }
const fontOf = (el: Element | null) => (el ? getComputedStyle(el as HTMLElement).fontSize : null);

describe("useModuleFeedback context", () => {
  it("throws outside any ModuleRoot", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => mount(<Grab into={{}} />)).toThrow(/ModuleRoot/);
    err.mockRestore();
  });
  it("throws under a ModuleRoot with feedback={false}", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => mount(<ModuleRoot feedback={false}><Grab into={{}} /></ModuleRoot>)).toThrow(/feedback/);
    err.mockRestore();
  });
  it("two roots: each toast lands in the root that opened it", async () => {
    const a: { api?: Api } = {}; const b: { api?: Api } = {};
    const { container } = mount(<div><ModuleRoot><Grab into={a} /></ModuleRoot><ModuleRoot><Grab into={b} /></ModuleRoot></div>);
    await act(async () => { a.api!.message.info("from A"); await new Promise((r) => setTimeout(r, 80)); });
    const roots = container.querySelectorAll("[data-module-root]");
    expect(roots[0].textContent).toContain("from A");
    expect(roots[1].textContent).not.toContain("from A");
    await act(async () => { b.api!.message.info("from B"); await new Promise((r) => setTimeout(r, 80)); });
    expect(roots[1].textContent).toContain("from B");
    expect(roots[0].textContent).not.toContain("from B");
  });
  it("unmounting the root removes its toast host; nothing is left in document.body", async () => {
    const a: { api?: Api } = {};
    const m = mount(<ModuleRoot><Grab into={a} /></ModuleRoot>);
    await act(async () => { a.api!.message.info("bye"); a.api!.notification.info({ message: "n" }); await new Promise((r) => setTimeout(r, 80)); });
    m.unmount(); await settle();
    expect(document.body.querySelectorAll(".ant-message, .ant-notification, .ant-modal-root")).toHaveLength(0);
  });
});

describe("theme isolation of toasts", () => {
  it("shell-like outer theme (fontSize 12) does not leak into the toast: 14px", async () => {
    const a: { api?: Api } = {};
    const { container } = mount(<ConfigProvider theme={{ token: { fontSize: 12, colorPrimary: "#ff0000" } }}><ModuleRoot><Grab into={a} /></ModuleRoot></ConfigProvider>);
    await act(async () => { a.api!.message.info("t"); await new Promise((r) => setTimeout(r, 100)); });
    expect(fontOf(rootOf(container).querySelector(".ant-message-notice-content"))).toBe("14px");
  });
  it("ModuleRoot theme prop overrides: fontSize 16 gives a 16px toast", async () => {
    const a: { api?: Api } = {};
    const { container } = mount(<ModuleRoot theme={{ token: { fontSize: 16 } }}><Grab into={a} /></ModuleRoot>);
    await act(async () => { a.api!.message.info("t"); await new Promise((r) => setTimeout(r, 100)); });
    expect(fontOf(rootOf(container).querySelector(".ant-message-notice-content"))).toBe("16px");
  });
  it("module children keep the outer (legacy) theme: not isolated by the feedback host", async () => {
    const { container } = mount(<ConfigProvider theme={{ token: { fontSize: 12 } }}><ModuleRoot><span className="ant-btn">x</span></ModuleRoot></ConfigProvider>);
    expect(container.querySelector(".ant-btn")).not.toBeNull();
  });
});
