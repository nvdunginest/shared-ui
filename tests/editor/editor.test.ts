import { describe, expect, it, vi } from "vitest";

import { isSafeHref, normalizeRichText } from "../../src/text-utils";
import { openSafeLink } from "../../src/editor/safeLinkOpening";

describe("rich text helpers (./utils)", () => {
  it("normalizeRichText returns null for empty or invisible-only HTML and the trimmed HTML otherwise", () => {
    expect(normalizeRichText(null)).toBeNull();
    expect(normalizeRichText("<p> </p>")).toBeNull();
    expect(normalizeRichText("<p>&nbsp;\u200b</p>")).toBeNull(); // no-break and zero-width spaces are invisible
    expect(normalizeRichText("  <p>Xin chào</p>  ")).toBe("<p>Xin chào</p>");
  });

  it("isSafeHref accepts only absolute http, https and mailto URLs", () => {
    expect(isSafeHref("https://vanphu.vn/a?b=1")).toBe(true);
    expect(isSafeHref("mailto:a@b.c")).toBe(true);
    for (const bad of ["javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,x", "/relative", "foo", "#", "", null, undefined]) {
      expect(isSafeHref(bad as string | null | undefined)).toBe(false);
    }
  });
});

describe("openSafeLink", () => {
  it("opens safe links in a new tab and ignores the others", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    openSafeLink(" https://vanphu.vn ");
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe("https://vanphu.vn");
    openSafeLink("javascript:alert(1)");
    openSafeLink("#");
    expect(open).toHaveBeenCalledTimes(1);
  });
});
