import { describe, expect, it } from "vitest";

import {
  formatFileSize,
  getShortName,
  isEmptyOrSpaces,
  removeVietnameseTones,
  selectSearch,
} from "../../src/text-utils";

// The `./utils` entry is the copy every document app carried (identical in all five); these cases pin its behaviour.
describe("utils entry", () => {
  it("isEmptyOrSpaces", () => {
    expect(isEmptyOrSpaces("")).toBe(true);
    expect(isEmptyOrSpaces("  ")).toBe(true);
    expect(isEmptyOrSpaces(" a ")).toBe(false);
  });

  it("removeVietnameseTones strips diacritics", () => {
    expect(removeVietnameseTones("Nguyễn Việt Dũng")).toBe("Nguyen Viet Dung");
    expect(removeVietnameseTones("Đặng Thị Ánh")).toBe("Dang Thi Anh");
  });

  it("selectSearch ignores tones and case", () => {
    expect(selectSearch("viet", { label: "Nguyễn Việt Dũng" })).toBe(true);
    expect(selectSearch("xyz", { label: "Nguyễn Việt Dũng" })).toBe(false);
  });

  it("getShortName uses the first and last initials", () => {
    expect(getShortName("Nguyễn Việt Dũng")).toBe("ND");
  });

  it("formatFileSize", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(1500)).toBe("1.5 KB");
  });
});
