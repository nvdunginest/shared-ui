import { type ReactNode, useLayoutEffect } from "react";
import { App, ConfigProvider, type ThemeConfig } from "antd";

import type { ModuleFeedback } from "./feedbackContext";

interface FeedbackHostProps {
  theme?: ThemeConfig;
  getContainer: () => HTMLElement;
  onReady: (api: ModuleFeedback) => void;
}

function Bridge({ onReady }: { onReady: (api: ModuleFeedback) => void }): ReactNode {
  const api = App.useApp();
  // Publish before the first paint; antd keeps `api` referentially stable.
  useLayoutEffect(() => onReady(api), [api, onReady]);
  return null;
}

/**
 * Hosts the antd `<App>` that backs useModuleFeedback(). It sits in its OWN, isolated ConfigProvider
 * (`inherit: false`): toasts, notifications and confirms get the default antd theme (or the `theme`
 * given to ModuleRoot), never the theme of the shell around the module. The module's children are NOT
 * rendered inside it, so the module's own theme handling is untouched.
 */
export function FeedbackHost({ theme, getContainer, onReady }: FeedbackHostProps) {
  const containerConfig = { getContainer };
  return (
    <ConfigProvider theme={{ ...theme, inherit: false }} getPopupContainer={getContainer}>
      <App component={false} message={containerConfig} notification={containerConfig}>
        <Bridge onReady={onReady} />
      </App>
    </ConfigProvider>
  );
}
