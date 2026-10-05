import React from "react";
// Tests added after review T1/T2: every assertion uses hand-written expected values (never the source constants).
import { act } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleRoot, useContainerBreakpoint, useContainerWidth, useModuleFeedback, useModulePopupContainer } from "../../src/module-contract";
import { COMPAT_RESET_CSS } from "../../src/module-contract/resetCompat";
import { createContainerStore } from "../../src/module-contract/containerStore";
import { ShellSimulator } from "../../src/dev-shell";
import { cssFor, frame, installDom, mount, observerCount, resizeFrame, rootOf } from "./helpers";

beforeEach(() => installDom());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

// Written by hand from docs/api/ui-module-contract-contract.md section 2.2.
const EXPECTED_ROOT: Record<string, string> = {
  position: "relative",
  width: "100%",
  height: "100%",
  "min-width": "0",
  "min-height": "0",
  margin: "0",
  padding: "0",
  overflow: "hidden",
  "box-sizing": "border-box",
  isolation: "isolate",
  contain: "layout paint",
  "container-type": "inline-size",
  "container-name": "module-root",
};

describe("root declarations (hand-written expectation, real computed style)", () => {
  it("getComputedStyle of the root returns the contract values", () => {
    const { container } = mount(<ModuleRoot><span /></ModuleRoot>);
    const computed = getComputedStyle(rootOf(container));
    // jsdom serialises a bare 0 either as 0 or 0px.
    const ZERO_LENGTHS = ["min-width", "min-height", "margin", "padding"];
    for (const [prop, value] of Object.entries(EXPECTED_ROOT)) {
      expect(computed.getPropertyValue(prop), prop).toEqual(ZERO_LENGTHS.includes(prop) ? expect.stringMatching(/^0(px)?$/) : value);
    }
  });

  it("and no other layout-affecting declaration is added to the root rule", () => {
    const { container } = mount(<ModuleRoot reset="none"><span /></ModuleRoot>);
    const rule = cssFor(rootOf(container)).split("\n").find((l) => /^\.[A-Za-z0-9_-]+ \{/.test(l)) ?? "";
    const props = [...rule.matchAll(/([a-z-]+):/g)].map((m) => m[1]).sort();
    expect(props).toEqual(Object.keys(EXPECTED_ROOT).sort());
  });
});

describe("lifecycle: nothing leaks", () => {
  it("unmounting a ModuleRoot disconnects its ResizeObserver", () => {
    const { unmount } = mount(<ModuleRoot><span /></ModuleRoot>);
    expect(observerCount()).toBe(1);
    unmount();
    expect(observerCount()).toBe(0);
  });

  it("attach() twice on one store never leaves two observers", () => {
    const store = createContainerStore();
    const a = document.createElement("div");
    const b = document.createElement("div");
    store.attach(a);
    store.attach(b);
    expect(observerCount()).toBe(1);
    store.detach();
    expect(observerCount()).toBe(0);
  });

  it("unmounting the ShellSimulator disconnects its frame observer", () => {
    const { unmount } = mount(<ShellSimulator><span /></ShellSimulator>);
    expect(observerCount()).toBe(1);
    unmount();
    expect(observerCount()).toBe(0);
  });

  it("useContainerWidth cancels a pending animation frame on unmount", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const cancel = vi.spyOn(globalThis, "cancelAnimationFrame");
    function W() {
      return <i>{useContainerWidth()}</i>;
    }
    const { unmount } = mount(<ModuleRoot><W /></ModuleRoot>);
    resizeFrame(555); // schedules a frame
    unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

describe("useModulePopupContainer", () => {
  it("returns the same function across re-renders (safe in dependency arrays)", () => {
    const seen: Array<() => HTMLElement> = [];
    function Probe({ tick }: { tick: number }) {
      seen.push(useModulePopupContainer());
      return <i>{tick}</i>;
    }
    const { root } = mount(<ModuleRoot><Probe tick={0} /></ModuleRoot>);
    act(() => root.render(<ModuleRoot><Probe tick={1} /></ModuleRoot>));
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(new Set(seen).size).toBe(1);
  });
});

describe("first paint without feedback", () => {
  it("children still render only after the first measurement (feedback={false})", () => {
    frame.width = 700;
    const seen: string[] = [];
    function First() {
      seen.push(useContainerBreakpoint());
      return null;
    }
    mount(<ModuleRoot feedback={false}><First /></ModuleRoot>);
    expect(seen[0]).toBe("medium");
    expect(seen).not.toContain("wide");
  });
});

describe("props", () => {
  it("className and style land on the root element", () => {
    const { container } = mount(
      <ModuleRoot className="my-module" style={{ outline: "3px solid red" }}><span /></ModuleRoot>,
    );
    const root = rootOf(container);
    expect(root.classList.contains("my-module")).toBe(true);
    expect(root.style.outline).toBe("3px solid red");
  });

  it("changing breakpoints after mount re-evaluates the tier", () => {
    frame.width = 800;
    const { container, root } = mount(<ModuleRoot><span /></ModuleRoot>);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("medium");
    act(() => root.render(<ModuleRoot breakpoints={{ medium: 500, wide: 700 }}><span /></ModuleRoot>));
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("wide");
  });

  it("changing fallbackTier after mount re-evaluates the fallback", () => {
    frame.width = 0;
    const { container, root } = mount(<ModuleRoot fallbackTier="narrow"><span /></ModuleRoot>);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("narrow");
    act(() => root.render(<ModuleRoot fallbackTier="medium"><span /></ModuleRoot>));
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("medium");
  });

  it("the theme prop is isolated from an outer ConfigProvider (inherit: false)", () => {
    let primary = "";
    function Probe() {
      primary = antdTheme.useToken().token.colorPrimary;
      return null;
    }
    mount(
      <ConfigProvider theme={{ token: { colorPrimary: "#ff0000" } }}>
        <ModuleRoot theme={{ token: { fontSize: 15 } }}><Probe /></ModuleRoot>
      </ConfigProvider>,
    );
    expect(primary.toLowerCase()).toBe("#1677ff");
  });

  it("without a theme prop the module keeps the surrounding theme (its own ConfigProvider keeps working)", () => {
    let primary = "";
    function Probe() {
      primary = antdTheme.useToken().token.colorPrimary;
      return null;
    }
    mount(
      <ConfigProvider theme={{ token: { colorPrimary: "#ff0000" } }}>
        <ModuleRoot><Probe /></ModuleRoot>
      </ConfigProvider>,
    );
    expect(primary.toLowerCase()).toBe("#ff0000");
  });
});

// reset="none": jsdom has no selector specificity, so the zero-specificity compat reset would win over antd here.
describe("M1: feedback has its own isolated theme", () => {
  async function openToast(wrap: (children: React.ReactNode) => React.ReactElement) {
    let api!: ReturnType<typeof useModuleFeedback>;
    function Grab() {
      api = useModuleFeedback();
      return null;
    }
    const { container } = mount(wrap(<Grab />));
    await act(async () => {
      api.message.success("hello");
      api.modal.confirm({ title: "sure?", content: "body" });
      await new Promise((r) => setTimeout(r, 50));
    });
    const root = rootOf(container);
    return {
      toast: getComputedStyle(root.querySelector(".ant-message") as HTMLElement),
      confirmBody: getComputedStyle(root.querySelector(".ant-modal") as HTMLElement),
    };
  }

  const LEGACY = { inherit: false, token: { fontSize: 12, colorPrimary: "#1677FF" } };

  it("a shell legacy theme (fontSize 12) around the module does NOT shrink toasts and confirms", async () => {
    const { toast, confirmBody } = await openToast(
      (g) => <ConfigProvider theme={LEGACY}><ModuleRoot reset="none">{g}</ModuleRoot></ConfigProvider>,
    );
    expect(toast.fontSize).toBe("14px");
    expect(confirmBody.fontSize).toBe("14px");
  });

  it("the ModuleRoot theme prop overrides it (module tokens reach toasts and confirms)", async () => {
    const { toast, confirmBody } = await openToast(
      (g) => <ConfigProvider theme={LEGACY}><ModuleRoot reset="none" theme={{ token: { fontSize: 16 } }}>{g}</ModuleRoot></ConfigProvider>,
    );
    expect(toast.fontSize).toBe("16px");
    expect(confirmBody.fontSize).toBe("16px");
  });

  it("the module children keep the surrounding (legacy) theme: only feedback is isolated", () => {
    let size = 0;
    function Probe() {
      size = antdTheme.useToken().token.fontSize;
      return null;
    }
    mount(<ConfigProvider theme={LEGACY}><ModuleRoot><Probe /></ModuleRoot></ConfigProvider>);
    expect(size).toBe(12);
  });
});


describe("compat reset content", () => {
  it("has no selector that needs an ancestor outside the root (the old dead `html [type='button']`)", () => {
    expect(COMPAT_RESET_CSS).not.toMatch(/:where\(&\) (html|body)[ [.#:]/);
    expect(COMPAT_RESET_CSS).toContain(":where(&) [type='button']");
    expect(COMPAT_RESET_CSS).toContain("[type='submit']{-webkit-appearance:button}");
    expect(COMPAT_RESET_CSS).toContain(":where(&) [hidden]{display:none !important}");
  });
});
