import { defineConfig } from "tsup";

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
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
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
