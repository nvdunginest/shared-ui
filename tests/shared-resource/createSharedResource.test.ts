import type { AxiosInstance } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSharedResource } from "../../src/shared-resource/createSharedResource";

type Item = { id: number };

function fakeClient(responses: Array<Item[] | Error>) {
  const get = vi.fn(async () => {
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return { data: next ?? [] };
  });
  return { client: { get } as unknown as AxiosInstance, get };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("createSharedResource", () => {
  it("rejects when no client is configured", async () => {
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    await expect(api.fetch()).rejects.toThrow("no httpClient configured");
  });

  it("fetches the default endpoint and stores the result", async () => {
    const { client, get } = fakeClient([[{ id: 1 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client });

    await expect(api.fetch()).resolves.toEqual([{ id: 1 }]);
    expect(get).toHaveBeenCalledWith("/items");
    expect(api.getSnapshot().data).toEqual([{ id: 1 }]);
    expect(api.getSnapshot().fetchedAt).not.toBeNull();
  });

  it("uses the endpoint given to configure() and lets a call override it", async () => {
    const { client, get } = fakeClient([[], []]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client, endpoint: "/other" });

    await api.fetch();
    await api.fetch({ endpoint: "/third", force: true });
    expect(get).toHaveBeenNthCalledWith(1, "/other");
    expect(get).toHaveBeenNthCalledWith(2, "/third");
  });

  it("shares one in-flight request between concurrent callers", async () => {
    const { client, get } = fakeClient([[{ id: 1 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client });

    const [a, b] = await Promise.all([api.fetch(), api.fetch()]);
    expect(get).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it("serves the cache until staleTime has passed", async () => {
    vi.useFakeTimers();
    const { client, get } = fakeClient([[{ id: 1 }], [{ id: 2 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items", staleTimeMs: 1000 });
    api.configure({ httpClient: client });

    await api.fetch();
    vi.advanceTimersByTime(999);
    await expect(api.fetch()).resolves.toEqual([{ id: 1 }]);
    expect(get).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2);
    await expect(api.fetch()).resolves.toEqual([{ id: 2 }]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("force bypasses the cache", async () => {
    const { client, get } = fakeClient([[{ id: 1 }], [{ id: 2 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client });

    await api.fetch();
    await expect(api.fetch({ force: true })).resolves.toEqual([{ id: 2 }]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("keeps the previous data when a refresh fails, and a later call retries", async () => {
    const { client, get } = fakeClient([[{ id: 1 }], new Error("boom"), [{ id: 3 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client });

    await api.fetch();
    await expect(api.fetch({ force: true })).rejects.toThrow("boom");
    expect(api.getSnapshot().data).toEqual([{ id: 1 }]);

    await expect(api.fetch({ force: true })).resolves.toEqual([{ id: 3 }]);
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("clearCache empties the store so the next fetch hits the network", async () => {
    const { client, get } = fakeClient([[{ id: 1 }], [{ id: 2 }]]);
    const api = createSharedResource<Item>({ defaultEndpoint: "/items" });
    api.configure({ httpClient: client });

    await api.fetch();
    api.clearCache();
    expect(api.getSnapshot()).toEqual({ data: [], fetchedAt: null });
    await expect(api.fetch()).resolves.toEqual([{ id: 2 }]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("keeps independent stores per createSharedResource() call", async () => {
    const one = fakeClient([[{ id: 1 }]]);
    const two = fakeClient([[{ id: 2 }]]);
    const a = createSharedResource<Item>({ defaultEndpoint: "/a" });
    const b = createSharedResource<Item>({ defaultEndpoint: "/b" });
    a.configure({ httpClient: one.client });
    b.configure({ httpClient: two.client });

    await Promise.all([a.fetch(), b.fetch()]);
    expect(a.getSnapshot().data).toEqual([{ id: 1 }]);
    expect(b.getSnapshot().data).toEqual([{ id: 2 }]);
  });
});
