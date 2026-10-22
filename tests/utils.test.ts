import { describe, expect, it } from "vitest";

import {
  formatFileSize,
  getDiffDays,
  getShortName,
  isEmptyOrSpaces,
  removeVietnameseTones,
  selectSearch,
  toProperCase,
} from "../src/utils";

// Characterisation of the current behaviour of the legacy `utils.ts` (the apps carry their own, newer copy of it;
// when the `./theme` entry takes over these helpers the same cases must keep passing).
describe("utils", () => {
  it("isEmptyOrSpaces", () => {
    expect(isEmptyOrSpaces("")).toBe(true);
    expect(isEmptyOrSpaces("   ")).toBe(true);
    expect(isEmptyOrSpaces(" a ")).toBe(false);
    expect(isEmptyOrSpaces(undefined as unknown as string)).toBe(true);
  });

  it("removeVietnameseTones strips diacritics and punctuation", () => {
    expect(removeVietnameseTones("Nguyễn Việt Dũng")).toBe("Nguyen Viet Dung");
    expect(removeVietnameseTones("Đặng Thị Ánh")).toBe("Dang Thi Anh");
    expect(removeVietnameseTones("a-b_c")).toBe("a b c");
  });

  it("selectSearch matches without tones and case", () => {
    expect(selectSearch("viet", { label: "Nguyễn Việt Dũng" })).toBe(true);
    expect(selectSearch("xyz", { label: "Nguyễn Việt Dũng" })).toBe(false);
    expect(selectSearch("", { label: "x" })).toBe(false);
    expect(selectSearch("x", undefined)).toBe(false);
  });

  it("getShortName takes the first letters of the first and last word", () => {
    expect(getShortName("Nguyễn Việt Dũng")).toBe("ND");
    expect(getShortName("  An ")).toBe("AA");
  });

  it("toProperCase", () => {
    expect(toProperCase("hELLO wORLD")).toBe("Hello World");
  });

  it("formatFileSize uses 1000-based units", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(1500)).toBe("1.5 KB");
    expect(formatFileSize(1_000_000, 0)).toBe("1 MB");
  });

  it("getDiffDays counts both days (inclusive)", () => {
    expect(getDiffDays(new Date(2026, 0, 1, 23), new Date(2026, 0, 1, 1))).toBe(1);
    expect(getDiffDays(new Date(2026, 0, 1), new Date(2026, 0, 3))).toBe(3);
  });
});
