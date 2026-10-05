import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConfigProvider, type ThemeConfig } from "antd";

import {
  CONTAINER_BREAKPOINTS,
  type ContainerBreakpoints,
  type ContainerTier,
  DEFAULT_FALLBACK_TIER,
} from "./breakpoints";
import { ModuleRootContext, type ModuleRootContextValue } from "./context";
import { FeedbackHost } from "./FeedbackHost";
import { type ModuleFeedback, ModuleFeedbackContext } from "./feedbackContext";
import { ATTR_ROOT, createContainerStore } from "./containerStore";
import { COMPAT_DEFAULT_FONT_FAMILY, RootElement } from "./moduleRootStyles";

export interface ModuleRootProps {
  children: ReactNode;
  /** antd theme of the module. When given, wrapped with `inherit: false`. Omit to keep an existing ConfigProvider below. */
  theme?: ThemeConfig;
  /** Font of the module root. Default (reset 'compat'): 'sans-serif'. */
  fontFamily?: string;
  /** Override the container breakpoints (min width of each tier). Default CONTAINER_BREAKPOINTS. */
  breakpoints?: Partial<ContainerBreakpoints>;
  /** Tier used when the width cannot be measured (width 0, no layout). Default 'wide'. */
  fallbackTier?: ContainerTier;
  /** Scoped CSS reset. 'compat' reproduces what modules receive from the shell today. Default 'compat'. */
  reset?: "compat" | "none";
  /** Provide an antd <App> so useModuleFeedback() works and toasts mount inside the root. Default true. */
  feedback?: boolean;
  className?: string;
  style?: CSSProperties;
  rootRef?: Ref<HTMLDivElement>;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * Outermost element of a module (contract section 2). Adds ONE DOM element: it contains
 * `position: fixed` descendants (`contain: layout paint`), measures its own width with
 * ResizeObserver, scopes the reset, and routes popups and feedback into itself.
 */
export function ModuleRoot({
  children,
  theme,
  fontFamily = COMPAT_DEFAULT_FONT_FAMILY,
  breakpoints,
  fallbackTier = DEFAULT_FALLBACK_TIER,
  reset = "compat",
  feedback = true,
  className,
  style,
  rootRef,
}: ModuleRootProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [feedbackApi, setFeedbackApi] = useState<ModuleFeedback | null>(null);
  const medium = breakpoints?.medium ?? CONTAINER_BREAKPOINTS.medium;
  const wide = breakpoints?.wide ?? CONTAINER_BREAKPOINTS.wide;

  const store = useMemo(
    () => createContainerStore({ breakpoints: { medium, wide }, fallbackTier }),
    [medium, wide, fallbackTier],
  );

  const setElement = useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      assignRef(rootRef, node);
    },
    [rootRef],
  );

  // Measure before the first paint, then render the children (no wrong-layout first frame).
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    store.attach(element);
    setReady(true);
    return () => store.detach();
  }, [store]);

  const getRootElement = useCallback(() => elementRef.current, []);
  const getContainer = useCallback(() => elementRef.current ?? document.body, []);
  const context = useMemo<ModuleRootContextValue>(() => ({ store, getRootElement }), [store, getRootElement]);

  const configTheme = useMemo(() => (theme ? { ...theme, inherit: false } : undefined), [theme]);
  // Everything below renders only after the first measurement (`ready`). Children also wait for the feedback API,
  // which FeedbackHost publishes in a layout effect, before the first paint.
  const showChildren = !feedback || feedbackApi !== null;

  return (
    <RootElement
      ref={setElement}
      className={className}
      style={style}
      $fontFamily={fontFamily}
      $reset={reset === "compat"}
      {...{ [ATTR_ROOT]: "" }}
    >
      <ModuleRootContext.Provider value={context}>
        {ready ? (
          <ConfigProvider theme={configTheme} getPopupContainer={getContainer}>
            {feedback ? <FeedbackHost theme={theme} getContainer={getContainer} onReady={setFeedbackApi} /> : null}
            {showChildren ? (
              <ModuleFeedbackContext.Provider value={feedback ? feedbackApi : null}>{children}</ModuleFeedbackContext.Provider>
            ) : null}
          </ConfigProvider>
        ) : null}
      </ModuleRootContext.Provider>
    </RootElement>
  );
}
