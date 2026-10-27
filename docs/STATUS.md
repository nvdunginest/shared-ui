# @ptht365/shared-ui — trạng thái hiện tại

Cập nhật: 2026-10-27. Phiên bản package: 1.3.0. Tài liệu này là tài liệu duy nhất trong `docs/`; lịch sử nằm ở `legacy/` (xem mục cuối).

## 1. Mục đích

Thư viện TypeScript dùng chung cho Super App Soffice (shell `vpi-sys-soff`) và các mini app tài liệu
(`vpi-adm-appr-final`, `vpi-adm-rept`, `vpi-adm-idoc`, `vpi-adm-odoc`, `vpi-adm-trip`): design tokens, layout,
CKEditor, file viewer, `module-contract` (ModuleRoot, breakpoints theo container), master data client (mdms),
SignalR, và "document kit" (phần danh sách + chi tiết của luồng tờ trình/báo cáo). Mục tiêu là giảm code
trùng giữa các app (kế hoạch gốc: `legacy/docs/consolidation-plan.md`).

## 2. Cách dùng (consume)

- Mỗi consumer khai báo `"@ptht365/shared-ui": "file:../../libs/shared-ui"` trong `package.json`. Không publish lên npm.
- `dist/` bị gitignore; được tạo bằng `tsup`. Dockerfile của từng app có stage `shared-ui-build`: copy
  `package.json`, `package-lock.json`, `tsconfig.json`, `tsup.config.ts`, `src/` từ build context `shared-ui`
  (`docker buildx build --build-context shared-ui=../../libs/shared-ui .`), chạy `npm ci && npm run build`, rồi copy kết quả sang
  `/w/libs/shared-ui` để `file:` resolve được. Vì vậy `package.json`, `package-lock.json`, `tsconfig.json`, `tsup.config.ts`, `src/` phải giữ nguyên bố cục; `legacy/`, `docs/`, `tests/`, `scripts/` không vào image.
- Tất cả dependency nặng là peer dependency và được externalize (react, antd, styled-components, ckeditor5, axios, dayjs,
  jwt-decode, @microsoft/signalr, react-pdf-viewer...). App/shell cung cấp.

## 3. Entry (subpath exports)

Mỗi entry build ra `dist/<tên>.{js,cjs,d.ts}`. Nguồn trong `src/<thư mục>/index.ts`.

| Entry | Nguồn | Nội dung | Ai dùng |
|---|---|---|---|
| `.` | `src/index.ts` | Barrel cũ: AppContext, controllers, `axiosBuilder`, components (TitleBar, UserInfo...), editor cũ, layout, utils. Đóng băng (xem mục 5) | shell (khai báo MF shared, tải lazy); trip (1 import `removeVietnameseTones`); các app ngoài họ vpi (cgm-*, eme-*) |
| `./platform` | `src/platform` | Chỉ `axiosBuilder`, `getBaseUrl`. Singleton nhẹ, shell tải eager | shell, 5 mini app |
| `./shared-users` | `src/shared-users` | `useSharedUsers()`, `configureSharedUsersClient` (dựng trên `shared-resource`) | shell, 5 mini app |
| `./module-contract` | `src/module-contract` | `ModuleRoot`, breakpoints/container store, `ModuleLoadingOverlay`, feedback (`useModuleFeedback`), reset CSS | shell, 5 mini app |
| `./dev-shell` | `src/dev-shell` | `ShellSimulator`, `MODULE_FRAME_DECLARATIONS` (chạy app độc lập khi dev) | 5 mini app; test parity của shell đọc file nguồn |
| `./theme` | `src/theme` | tokens, `StyleProvider`, mixins, `popoverWidth` | 5 mini app |
| `./utils` | `src/text-utils` | Hàm text/số/ngày thuần | 5 mini app |
| `./ui` | `src/ui` | TitleBar, UserInfo, SelectUser, MasterPage, AppLayout, Loading, Navigator, hooks điều hướng; `configureUi` | 5 mini app |
| `./platform-kit` | `src/platform-kit` | AppContext + AppLoader, controllers (app/files/users/userRoles), helpers, models | 5 mini app, test shell |
| `./mdms` | `src/mdms` | models + controllers dta-mdms, `configureMdms` | 5 mini app |
| `./signalr` | `src/signalr` | `SignalRProvider`, connector, `configureDocumentHub` | 5 mini app |
| `./document-kit` | `src/document-kit` | `DocumentKitProvider`, danh sách (ListHost, OutlookShell, DocumentTable...), chi tiết (actions, discussion, history, attachments) | appr, rept, trip (nhiều), idoc/odoc (ít) |
| `./editor` | `src/editor` | CKEditor 5: MinimalEditor, CustomView, ReferenceLinks*, plugin đính kèm | shell (shared), 5 mini app |
| `./file-viewer` | `src/file-viewer` | FileViewer, PdfViewer, OfficeViewer | shell (shared), 5 mini app |

Thư mục `src/shared-resource` (engine `createSharedResource`) không phải entry; nó nằm dưới `shared-users`.

## 4. Quy ước singleton / Module Federation

- Entry nhẹ (`ui`, `theme`, `mdms`, `platform-kit`, `signalr`, `document-kit`, `utils`) được bundle vào từng app. Chúng lấy
  singleton bằng tên package `@ptht365/shared-ui/platform`, `/module-contract`, `/shared-users` (khai báo `external` trong
  `tsup.config.ts`, alias ở `vitest.config.ts` và `tsconfig.json#paths`), không bao giờ bằng đường dẫn tương đối.
- Entry nặng `./editor`, `./file-viewer` do shell cung cấp (`rsbuild.config.ts` của shell, `shared`, singleton), app build với
  `import: false`; kit tải lười theo tên package.
- `./document-kit` sở hữu React context (`GlobalContext`, `DocumentListContext`) và đọc context của `platform-kit` và `signalr`, nên phải
  bundle cùng app, không share qua shell (quyết định D1 đã sửa).
- Cấu hình lúc khởi động (module-level, gọi trước khi render): `axiosBuilder.configure({ baseUrl })`, `configureUi({ documentName, panelStoragePrefix, ... })`,
  `configureMdms(...)`, `configureDocumentHub({ hubUrl })`, `configureSharedUsersClient(...)`; document kit nhận một config typed qua
  `<DocumentKitProvider config>` (tabs, statuses, wording, API).
- Thư viện không được import alias của app (`@presentation/...`); mọi thứ đi qua props, context hoặc config.
- `scripts/check-entry-isolation.mjs`: entry `light` không được chạm CKEditor/PDF viewer (kể cả qua chunk chung), entry `strict` (module-contract, dev-shell) không có import tương đối.

## 5. Build và test

```bash
npm ci
npm run build            # tsup: ESM + CJS + .d.ts, sourcemap, splitting; ảnh png/jpg/svg inline dataurl
npm run type-check       # tsc --noEmit (chỉ include src/)
npm test                 # vitest run (jsdom), tests/**/*.test.{ts,tsx}
npm run check            # type-check + test + build + check:exports + check:isolation
npm run check:duplication [-- --files | --sot | --json]   # báo cáo trùng lặp giữa các app (chỉ báo cáo)
```

`scripts/check-exports.mjs` đóng băng bề mặt export của `.`, `./platform`, `./shared-users` (baseline `scripts/exports-baseline.txt`) và hash
byte của `src/index.ts` + `src/layout/*`: không sửa các file này để "fix" lỗi; code mới đi vào entry mới. Thêm entry = sửa
`src/<entry>/index.ts`, `tsup.config.ts`, `package.json#exports`, bảng `POLICY` trong `check-entry-isolation.mjs`.

Dev dependency `vitest ^5`, `jsdom ^30` giống shell (jsdom cũ làm 2 test của shell fail do serialise `min()`).

## 6. Trạng thái test (2026-10-27)

- `npm test`: 21 file, 163 test, tất cả pass. Phủ: document-kit (list + detail), editor, file-viewer, mdms, module-contract (+ tester), platform-kit, shared-resource, signalr, theme, ui, utils.
- `npm run build`: 0 lỗi; `type-check`, `check:exports`, `check:isolation`: OK.
- Chưa có test cho: barrel `.` (layout/components cũ), `platform` controllers cũ, `dev-shell` ngoài ShellSimulator.

## 7. Còn tồn đọng / cần theo dõi

- Barrel `.` (`src/index.ts`, `src/components`, `src/layout`, `src/platform/controllers`, `src/utils.ts`) gần như không còn dùng bởi họ vpi (chỉ trip import `removeVietnameseTones`, shell còn khai báo MF), nhưng bị đóng băng và các app cũ (cgm-*, eme-*) có thể còn dùng; chưa gỡ. `src/components/Editor` và `src/components/FileViewer` trùng với `./editor` và `./file-viewer`; `layout/TeamsAppVersion` liên quan Teams đã gỡ.
- Antd không tree-shake theo entry: mỗi app bundle khoảng 580-605 kB sau khi gộp document-kit; antd là một chunk lớn dùng chung qua MF singleton. Chưa tối ưu.
- document-kit idoc/odoc mới dùng một phần (họ B chưa căn chỉnh theo appr, Phase 6 của kế hoạch gốc).
- Comment cũ trong `src/shared-users/index.ts` còn nhắc `INTEGRATION.md` (nay ở `legacy/`); không sửa vì file nằm trong entry đóng băng.
- `.claude/settings.local.json` còn đường dẫn cũ `/Users/nvdung/Repos/ptht365/shared-ui`.
- `.codegraph/` (chỉ mục công cụ) đã bỏ khỏi git index và thêm vào `.gitignore`.

## 8. Legacy index (`legacy/`, cùng đường dẫn tương đối)

| Đường dẫn | Lý do |
|---|---|
| `legacy/docs/consolidation-plan.md` | Kế hoạch hợp nhất 5 app (Phase 0-6), lịch sử |
| `legacy/docs/source-of-truth.md` | Bảng sinh tự động từ `check:duplication --sot`, đã cũ |
| `legacy/INTEGRATION.md` | Hướng dẫn tích hợp qua npm publish, nay dùng `file:` |
| `legacy/scripts/mutation-check.py` | Công cụ mutation cũ, không có trong package.json |
| `legacy/src/document-kit/layout/documentListTabs.tsx` | Không ai import (idoc có bản cục bộ riêng) |
