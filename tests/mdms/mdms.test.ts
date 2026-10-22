import { beforeEach, describe, expect, it, vi } from "vitest";

const { createInstance } = vi.hoisted(() => ({ createInstance: vi.fn() }));
vi.mock("@ptht365/shared-ui/platform", () => ({ axiosBuilder: { createInstance } }));

import { companiesController, configureMdms, departmentsController } from "../../src/mdms";
import { getDtaMdmsInstance } from "../../src/mdms/client";

function fakeHttp(data: unknown = []) {
  return { get: vi.fn(async () => ({ data })) };
}

beforeEach(() => {
  createInstance.mockReset();
  configureMdms({ baseUrl: "" }); // resets the cached instance
});

describe("mdms client", () => {
  it("creates the auth-wired instance once per configured base URL", async () => {
    const http = fakeHttp();
    createInstance.mockReturnValue(http);
    configureMdms({ baseUrl: "https://api/mdms" });

    expect(await getDtaMdmsInstance()).toBe(http);
    expect(await getDtaMdmsInstance()).toBe(http);
    expect(createInstance).toHaveBeenCalledTimes(1);
    expect(createInstance).toHaveBeenCalledWith("https://api/mdms");
  });

  it("builds a new instance after configureMdms is called again", async () => {
    createInstance.mockReturnValueOnce(fakeHttp()).mockReturnValueOnce(fakeHttp());
    configureMdms({ baseUrl: "https://a" });
    await getDtaMdmsInstance();
    configureMdms({ baseUrl: "https://b" });
    await getDtaMdmsInstance();
    expect(createInstance).toHaveBeenNthCalledWith(2, "https://b");
  });
});

describe("mdms controllers", () => {
  it("companies: sends activeOnly and returns the payload", async () => {
    const http = fakeHttp([{ id: "c1" }]);
    createInstance.mockReturnValue(http);
    configureMdms({ baseUrl: "https://api/mdms" });

    await expect(companiesController.getCompanies()).resolves.toEqual([{ id: "c1" }]);
    expect(http.get).toHaveBeenCalledWith("/org-chart/companies", { params: { activeOnly: false } });
    await companiesController.getMyCompanies(true);
    expect(http.get).toHaveBeenLastCalledWith("/org-chart/me/companies", { params: { activeOnly: true } });
  });

  it("departments: exposes the controller functions", () => {
    expect(typeof departmentsController.getDepartments).toBe("function");
    expect(typeof departmentsController.getMyDepartments).toBe("function");
  });
});
