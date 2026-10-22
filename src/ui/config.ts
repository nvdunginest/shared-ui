export type UiConfig = {
  /** Lower-case name of the app's document ("tờ trình", "báo cáo", "công tác"), used in labels. */
  documentName: string;
  /** localStorage key prefix of the remembered panel state ("appr.panel."): keep it stable per app. */
  panelStoragePrefix: string;
};

let config: UiConfig = { documentName: "tài liệu", panelStoragePrefix: "panel." };

/** Called once at app start, next to configureMdms / configureDocumentHub. */
export function configureUi(options: Partial<UiConfig>): void {
  config = { ...config, ...options };
}

export function getUiConfig(): UiConfig {
  return config;
}
