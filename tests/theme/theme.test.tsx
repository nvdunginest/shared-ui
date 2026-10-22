import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { colors, POPOVER_CONTENT_WIDTH, StyleProvider, surfaceCard } from "../../src/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("theme entry", () => {
  it("keeps the brand colour every app shipped with", () => {
    expect(colors.primary).toBe("#C05621");
  });

  it("exposes the css mixins and the popover width", () => {
    expect(surfaceCard).toBeDefined();
    expect(POPOVER_CONTENT_WIDTH).toContain("100cqw");
  });

  it("StyleProvider renders its children", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(
        <StyleProvider>
          <span data-testid="child">hello</span>
        </StyleProvider>,
      );
    });
    expect(host.querySelector("[data-testid=child]")?.textContent).toBe("hello");
    await act(async () => root.unmount());
    host.remove();
  });
});
