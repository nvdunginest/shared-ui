import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { FileViewer } from "../../src/file-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function render(node: React.ReactElement) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(node));
  return { host, done: () => act(async () => root.unmount()).then(() => host.remove()) };
}

describe("FileViewer", () => {
  it("says the format is not supported for unknown extensions", async () => {
    const { host, done } = await render(<FileViewer extension="zip" uri="/files/a" />);
    expect(host.textContent).toContain("Không hỗ trợ xem trước định dạng zip");
    await done();
  });

  it("uses the Office viewer (an iframe on the file URI) for docx, xlsx and pptx, with or without a dot", async () => {
    for (const ext of ["docx", ".XLSX", "pptx"]) {
      const { host, done } = await render(<FileViewer extension={ext} uri="https://api/files/abc" />);
      const frame = host.querySelector("iframe");
      expect(frame, ext).not.toBeNull();
      expect(decodeURIComponent(frame!.getAttribute("src") ?? "")).toContain("https://api/files/abc");
      await done();
    }
  });
});
