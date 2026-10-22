import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mdmsMock, signalrMock } = vi.hoisted(() => ({
  mdmsMock: {
    companies: vi.fn(),
    sectors: vi.fn(),
    projects: vi.fn(),
    myDepartments: vi.fn(),
    departments: vi.fn(),
    tiers: vi.fn(),
    positionsDetail: vi.fn(),
    positionIds: vi.fn(),
  },
  signalrMock: { onDocumentChanged: () => () => undefined, onWaitingCountChanged: () => () => undefined },
}));
vi.mock("../../src/mdms", async (orig) => {
  const actual = await orig<typeof import("../../src/mdms")>();
  return {
    ...actual,
    companiesController: { getCompanies: mdmsMock.companies },
    sectorsController: { getSectors: mdmsMock.sectors },
    projectsController: { getProjects: mdmsMock.projects },
    departmentsController: { getMyDepartments: mdmsMock.myDepartments, getDepartments: mdmsMock.departments },
    tiersController: { getTiers: mdmsMock.tiers },
    secretariesController: { getMyPrincipalPositionsDetail: mdmsMock.positionsDetail, getMyPrincipalPositions: mdmsMock.positionIds },
  };
});
vi.mock("../../src/signalr", () => ({ useSignalRContext: () => signalrMock }));

import {
  DocumentListProvider,
  DocumentTable,
  GlobalLoader,
  GlobalProvider,
  useDocumentKit,
  useGlobalContext,
  GlobalCompanySelector,
} from "../../src/document-kit";
import { LocationProbe, makeConfig, mount, Row } from "./helpers";

const COMPANY = "11111111-1111-1111-1111-111111111111";

function GlobalProbe() {
  const { globalState } = useGlobalContext();
  return (
    <pre data-testid="state">
      {JSON.stringify({
        selected: globalState.selectedCompanyId,
        sectors: globalState.sectors.length,
        ids: globalState.myPrincipalPositionIds,
        scopes: globalState.myPrincipalScopes.length,
      })}
    </pre>
  );
}
const state = (host: HTMLElement) => JSON.parse(host.querySelector("[data-testid=state]")!.textContent!);

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mdmsMock.companies.mockResolvedValue([{ id: COMPANY }]);
  mdmsMock.sectors.mockResolvedValue([{ id: "s1" }]);
  mdmsMock.projects.mockResolvedValue([]);
  mdmsMock.myDepartments.mockResolvedValue([]);
  mdmsMock.departments.mockResolvedValue([]);
  mdmsMock.tiers.mockResolvedValue([]);
  mdmsMock.positionsDetail.mockResolvedValue([{ positionId: "p1", allSectors: true, sectorIds: [] }]);
  mdmsMock.positionIds.mockResolvedValue(["p9"]);
});
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("DocumentKitProvider", () => {
  it("useDocumentKit throws outside the provider", () => {
    function Bad() {
      useDocumentKit();
      return null;
    }
    expect(() => renderToString(<Bad />)).toThrow("DocumentKitProvider");
  });
});

describe("GlobalProvider + GlobalLoader", () => {
  it("remembers the selected company under the app's storage key and restores it", async () => {
    const config = makeConfig();
    const first = await mount(
      <GlobalProvider>
        <GlobalLoader />
        <GlobalProbe />
      </GlobalProvider>,
      config,
    );
    await act(async () => undefined);
    expect(state(first.host).selected).toBe(COMPANY);
    expect(localStorage.getItem("test_company")).toBe(COMPANY);
    await first.unmount();

    mdmsMock.companies.mockImplementation(() => new Promise(() => undefined)); // still loading
    const second = await mount(
      <GlobalProvider>
        <GlobalProbe />
      </GlobalProvider>,
      config,
    );
    expect(state(second.host).selected).toBe(COMPANY); // restored at once, not cleared while loading
    await second.unmount();
  });

  it("loads sectors and scopes only when the config asks for them", async () => {
    const withSectors = await mount(
      <GlobalProvider>
        <GlobalLoader />
        <GlobalProbe />
      </GlobalProvider>,
      makeConfig({ mdms: { sectors: true, principalPositions: "scopes" } }),
    );
    await act(async () => undefined);
    expect(mdmsMock.sectors).toHaveBeenCalledTimes(1);
    expect(mdmsMock.positionsDetail).toHaveBeenCalledWith(COMPANY);
    expect(state(withSectors.host)).toMatchObject({ sectors: 1, scopes: 1, ids: ["p1"] });
    await withSectors.unmount();

    vi.clearAllMocks();
    const withoutSectors = await mount(
      <GlobalProvider>
        <GlobalLoader />
        <GlobalProbe />
      </GlobalProvider>,
      makeConfig({ mdms: { sectors: false, principalPositions: "ids" } }),
    );
    await act(async () => undefined);
    expect(mdmsMock.sectors).not.toHaveBeenCalled();
    expect(mdmsMock.positionsDetail).not.toHaveBeenCalled();
    expect(mdmsMock.positionIds).toHaveBeenCalledWith(COMPANY);
    expect(state(withoutSectors.host)).toMatchObject({ sectors: 0, scopes: 0, ids: ["p9"] });
    await withoutSectors.unmount();
  });

  it("requests sectors, projects and companies together and the waiting counts after the companies", async () => {
    const order: string[] = [];
    mdmsMock.sectors.mockImplementation(async () => (order.push("sectors"), []));
    mdmsMock.projects.mockImplementation(async () => (order.push("projects"), []));
    mdmsMock.companies.mockImplementation(async () => (order.push("companies"), [{ id: COMPANY }]));
    const config = makeConfig({ mdms: { sectors: true, principalPositions: "ids" } });
    (config.getWaitingCounts as ReturnType<typeof vi.fn>).mockImplementation(async () => (order.push("counts"), { [COMPANY]: 3 }));
    const m = await mount(
      <GlobalProvider>
        <GlobalLoader />
        <GlobalProbe />
      </GlobalProvider>,
      config,
    );
    await act(async () => undefined);
    expect(order.slice(0, 3).sort()).toEqual(["companies", "projects", "sectors"]);
    expect(order[order.length - 1]).toBe("counts");
    await m.unmount();
  });
});

describe("GlobalCompanySelector", () => {
  it("does not clear the remembered company while the company list is still empty", async () => {
    localStorage.setItem("test_company", COMPANY);
    const m = await mount(
      <GlobalProvider>
        <DocumentListProvider>
          <GlobalCompanySelector />
          <GlobalProbe />
        </DocumentListProvider>
      </GlobalProvider>,
      makeConfig(),
    );
    await act(async () => undefined);
    expect(state(m.host).selected).toBe(COMPANY);
    expect(localStorage.getItem("test_company")).toBe(COMPANY);
    await m.unmount();
  });
});

describe("DocumentTable", () => {
  async function table(config = makeConfig(), path = "/") {
    localStorage.setItem("test_company", COMPANY);
    const tab = config.tabs[0];
    const m = await mount(
      <GlobalProvider>
        <DocumentListProvider>
          <DocumentTable tabKey="related" apiMethod={tab.apiMethod} viewItemComponent={Row} hasStatusFilter />
        </DocumentListProvider>
      </GlobalProvider>,
      config,
      path,
    );
    await act(async () => undefined);
    return { m, tab };
  }

  it("fetches once for the remembered company and renders the rows", async () => {
    const { m, tab } = await table();
    expect(tab.apiMethod).toHaveBeenCalledTimes(1);
    expect(tab.apiMethod).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }), COMPANY);
    expect(m.host.querySelectorAll("[data-row]")).toHaveLength(2);
    await m.unmount();
  });

  it("opens the first document once on a wide frame at '/' when autoOpenFirst is on", async () => {
    const { m, tab } = await table();
    expect(m.path()).toBe("/documents/d1");
    expect(tab.apiMethod).toHaveBeenCalledTimes(1); // the route change does not refetch the list
    await m.unmount();
  });

  it("does not open anything when autoOpenFirst is off or the URL is not '/'", async () => {
    const off = await table(makeConfig({ features: { autoOpenFirst: false, backToShell: false, createShortcut: false } }));
    expect(off.m.path()).toBe("/");
    await off.m.unmount();
    const deepLink = await table(makeConfig(), "/documents/zzz");
    expect(deepLink.m.path()).toBe("/documents/zzz");
    await deepLink.m.unmount();
  });

  it("an empty first result does not count as handled", async () => {
    const config = makeConfig();
    const tab = config.tabs[0];
    (tab.apiMethod as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ page: 1, pageSize: 20, totalCount: 0, totalPages: 0, items: [] });
    const { m } = await table(config);
    expect(m.path()).toBe("/");
    await m.unmount();
  });
});
