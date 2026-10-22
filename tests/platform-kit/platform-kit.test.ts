import { describe, expect, it, vi } from "vitest";

const { http } = vi.hoisted(() => ({
  http: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(async () => ({ data: "ok" })), delete: vi.fn(async () => ({ data: "ok" })) },
}));

vi.mock("@ptht365/shared-ui/platform", () => ({
  axiosBuilder: { getInstance: vi.fn(async () => http), getAccessToken: vi.fn() },
  getBaseUrl: () => "https://api/app",
}));

import { FETCHING_DATA, filesHelper, userRolesController, UserRoles } from "../../src/platform-kit";

describe("platform-kit", () => {
  it("builds static file URLs from the configured base URL", () => {
    expect(filesHelper.getFileStaticUrl("abc")).toBe("https://api/app/files/abc");
  });

  it("exports the role names and the loading message", () => {
    expect(UserRoles.ADMIN_ROLE).toBe("ADMIN_ROLE");
    expect(UserRoles.MOD_ROLE).toBe("MOD_ROLE");
    expect(FETCHING_DATA).toBe("Đang tải dữ liệu");
  });

  it("module admins (mods) are managed through /user-roles/mods", async () => {
    await userRolesController.getMods();
    await userRolesController.addMod({ userId: "u1" as never });
    await userRolesController.removeMod("u1" as never);
    expect(http.get).toHaveBeenCalledWith("/user-roles/mods");
    expect(http.post).toHaveBeenCalledWith("/user-roles/mods", { userId: "u1" });
    expect(http.delete).toHaveBeenCalledWith("/user-roles/mods/u1");
  });
});
