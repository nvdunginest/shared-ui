import { describe, expect, it } from "vitest";

import {
  CONTAINER_BREAKPOINTS,
  containerMaxWidth,
  containerMinWidth,
  resolveContainerTier,
} from "../../src/module-contract/breakpoints";

describe("resolveContainerTier", () => {
  it.each([
    [0, "narrow"], [375, "narrow"], [528, "narrow"], [671, "narrow"],
    [672, "medium"], [688, "medium"], [1040, "medium"], [1183, "medium"],
    [1184, "wide"], [1200, "wide"], [1840, "wide"],
  ] as const)("width %i -> %s", (width, tier) => {
    expect(resolveContainerTier(width)).toBe(tier);
  });

  it("matches the contract reference table: the shell has no Sider on module routes, so frame = window", () => {
    const rows: Array<[number, string]> = [
      [375, "narrow"], [768, "medium"], [1024, "medium"], [1280, "wide"], [1440, "wide"], [1920, "wide"],
    ];
    for (const [frame, tier] of rows) expect(resolveContainerTier(frame)).toBe(tier);
  });

  it("embedding next to a Sider (simulator 80/240) is just a narrower frame", () => {
    const rows: Array<[number, number, string]> = [
      [768, 80, "medium"], [768, 240, "narrow"], [1024, 240, "medium"], [1280, 80, "wide"], [1280, 240, "medium"], [1440, 240, "wide"],
    ];
    for (const [win, sider, tier] of rows) expect(resolveContainerTier(win - sider)).toBe(tier);
  });

  it("honours custom breakpoints", () => {
    expect(resolveContainerTier(499, { medium: 500, wide: 900 })).toBe("narrow");
    expect(resolveContainerTier(500, { medium: 500, wide: 900 })).toBe("medium");
    expect(resolveContainerTier(900, { medium: 500, wide: 900 })).toBe("wide");
  });

  it("exposes the agreed defaults and none of the old window set", () => {
    expect(CONTAINER_BREAKPOINTS).toEqual({ medium: 672, wide: 1184 });
    const old = [576, 768, 992, 1200, 1600];
    expect(Object.values(CONTAINER_BREAKPOINTS).some((v) => old.includes(v))).toBe(false);
  });
});

describe("container query helpers use the same numbers", () => {
  it("min-width strings", () => {
    expect(containerMinWidth("medium")).toBe("@container module-root (min-width: 672px)");
    expect(containerMinWidth("wide")).toBe("@container module-root (min-width: 1184px)");
  });
  it("max-width strings are the exact complement of min-width (no gap for fractional widths)", () => {
    expect(containerMaxWidth("medium")).toBe("@container module-root (not (min-width: 672px))");
    expect(containerMaxWidth("wide")).toBe("@container module-root (not (min-width: 1184px))");
    for (const tier of ["medium", "wide"] as const) {
      const min = containerMinWidth(tier).replace("@container module-root ", "");
      expect(containerMaxWidth(tier)).toBe(`@container module-root (not ${min})`);
    }
  });
  it("boundary widths: floor(671.99) is narrow and the CSS complement of min-width 672 also matches it", () => {
    // `not (min-width: 672px)` is true for every width < 672, including 671.99
    const matchesNot = (w: number, min: number) => !(w >= min);
    for (const w of [671, 671.5, 671.99, 1183.99]) {
      const min = w < 700 ? 672 : 1184;
      expect(matchesNot(w, min)).toBe(true);
      expect(resolveContainerTier(Math.floor(w))).not.toBe(min === 672 ? "medium" : "wide");
    }
    expect(matchesNot(672, 672)).toBe(false);
    expect(matchesNot(1184, 1184)).toBe(false);
  });
  it("custom breakpoints flow into the strings", () => {
    expect(containerMinWidth("medium", { medium: 500, wide: 900 })).toContain("500px");
  });
});
