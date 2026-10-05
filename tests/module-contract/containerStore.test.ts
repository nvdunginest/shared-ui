import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createContainerStore } from "../../src/module-contract/containerStore";
import { frame, installDom, resizeFrame } from "./helpers";

function makeRoot() {
  const el = document.createElement("div");
  el.setAttribute("data-module-root", "");
  document.body.appendChild(el);
  return el;
}

describe("containerStore", () => {
  beforeEach(() => installDom());
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("starts without width and reports the fallback tier", () => {
    expect(createContainerStore().getWidth()).toBeUndefined();
    expect(createContainerStore().getTier()).toBe("wide");
    expect(createContainerStore({ fallbackTier: "narrow" }).getTier()).toBe("narrow");
  });

  it("measures on attach and writes data attributes", () => {
    frame.width = 688;
    const el = makeRoot();
    const store = createContainerStore();
    store.attach(el);
    expect(store.getWidth()).toBe(688);
    expect(el.getAttribute("data-frame-width")).toBe("688");
    expect(el.getAttribute("data-frame-tier")).toBe("medium");
  });

  it("floors fractional widths so JS agrees with container queries", () => {
    frame.width = 671.9;
    const store = createContainerStore();
    store.attach(makeRoot());
    expect(store.getWidth()).toBe(671);
    expect(store.getTier()).toBe("narrow");
  });

  it("ignores width 0 and keeps the last value (module hidden)", () => {
    frame.width = 800;
    const el = makeRoot();
    const store = createContainerStore();
    store.attach(el);
    resizeFrame(0);
    expect(store.getWidth()).toBe(800);
    expect(el.getAttribute("data-frame-width")).toBe("800");
    resizeFrame(1300);
    expect(store.getTier()).toBe("wide");
  });

  it("notifies only when the integer width changed", () => {
    const store = createContainerStore();
    const listener = vi.fn();
    store.attach(makeRoot());
    store.subscribe(listener);
    resizeFrame(1000.4);
    expect(listener).not.toHaveBeenCalled();
    resizeFrame(1001);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops listening after detach and unsubscribe", () => {
    const store = createContainerStore();
    const listener = vi.fn();
    store.attach(makeRoot());
    const off = store.subscribe(listener);
    off();
    resizeFrame(2000);
    expect(listener).not.toHaveBeenCalled();
    store.detach();
    resizeFrame(300);
    expect(store.getWidth()).toBe(2000);
  });
});

describe("containerStore without ResizeObserver", () => {
  beforeEach(() => installDom({ withResizeObserver: false }));
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("re-measures the ROOT on window resize and never reads window.innerWidth", () => {
    frame.width = 500;
    const widthSpy = vi.spyOn(window, "innerWidth", "get").mockReturnValue(5000);
    const store = createContainerStore();
    store.attach(makeRoot());
    expect(store.getTier()).toBe("narrow");
    frame.width = 1300;
    window.dispatchEvent(new Event("resize"));
    expect(store.getTier()).toBe("wide");
    expect(widthSpy).not.toHaveBeenCalled();
  });

  it("falls back (no throw) when the root has no layout", () => {
    frame.width = 0;
    const store = createContainerStore({ fallbackTier: "medium" });
    expect(() => store.attach(makeRoot())).not.toThrow();
    expect(store.getTier()).toBe("medium");
  });
});
