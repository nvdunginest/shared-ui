import { act, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@ptht365/shared-ui/module-contract", async (orig) => ({
  ...(await orig<object>()),
  useModuleFeedback: () => ({ message: { error: vi.fn(), success: vi.fn(), warning: vi.fn() }, modal: {}, notification: {} }),
}));
vi.mock("../../src/signalr", () => ({
  useSignalRContext: () => ({ onDocumentChanged: () => () => undefined, onReconnection: () => () => undefined }),
}));

import { AppContext, defaultStore as appDefault, initialState as appInitial } from "../../src/platform-kit";
import {
  ApproveAction,
  CancelAction,
  DocumentContext,
  DocumentProvider,
  GlobalContext,
  extractApiErrorMessage,
  getCommentMode,
  isSecretaryOfDocument,
  parseActorSnapshot,
  useDocumentContext,
  type DocumentSectionsConfig,
} from "../../src/document-kit";
import CommentAction from "../../src/document-kit/detail/sections/discussion/CommentAction";
import { configureUi } from "../../src/ui";
import { initialState as docInitial, defaultStore as docDefault } from "../../src/document-kit/context/document/type";
import { initialState as globalInitial, defaultStore as globalDefault } from "../../src/document-kit/context/global/type";
import { makeConfig, mount } from "./helpers";

const COMPANY = "c1";
const USER = "u1";
const POSITION = "p1";
const TIER = "t1";

function world(status: number, over: { userId?: string } = {}) {
  const document = {
    id: "d1", companyId: COMPANY, status, title: "T", processorPositionId: POSITION, processorUserId: USER,
    creatorUserId: USER, creatorPositionId: POSITION, tierId: TIER, firstTransferredAt: null,
    activities: [], attachments: [], followers: [],
  };
  const departments = [{ id: "dep", companyId: COMPANY, positions: [{ id: POSITION, userId: over.userId ?? USER, tierId: TIER }] }];
  return (node: ReactNode) => (
    <AppContext.Provider value={{ ...appDefault, state: { ...appInitial, userId: USER as never } }}>
      <GlobalContext.Provider value={{ ...globalDefault, globalState: { ...globalInitial, departments: departments as never } }}>
        <DocumentContext.Provider value={{ ...docDefault, state: { ...docInitial, document: document as never } }}>{node}</DocumentContext.Provider>
      </GlobalContext.Provider>
    </AppContext.Provider>
  );
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("status rules and wording come from the app's config", () => {
  it("ApproveAction appears only in the statuses the config calls 'processing', with the app's verb", async () => {
    const config = makeConfig();
    const yes = await mount(world(1)(<ApproveAction />), config);
    expect(yes.host.querySelector("button")?.textContent).toContain("Phê duyệt");
    await yes.unmount();

    const no = await mount(world(2)(<ApproveAction />), config);
    expect(no.host.querySelector("button")).toBeNull();
    await no.unmount();

    // another app: a "viewed" status (6) also counts, and the verb is "chỉ đạo"
    const rept = makeConfig();
    rept.detail.statuses.processing = [1, 6];
    rept.detail.wording.approveVerb = "chỉ đạo";
    const viewed = await mount(world(6)(<ApproveAction />), rept);
    expect(viewed.host.querySelector("button")?.textContent).toContain("Chỉ đạo");
    await viewed.unmount();
  });

  it("ApproveAction needs the user to hold the processor position at the document's tier", async () => {
    const other = await mount(world(1, { userId: "someone-else" })(<ApproveAction />), makeConfig());
    expect(other.host.querySelector("button")).toBeNull();
    await other.unmount();
  });

  it("CancelAction uses its own 'cancelable' list", async () => {
    const config = makeConfig();
    config.detail.statuses.cancelable = [5];
    const m = await mount(world(1)(<CancelAction />), config);
    expect(m.host.querySelector("button")).toBeNull(); // 1 is processing but not cancelable
    await m.unmount();
    const d = await mount(world(5)(<CancelAction />), config);
    expect(d.host.querySelector("button")?.textContent).toContain("Hủy");
    await d.unmount();
  });
});

describe("DocumentProvider", () => {
  function Probe() {
    const { state, fetchDocument } = useDocumentContext();
    return (
      <button data-testid="go" onClick={() => fetchDocument("d1" as never)}>
        {state.document ? "loaded" : (state.fetchError ?? "empty")}
      </button>
    );
  }
  const click = (host: HTMLElement) => act(async () => host.querySelector<HTMLElement>("[data-testid=go]")!.click());

  it("loads through the configured api and dismisses the reminder", async () => {
    const config = makeConfig();
    const m = await mount(
      <DocumentProvider>
        <Probe />
      </DocumentProvider>,
      config,
    );
    await click(m.host);
    expect(config.detail.api.getById).toHaveBeenCalledWith("d1");
    expect(config.detail.api.dismissRemind).toHaveBeenCalledWith("d1");
    expect(m.host.textContent).toContain("loaded");
    await m.unmount();
  });
});

describe("helpers", () => {
  it("extractApiErrorMessage reads the backend message and falls back otherwise", () => {
    const axiosLike = Object.assign(new Error("x"), { isAxiosError: true, response: { data: { message: "Không đủ quyền" } } });
    expect(extractApiErrorMessage(axiosLike, "fallback")).toBe("Không đủ quyền");
    expect(extractApiErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });

  it("isSecretaryOfDocument: all-sector scopes match, sector scopes need the document's sector", () => {
    const doc = { processorPositionId: "p1" as never, sectorId: "s1" as never };
    expect(isSecretaryOfDocument([{ positionId: "p1", allSectors: true, sectorIds: [] }] as never, doc)).toBe(true);
    expect(isSecretaryOfDocument([{ positionId: "p1", allSectors: false, sectorIds: ["s1"] }] as never, doc)).toBe(true);
    expect(isSecretaryOfDocument([{ positionId: "p1", allSectors: false, sectorIds: ["s2"] }] as never, doc)).toBe(false);
    expect(isSecretaryOfDocument([{ positionId: "p1", allSectors: false, sectorIds: ["s1"] }] as never, { processorPositionId: "p1" as never })).toBe(false);
    expect(isSecretaryOfDocument([{ positionId: "p2", allSectors: true, sectorIds: [] }] as never, doc)).toBe(false);
  });

  it("parseActorSnapshot tolerates garbage", () => {
    expect(parseActorSnapshot('{"Fullname":"A"}')).toEqual({ Fullname: "A" });
    expect(parseActorSnapshot("not json")).toEqual({});
  });
});

describe("comment rule: open, private after the end, locked when cancelled", () => {
  const sections = (over: Partial<DocumentSectionsConfig> = {}): DocumentSectionsConfig => ({
    api: { getById: vi.fn(), dismissRemind: vi.fn() } as never,
    // 1 = processing, 2 = approved/archived (finished), 9 = cancelled
    statuses: { notEnded: [1], canComment: [1, 2], finished: [2] },
    activities: [],
    ...over,
  });
  const doc = (status?: number) => ({ id: "d1", status, activities: [], attachments: [] }) as never;

  it("getCommentMode: processing is open, finished is private only, anything else is locked", () => {
    expect(getCommentMode(sections(), doc(1))).toBe("open");
    expect(getCommentMode(sections(), doc(2))).toBe("private");
    expect(getCommentMode(sections(), doc(9))).toBe("locked");
    expect(getCommentMode(sections(), doc(undefined))).toBe("locked");
  });

  it("getCommentMode: a commentMode function replaces the status lists (documents without a status)", () => {
    expect(getCommentMode(sections({ commentMode: () => "open" }), doc(undefined))).toBe("open");
  });

  it("CommentAction shows the notice with the app's document name and no editor when locked", async () => {
    configureUi({ documentName: "văn bản" });
    const wrap = world(9);
    const { host } = await mount(wrap(<CommentAction />), makeConfig());
    expect(host.textContent).toContain("Văn bản đã bị hủy hoặc đã đóng, không thể bình luận.");
  });
});
