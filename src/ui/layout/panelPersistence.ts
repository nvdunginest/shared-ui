// Remembers whether a side panel was collapsed, per browser. Storage can be blocked
// (private mode, cleared site data), so every access is guarded and falls back to the default.
import { getUiConfig } from "../config";

// The prefix is per app (set with configureUi) so each app keeps the panel state its users already have.
const prefix = () => getUiConfig().panelStoragePrefix;

export const readPanelFlag = (key: string): boolean | null => {
  try {
    const value = localStorage.getItem(prefix() + key);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
};

export const writePanelFlag = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(prefix() + key, value ? "1" : "0");
  } catch {
    // ignore: the choice just is not remembered
  }
};
