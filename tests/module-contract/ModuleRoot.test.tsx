import { act, useEffect, useRef } from "react";
import { ConfigProvider, Drawer, Modal, Select } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleRoot, useContainerBreakpoint, useContainerWidth, useModuleFeedback, useModulePopupContainer } from "../../src/module-contract";
import { resetOutsideWarning } from "../../src/module-contract/hooks";
import { COMPAT_RESET_CSS } from "../../src/module-contract/resetCompat";
import { ROOT_DECLARATIONS } from "../../src/module-contract/moduleRootStyles";
import { compact, cssFor, frame, installDom, mount, resizeFrame, rootOf } from "./helpers";

// jsdom 26 keeps `calc(100cqw - 16px)`, jsdom 30 normalises it to `calc(-16px + 100cqw)`: both are the same rule.
const MODAL_RULE = /\.ant-modal\{max-width:calc\((100cqw-16px|-16px\+100cqw)\);\}/;

function TierProbe({ onRender }: { onRender?: () => void }) {
  const tier = useContainerBreakpoint();
  useEffect(() => onRender?.());
  return <span data-testid="tier">{tier}</span>;
}

beforeEach(() => installDom());
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("ModuleRoot attributes and first paint", () => {
  it("adds exactly one element carrying the three data attributes, measured before children render", () => {
    frame.width = 688;
    const seen: string[] = [];
    function First() {
      seen.push(useContainerBreakpoint());
      return null;
    }
    const { container } = mount(<ModuleRoot><First /></ModuleRoot>);
    const root = rootOf(container);
    expect(container.children).toHaveLength(1);
    expect(root.hasAttribute("data-module-root")).toBe(true);
    expect(root.getAttribute("data-frame-width")).toBe("688");
    expect(root.getAttribute("data-frame-tier")).toBe("medium");
    expect(seen[0]).toBe("medium");
    expect(seen).not.toContain("wide");
  });

  it("updates attributes on resize without React state", () => {
    const { container } = mount(<ModuleRoot><TierProbe /></ModuleRoot>);
    resizeFrame(671);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("narrow");
    resizeFrame(672);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("medium");
    resizeFrame(1183);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("medium");
    resizeFrame(1184);
    expect(rootOf(container).getAttribute("data-frame-tier")).toBe("wide");
    expect(rootOf(container).getAttribute("data-frame-width")).toBe("1184");
  });

  it("uses fallbackTier when the width is 0 and still renders", () => {
    frame.width = 0;
    const { container } = mount(<ModuleRoot fallbackTier="narrow"><TierProbe /></ModuleRoot>);
    expect(container.querySelector("[data-testid=tier]")?.textContent).toBe("narrow");
    expect(rootOf(container).hasAttribute("data-frame-width")).toBe(false);
  });

  it("forwards rootRef (object and callback)", () => {
    const objectRef = { current: null as HTMLDivElement | null };
    const { container } = mount(<ModuleRoot rootRef={objectRef}><span /></ModuleRoot>);
    expect(objectRef.current).toBe(rootOf(container));
    const fn = vi.fn();
    mount(<ModuleRoot rootRef={fn}><span /></ModuleRoot>);
    expect(fn).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe("ModuleRoot CSS contract", () => {
  it("declares the normative root declarations", () => {
    const { container } = mount(<ModuleRoot><span /></ModuleRoot>);
    const css = compact(cssFor(rootOf(container)));
    for (const [prop, value] of Object.entries(ROOT_DECLARATIONS)) expect(css).toMatch(new RegExp(`${prop}:${compact(value).replace(/^0$/, "0(px)?")};`));
    expect(ROOT_DECLARATIONS.contain).toBe("layout paint");
    expect(ROOT_DECLARATIONS["container-type"]).toBe("inline-size");
    expect(ROOT_DECLARATIONS["container-name"]).toBe("module-root");
    expect(ROOT_DECLARATIONS.isolation).toBe("isolate");
  });

  it("scopes every reset selector with :where(&) and ships no global rule", () => {
    const rules = COMPAT_RESET_CSS.split("}").filter(Boolean);
    expect(rules.length).toBeGreaterThan(50);
    for (const rule of rules) {
      const selectors = rule.slice(0, rule.indexOf("{")).split(",");
      for (const s of selectors) expect(s.startsWith(":where(&) ")).toBe(true);
    }
    expect(COMPAT_RESET_CSS).not.toMatch(/(^|,|})\s*(html|body)\b/);
  });

  it("emits the scoped reset with the root class, specificity 0, and no bare selector", () => {
    const { container } = mount(<ModuleRoot><span /></ModuleRoot>);
    const css = cssFor(rootOf(container));
    const cls = [...rootOf(container).classList].find((c) => !c.startsWith("sc-"))!;
    expect(css).toContain(`:where(.${cls}) h1`);
    expect(css).toContain(`:where(.${cls}) *::-webkit-scrollbar`);
    // (the [hidden] rule is asserted on the source string in hardening.test.tsx: jsdom 30 drops `!important` rules from the CSSOM)
  });

  it("reset 'none' removes the preset but keeps the declarations and the overlay rules", () => {
    const { container } = mount(<ModuleRoot reset="none"><span /></ModuleRoot>);
    const css = cssFor(rootOf(container));
    expect(css).not.toContain(":where(");
    expect(compact(css)).toContain("contain:layoutpaint;");
    expect(compact(css)).toMatch(MODAL_RULE);
  });

  it("ships the overlay size rules based on cqw", () => {
    const { container } = mount(<ModuleRoot><span /></ModuleRoot>);
    const css = compact(cssFor(rootOf(container)));
    expect(css).toMatch(MODAL_RULE);
    expect(css).toContain(".ant-drawer-content-wrapper{max-width:100cqw;}");
  });

  it("pins the measured shell text values on the root (colour, size, line height)", () => {
    const { container } = mount(<ModuleRoot>{null}</ModuleRoot>);
    const css = cssFor(rootOf(container));
    expect(css).toMatch(/[ {;]color: (#000|rgb\(0, 0, 0\));/);
    expect(css).toContain("font-size: 16px;");
    expect(css).toContain("line-height: 1;");
  });

  it("pins font-family from the prop and defaults to sans-serif", () => {
    const a = mount(<ModuleRoot fontFamily="Georgia">{null}</ModuleRoot>);
    expect(cssFor(rootOf(a.container))).toContain("font-family: Georgia;");
    const b = mount(<ModuleRoot>{null}</ModuleRoot>);
    expect(cssFor(rootOf(b.container))).toContain("font-family: sans-serif;");
  });
});

describe("hooks", () => {
  it("re-renders only when the tier changes, not on every px change", () => {
    const renders = vi.fn();
    mount(<ModuleRoot><TierProbe onRender={renders} /></ModuleRoot>);
    renders.mockClear();
    for (const w of [1001, 1002, 1100, 1183 - 10, 1050]) resizeFrame(w);
    expect(renders).not.toHaveBeenCalled();
    resizeFrame(600);
    expect(renders).toHaveBeenCalledTimes(1);
  });

  it("useContainerWidth follows px changes (per animation frame)", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    function W() {
      return <i data-testid="w">{useContainerWidth()}</i>;
    }
    const { container } = mount(<ModuleRoot><W /></ModuleRoot>);
    expect(container.querySelector("[data-testid=w]")?.textContent).toBe("1000");
    resizeFrame(913);
    act(() => { vi.advanceTimersToNextFrame(); });
    expect(container.querySelector("[data-testid=w]")?.textContent).toBe("913");
    vi.useRealTimers();
  });

  it("outside a ModuleRoot: returns 'wide', logs console.error once, never throws", () => {
    resetOutsideWarning();
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = mount(<><TierProbe /><TierProbe /></>);
    expect(container.querySelectorAll("[data-testid=tier]")[0].textContent).toBe("wide");
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("nested roots: the inner root wins", () => {
    frame.width = 1000;
    const { container } = mount(
      <ModuleRoot>
        <TierProbe />
        <ModuleRoot breakpoints={{ medium: 2000, wide: 3000 }}><TierProbe /></ModuleRoot>
      </ModuleRoot>,
    );
    const tiers = [...container.querySelectorAll("[data-testid=tier]")].map((n) => n.textContent);
    expect(tiers).toEqual(["medium", "narrow"]);
  });

  it("does not read window.innerWidth", () => {
    const spy = vi.spyOn(window, "innerWidth", "get").mockReturnValue(10);
    mount(<ModuleRoot><TierProbe /></ModuleRoot>);
    resizeFrame(1500);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("overlays mount inside the root", () => {
  it("Modal, Drawer and Select dropdown portal into the root, not document.body", async () => {
    const { container } = mount(
      <ModuleRoot>
        <Modal open title="m" getContainer={undefined}>m</Modal>
        <Drawer open title="d">d</Drawer>
        <Select open options={[{ value: "a", label: "A" }]} />
      </ModuleRoot>,
    );
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    const root = rootOf(container);
    expect(root.querySelector(".ant-modal-root")).not.toBeNull();
    expect(root.querySelector(".ant-drawer")).not.toBeNull();
    expect(root.querySelector(".ant-select-dropdown")).not.toBeNull();
    expect(document.body.querySelectorAll(":scope > .ant-modal-root, :scope > .ant-drawer, :scope > .ant-select-dropdown")).toHaveLength(0);
  });

  it("toasts and modal.confirm from useModuleFeedback mount inside the root", async () => {
    let api!: ReturnType<typeof useModuleFeedback>;
    function Grab() {
      const a = useModuleFeedback();
      const ref = useRef(a);
      api = ref.current;
      return null;
    }
    const { container } = mount(<ModuleRoot><Grab /></ModuleRoot>);
    await act(async () => {
      api.message.success("hello");
      api.notification.info({ message: "n" });
      api.modal.confirm({ title: "sure?" });
      await new Promise((r) => setTimeout(r, 50));
    });
    const root = rootOf(container);
    expect(root.querySelector(".ant-message")).not.toBeNull();
    expect(root.querySelector(".ant-notification")).not.toBeNull();
    expect(root.querySelector(".ant-modal-confirm")).not.toBeNull();
    expect(document.body.querySelectorAll(":scope > .ant-message, :scope > .ant-notification, :scope > .ant-modal-root")).toHaveLength(0);
  });
});

describe("popup container survives the module's own ConfigProvider", () => {
  it("a nested ConfigProvider with inherit:false (the module theme) still portals into the root", async () => {
    const { container } = mount(
      <ModuleRoot>
        <ConfigProvider theme={{ inherit: false, token: { colorPrimary: "#C05621" } }}>
          <Modal open title="m">m</Modal>
        </ConfigProvider>
      </ModuleRoot>,
    );
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(rootOf(container).querySelector(".ant-modal-root")).not.toBeNull();
    expect(document.body.querySelectorAll(":scope > .ant-modal-root")).toHaveLength(0);
  });

  it("useModulePopupContainer returns the root element, document.body outside a root", () => {
    let fromRoot!: () => HTMLElement;
    let fromOutside!: () => HTMLElement;
    function Grab({ out }: { out: "root" | "outside" }) {
      const getter = useModulePopupContainer();
      if (out === "root") fromRoot = getter; else fromOutside = getter;
      return null;
    }
    const { container } = mount(<ModuleRoot><Grab out="root" /></ModuleRoot>);
    mount(<Grab out="outside" />);
    expect(fromRoot()).toBe(rootOf(container));
    expect(fromOutside()).toBe(document.body);
  });
});

describe("useModuleFeedback guard", () => {
  it("throws a clear error outside a ModuleRoot", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Bad() {
      useModuleFeedback();
      return null;
    }
    expect(() => mount(<Bad />)).toThrow(/useModuleFeedback\(\) needs a <ModuleRoot>/);
  });

  it("throws when the root disabled feedback", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Bad() {
      useModuleFeedback();
      return null;
    }
    expect(() => mount(<ModuleRoot feedback={false}><Bad /></ModuleRoot>)).toThrow(/needs a <ModuleRoot>/);
  });
});
