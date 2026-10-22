import { describe, expect, it, vi } from "vitest";

vi.mock("@ptht365/shared-ui/platform", () => ({
  axiosBuilder: { getInstance: vi.fn(), getAccessToken: vi.fn() },
  getBaseUrl: () => "https://api/app",
}));

import { FETCHING_DATA, filesHelper, UserRoles } from "../../src/platform-kit";

describe("platform-kit", () => {
  it("builds static file URLs from the configured base URL", () => {
    expect(filesHelper.getFileStaticUrl("abc")).toBe("https://api/app/files/abc");
  });

  it("exports the admin role name and the loading message", () => {
    expect(UserRoles.ADMIN_ROLE).toBe("ADMIN_ROLE");
    expect(FETCHING_DATA).toBe("Đang tải dữ liệu");
  });
});
