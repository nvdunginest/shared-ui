import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "shared-users": "src/shared-users/index.ts",
    "shared-departments": "src/shared-departments/index.ts",
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
