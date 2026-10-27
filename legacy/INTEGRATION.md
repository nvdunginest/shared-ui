# Hướng dẫn tích hợp @ptht365/shared-ui

## 1. Cài đặt

```bash
npm install @ptht365/shared-ui
```

## 2. Cấu hình Module Federation (rsbuild.config.ts)

Thêm `@ptht365/shared-ui` vào `shared` với `singleton: true` để tránh duplicate instances (đặc biệt quan trọng vì library chứa React Context).

```ts
// rsbuild.config.ts
pluginModuleFederation({
  name: "vpi_adm_appr",
  filename: "remoteEntry.js",
  exposes: { "./module": "./frontend/App.tsx" },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "react-router-dom": { singleton: true },
    antd: { singleton: true },
    "styled-components": { singleton: true },
    "@ptht365/shared-ui": { singleton: true, requiredVersion: false },
    ckeditor5: { singleton: true, requiredVersion: false },
    "@ckeditor/ckeditor5-react": { singleton: true, requiredVersion: false },
  },
})
```

> ⚠️ **Quan trọng**: `@ptht365/shared-ui` PHẢI là singleton vì library export React Context (`AppContext`). Nếu không, mỗi micro-app sẽ có instance Context riêng và `useAppContext()` sẽ trả về state rỗng.

## 3. Khởi tạo trong App.tsx

```tsx
// frontend/App.tsx
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import {
  AppProvider,
  AppLoader,
  Loading,
  AppLayout,
  axiosBuilder,
} from "@ptht365/shared-ui";

import appLogo from "./images/app_logo.png";
import pkg from "../package.json";
import { sideMenu } from "./navigation/sideMenu";

// ✅ Gọi configure TRƯỚC khi render bất kỳ thứ gì
axiosBuilder.configure({
  baseUrl: `${import.meta.env.PUBLIC_APP_API_HOSTNAME}${import.meta.env.PUBLIC_APP_BASE_URI}`,
});

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLoader
          appName="Tên ứng dụng"
          sideMenu={sideMenu}
          logoUrl={appLogo}
        />
        <Loading />
        <AppLayout appVersion={pkg.version}>
          {/* Routes */}
        </AppLayout>
      </AppProvider>
    </BrowserRouter>
  );
}
```

## 4. Migration từ code cũ

### Thay thế imports

| Cũ (local path) | Mới (@ptht365/shared-ui) |
|---|---|
| `@platform/contexts/AppContext` | `@ptht365/shared-ui` |
| `@platform/models/IUser` | `@ptht365/shared-ui` |
| `@platform/models/IUserRole` | `@ptht365/shared-ui` |
| `@platform/helpers/userRoles.helper` | `@ptht365/shared-ui` |
| `@platform/helpers/files.helper` | `@ptht365/shared-ui` |
| `@platform/controllers/...` | `@ptht365/shared-ui` |
| `@presentation/components/AclCheck` | `@ptht365/shared-ui` |
| `@presentation/components/BackButton` | `@ptht365/shared-ui` |
| `@presentation/components/Section` | `@ptht365/shared-ui` |
| `@presentation/components/UserInfo` | `@ptht365/shared-ui` |
| `@presentation/components/Editor/...` | `@ptht365/shared-ui` |
| `@presentation/layout/MasterPage` | `@ptht365/shared-ui` |
| `@presentation/layout/AppLayout` | `@ptht365/shared-ui` |
| `@presentation/utils` | `@ptht365/shared-ui` |

### TeamsAppVersion (breaking change)

```tsx
// Cũ — tự đọc package.json
<TeamsAppVersion />

// Mới — truyền version qua prop
import pkg from "../package.json";
<TeamsAppVersion version={pkg.version} />
```

### AppLayout (breaking change)

```tsx
// Cũ
<AppLayout>{children}</AppLayout>

// Mới — thêm appVersion prop
import pkg from "../package.json";
<AppLayout appVersion={pkg.version}>{children}</AppLayout>
```

### Logo ứng dụng (breaking change)

Logo không còn được bundle trong `AppInfo` mà được truyền qua `AppLoader`:

```tsx
import appLogo from "./images/app_logo.png";

<AppLoader
  appName="Tên App"
  sideMenu={sideMenu}
  logoUrl={appLogo}   // ← thêm dòng này
/>
```

### axiosBuilder (breaking change)

```tsx
// Cũ — tự động đọc import.meta.env trong axios.instance.ts
// Không cần config gì

// Mới — phải gọi configure() trước khi app mount
import { axiosBuilder } from "@ptht365/shared-ui";

axiosBuilder.configure({
  baseUrl: `${import.meta.env.PUBLIC_APP_API_HOSTNAME}${import.meta.env.PUBLIC_APP_BASE_URI}`,
});
```

## 4b. Deep-import shared-resource entry points (shared-users)

Ngoài barrel chính (`@ptht365/shared-ui`), package còn có entry point **riêng, nhẹ**
(không kéo theo antd/ckeditor5/AppContext) để đọc dữ liệu do shell fetch và cache dùng chung:
`@ptht365/shared-ui/shared-users`.

**Mỗi entry point kiểu này PHẢI được khai báo thêm 1 dòng `singleton: true` riêng** trong MF
`shared` config — deep import không tự động ăn theo entry gốc `@ptht365/shared-ui`:

```ts
// rsbuild.config.ts
shared: {
  "@ptht365/shared-ui": { singleton: true, requiredVersion: false },
  "@ptht365/shared-ui/shared-users": { singleton: true, requiredVersion: false },
}
```

**Ai cấu hình client, ai chỉ đọc?**
- **Shell app**: gọi `configureSharedUsersClient({ httpClient })` một lần lúc khởi động để đăng
  ký axios instance + endpoint mặc định, và tự gọi thêm `fetchSharedUsers()` eager (vì shell
  cần data này ngay cho logic riêng của nó).
- **Mini app**: KHÔNG cần gọi `configure...()` khi chỉ chạy trong shell — chỉ cần gọi hook:

```tsx
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";

const { users } = useSharedUsers();
```

> Pattern này (`createSharedResource`, xem CLAUDE.md) chỉ đáng dùng khi dữ liệu tốn kém/được
> nhiều mini app dùng lại thật sự — dữ liệu rẻ, ít khi refetch thì cứ fetch riêng theo controller
> của từng mini app như trước, không cần bọc qua shared-resource.

## 5. Cấu hình alias (rsbuild.config.ts)

Có thể giữ nguyên alias để không phải đổi toàn bộ import trong codebase:

```ts
resolve: {
  alias: {
    // Redirect @platform và @presentation về shared-ui
    "@platform/contexts/AppContext": "@ptht365/shared-ui",
    "@platform/models/IUser": "@ptht365/shared-ui",
    "@platform/models/IUserRole": "@ptht365/shared-ui",
    "@platform/models/IBaseEntity": "@ptht365/shared-ui",
    "@platform/models/IDrive": "@ptht365/shared-ui",
    "@platform/helpers/userRoles.helper": "@ptht365/shared-ui",
    "@platform/helpers/files.helper": "@ptht365/shared-ui",
    "@platform/controllers/app.controller": "@ptht365/shared-ui",
    "@platform/controllers/users.controller": "@ptht365/shared-ui",
    "@platform/controllers/userRoles.controller": "@ptht365/shared-ui",
    "@platform/controllers/files.controller": "@ptht365/shared-ui",
    // Giữ nguyên các alias internal khác
    "@application": path.resolve(__dirname, "frontend/application"),
    "@shared": path.resolve(__dirname, "frontend/shared"),
  },
},
```

> ⚠️ Cách này giúp migration dần dần, nhưng import theo dạng named-export có thể bị lỗi. Khuyến nghị thay thế import trực tiếp.

## 6. Publish lên npm

```bash
# Login npm (nếu dùng npm registry)
npm login

# Hoặc login vào private registry (GitHub Packages, Verdaccio, etc.)
npm login --registry=https://your-registry.com

# Build và publish
npm run build
npm publish
```

### Setup GitHub Packages (khuyến nghị cho team nội bộ)

```bash
# Thêm vào ~/.npmrc
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@ptht365:registry=https://npm.pkg.github.com
```

```json
// package.json — thay đổi publishConfig
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```
