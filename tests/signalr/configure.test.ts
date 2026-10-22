import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@ptht365/shared-ui/platform", () => ({ axiosBuilder: { getAccessToken: vi.fn(async () => "token") } }));

afterEach(() => {
  vi.resetModules();
});

describe("document hub connector", () => {
  it("refuses to create the connection before configureDocumentHub()", async () => {
    const { default: getConnector } = await import("../../src/signalr/signalr.connector");
    expect(() => getConnector()).toThrow("configureDocumentHub");
  });

  it("creates one disconnected singleton once the hub URL is configured", async () => {
    const { default: getConnector, configureDocumentHub } = await import("../../src/signalr/signalr.connector");
    configureDocumentHub({ hubUrl: "https://api/hubs/test/document-hub" });
    const a = getConnector();
    expect(a).toBe(getConnector());
    expect(a.isConnected()).toBe(false);
  });

  it("importing the actions module does not create the connection (the URL is set after import)", async () => {
    await expect(import("../../src/signalr/actions")).resolves.toBeDefined();
  });
});
