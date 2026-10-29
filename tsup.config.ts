import { defineConfig } from "tsup";

// `npm run dev` (watch for local development): no .d.ts (slow, and the apps' bundlers do not need them) and no clean.
const dev = process.env.SHARED_UI_DEV === "1";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "shared-users": "src/shared-users/index.ts",
    platform: "src/platform/index.ts",
    "module-contract": "src/module-contract/index.ts",
    "dev-shell": "src/dev-shell/index.ts",
    theme: "src/theme/index.ts",
    mdms: "src/mdms/index.ts",
    "platform-kit": "src/platform-kit/index.ts",
    signalr: "src/signalr/index.ts",
    utils: "src/text-utils/index.ts",
    ui: "src/ui/index.ts",
    "document-kit": "src/document-kit/index.ts",
    editor: "src/editor/index.ts",
    "file-viewer": "src/file-viewer/index.ts",
  },
  format: ["esm", "cjs"],
  dts: !dev,
  splitting: true,
  sourcemap: true,
  clean: !dev,
  treeshake: true,
  // The entry-local stylesheet (editor attachment widget) is injected by the JS; third-party css stays an external import.
  injectStyle: true,
  external: [
    "react",
    "react/jsx-runtime",
    "react-dom",
    "react-router-dom",
    "antd",
    "@ant-design/icons",
    "@ant-design/colors",
    "styled-components",
    "ckeditor5",
    "@ckeditor/ckeditor5-react",
    "@react-pdf-viewer/core",
    "@react-pdf-viewer/toolbar",
    "@react-pdf-viewer/zoom",
    "@react-pdf-viewer/rotate",
    "axios",
    "dayjs",
    "jwt-decode",
    "@microsoft/signalr",
    // Light entries import these by package name, so the app's bundler resolves them to the same instance
    // the app (and, for ./platform, the host) uses; they must never be inlined into a shared chunk.
    "@ptht365/shared-ui/platform",
    "@ptht365/shared-ui/module-contract",
    "@ptht365/shared-ui/shared-users",
    // Heavy entries are provided by the shell: the kit loads them lazily by package name and never inlines them.
    "@ptht365/shared-ui/editor",
    "@ptht365/shared-ui/file-viewer",
  ],
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      ".png": "dataurl",
      ".jpg": "dataurl",
      ".jpeg": "dataurl",
      ".svg": "dataurl",
    };
  },
  // CSS files từ third-party (pdf viewer, ckeditor) được giữ nguyên dưới dạng import
  // consuming app sẽ handle chúng
  noExternal: [],
});
