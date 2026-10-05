import type { ReactElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Callback = (entries: Array<{ contentRect: { width: number }; target: Element }>) => void;

/** Controlled frame width: every element with [data-module-root] reports this width. */
export const frame = { width: 1000 };

class FakeResizeObserver {
  static instances = new Set<FakeResizeObserver>();
  private targets = new Set<Element>();
  constructor(private callback: Callback) {
    FakeResizeObserver.instances.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
    FakeResizeObserver.instances.delete(this);
  }
  fire() {
    this.callback([...this.targets].map((target) => ({ target, contentRect: { width: frame.width } })));
  }
}

/** Number of live (not disconnected) observers: leaks show up as a non-zero count after unmount. */
export const observerCount = () => FakeResizeObserver.instances.size;

export function installDom({ withResizeObserver = true } = {}) {
  frame.width = 1000;
  FakeResizeObserver.instances.clear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const width = this.hasAttribute("data-module-root") ? frame.width : 0;
    return { width, height: 0, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, toJSON: () => ({}) } as DOMRect;
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: () => undefined, removeListener: () => undefined,
      addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
    }),
  });
  if (withResizeObserver) vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  else vi.stubGlobal("ResizeObserver", undefined);
}

/** Change the frame width and tell every live observer, like the browser does after layout. */
export function resizeFrame(width: number) {
  frame.width = width;
  act(() => {
    FakeResizeObserver.instances.forEach((o) => o.fire());
  });
}

export function mount(ui: ReactElement): { container: HTMLElement; unmount: () => void; root: Root } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  return {
    container,
    root,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

export const rootOf = (c: HTMLElement) => c.querySelector("[data-module-root]") as HTMLElement;
/**
 * CSS the document holds for a given element: every rule whose selector mentions one of the element's
 * classes. styled-components writes through the CSSOM (speedy mode), so read the CSSOM rules.
 */
export function cssFor(element: Element): string {
  const classes = [...element.classList].filter((c) => c.startsWith("sc-") === false);
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .map((r) => r.cssText)
    .filter((text) => classes.some((c) => text.includes(`.${c}`)))
    .join("\n");
}

/** Compact form (no whitespace) to compare declarations regardless of formatting. */
export const compact = (text: string) => text.replace(/\s+/g, "");
