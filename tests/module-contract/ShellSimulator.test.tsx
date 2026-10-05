import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShellSimulator } from "../../src/dev-shell";
import { MODULE_FRAME_DECLARATIONS } from "../../src/dev-shell";
import { parseSimulatorParams, siderWarning, simFrameWidth } from "../../src/dev-shell/simulatorParams";
import { installDom, mount } from "./helpers";

beforeEach(() => installDom());
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
});

describe("simulator params", () => {
  it("parses w, sider and sim, ignoring invalid values", () => {
    expect(parseSimulatorParams("?w=1024&sider=240")).toEqual({ enabled: true, width: 1024, sider: 240 });
    expect(parseSimulatorParams("?w=auto&sim=0")).toEqual({ enabled: false, width: "auto", sider: 0 });
    expect(parseSimulatorParams("?w=abc&sider=99")).toEqual({ enabled: true, width: 1280, sider: 0 });
    expect(parseSimulatorParams("")).toEqual({ enabled: true, width: 1280, sider: 0 });
    expect(parseSimulatorParams("?w=50").width).toBe(1280);
  });
  it("frame = window - sider; Sider 0 (the real module route) never warns", () => {
    expect(simFrameWidth(1280, 240)).toBe(1040);
    expect(simFrameWidth(1280, 0)).toBe(1280);
    for (const w of [375, 768, 1280, 1920]) expect(siderWarning(w, 0)).toBeNull();
  });
  it("Sider 80/240 only produce a note, never a block", () => {
    expect(siderWarning(375, 80)).toMatch(/no Sider below 768/);
    expect(siderWarning(1280, 80)).toMatch(/no Sider on module routes/);
    expect(siderWarning(768, 240)).toMatch(/no Sider on module routes/);
  });
});

describe("ShellSimulator", () => {
  it("renders 56px header with four focusable buttons and the frame with the shell declarations", () => {
    window.history.replaceState(null, "", "/?w=1280");
    const { container } = mount(<ShellSimulator><div id="child" /></ShellSimulator>);
    const header = container.querySelector("[data-testid=sim-header]") as HTMLElement;
    expect(header.style.height).toBe("56px");
    expect(container.querySelectorAll("[data-testid=sim-header-button]")).toHaveLength(4);
    expect(container.querySelector("[data-testid=sim-readout]")?.textContent).toBe("frame = 1280 - 0 = 1280");
    expect(container.querySelector("[data-testid=sim-frame] #child")).not.toBeNull();
    expect(MODULE_FRAME_DECLARATIONS).toMatchObject({ position: "relative", overflow: "hidden", isolation: "isolate", padding: "0" });
  });

  it("defaults to Sider 0 (module route) without any note", () => {
    const { container } = mount(<ShellSimulator><span /></ShellSimulator>);
    expect(container.querySelector("[data-testid=sim-sider]")).toBeNull();
    expect(container.querySelector("[data-testid=sim-sider-note]")).toBeNull();
  });

  it("applies toolbar changes immediately and only notes an embedding Sider", () => {
    const { container } = mount(<ShellSimulator><span /></ShellSimulator>);
    const device = container.querySelector("[data-testid=sim-device]") as HTMLElement;
    const click = (label: string) => act(() => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!.click());
    click("375");
    expect(device.style.width).toBe("375px");
    expect(container.querySelector("[data-testid=sim-sider-note]")).toBeNull();
    click("80");
    expect(container.querySelector("[data-testid=sim-sider-note]")?.textContent).toMatch(/no Sider below 768/);
    expect(container.querySelector("[data-testid=sim-sider]")).not.toBeNull();
    click("1280");
    expect(container.querySelector("[data-testid=sim-sider-note]")?.textContent).toMatch(/no Sider on module routes/);
    click("0");
    expect(container.querySelector("[data-testid=sim-sider-note]")).toBeNull();
    expect(container.querySelector("[data-testid=sim-sider]")).toBeNull();
  });

  it("?sim=0 renders the children bare", () => {
    window.history.replaceState(null, "", "/?sim=0");
    const { container } = mount(<ShellSimulator><b id="bare" /></ShellSimulator>);
    expect(container.querySelector("[data-testid=sim-root]")).toBeNull();
    expect(container.querySelector("#bare")).not.toBeNull();
  });
});
