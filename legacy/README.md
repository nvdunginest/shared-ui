# legacy/

Code, tài liệu và công cụ không còn dùng, được chuyển ra khỏi cây chính nhưng giữ nguyên đường dẫn tương đối (và lịch sử git bằng `git mv`).
Thư mục này không được build, test hay publish: `tsconfig.json` chỉ include `src`, `tsup.config.ts` có entry tường minh, `vitest.config.ts` chỉ include `tests/**`, `package.json#files` là `dist`, `.npmignore` loại `legacy/`.
Danh mục và lý do: `docs/STATUS.md`, mục "Legacy index".
