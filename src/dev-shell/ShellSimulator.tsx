import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

import {
  MODULE_FRAME_DECLARATIONS,
  SIM_HEADER_HEIGHT,
  SIM_MIN_WIDTH,
  SIM_SIDER_WIDTHS,
  SIM_WIDTH_PRESETS,
  SIM_Z_INDEX,
  type SimSider,
} from "./frameDeclarations";
import {
  parseSimulatorParams,
  siderWarning,
  type SimWidth,
  simFrameWidth,
} from "./simulatorParams";

export interface ShellSimulatorProps {
  children: ReactNode;
  /** Initial simulated window width in px or 'auto'. Default 1280. */
  initialWidth?: number | "auto";
  /** Initial Sider width. Default 0 (the shell has no Sider on module routes). */
  initialSider?: 0 | 80 | 240;
  /** Mock header height. Default 56 (SHELL_LAYOUT.moduleHeaderHeight). */
  headerHeight?: number;
}

const HEADER_BUTTONS = ["Home", "Apps", "Bell", "Account"] as const;
const SIM_BACKGROUND = "#d9d9d9";
const CHROME_BACKGROUND = "#f5f5f5";
const WARNING_COLOR = "#ad4e00";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  font: 13px/1.4 sans-serif;
`;
const Toolbar = styled.div`
  color: #222;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 6px 12px;
  background: ${CHROME_BACKGROUND};
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;
`;
const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ToolButton = styled.button<{ $active: boolean }>`
  padding: 2px 8px;
  border: 1px solid ${({ $active }) => ($active ? "#1677ff" : "#bbb")};
  background: ${({ $active }) => ($active ? "#e6f4ff" : "#fff")};
  border-radius: 4px;
  cursor: pointer;
`;
const WidthInput = styled.input`
  width: 64px;
  padding: 2px 4px;
`;
const Warning = styled.span`
  color: ${WARNING_COLOR};
`;
const Viewport = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  background: ${SIM_BACKGROUND};
`;
const Device = styled.div`
  display: flex;
  height: 100%;
  background: #fff;
`;
const MockSider = styled.div`
  flex-shrink: 0;
  height: 100%;
  background: #001529;
  z-index: ${SIM_Z_INDEX.sider};
`;
const Column = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;
const MockHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  z-index: ${SIM_Z_INDEX.header};
`;
const FrameHost = styled.div`
  flex: 1;
  min-height: 0;
`;
const Frame = styled.div`
  ${Object.entries(MODULE_FRAME_DECLARATIONS)
    .map(([k, v]) => `${k}:${v};`)
    .join("")}
`;

/**
 * Development-only fake shell. It constrains the module FRAME (header + Sider + window width),
 * not `window`: code that reads `window.innerWidth` or uses `@media` still sees the real browser
 * window, which is the difference the simulator is meant to expose.
 */
export function ShellSimulator({
  children,
  initialWidth,
  initialSider,
  headerHeight = SIM_HEADER_HEIGHT,
}: ShellSimulatorProps) {
  const [state, setState] = useState(() =>
    parseSimulatorParams(typeof window === "undefined" ? "" : window.location.search, {
      width: initialWidth,
      sider: initialSider,
    }),
  );
  const [custom, setCustom] = useState(() => (typeof state.width === "number" ? String(state.width) : ""));
  const [clicks, setClicks] = useState<Record<string, number>>({});
  const frameRef = useRef<HTMLDivElement | null>(null);
  const { enabled, width, sider } = state;

  // data-frame-width = the frame as laid out (floored like ModuleRoot), written straight to the DOM.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!enabled || !frame) return undefined;
    const write = (w: number) => frame.setAttribute("data-frame-width", String(Math.floor(w)));
    write(frame.getBoundingClientRect().width);
    if (typeof ResizeObserver !== "function") return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) write(entry.contentRect.width);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [enabled, width, sider]);

  if (!enabled) return <>{children}</>;

  const setWidth = (next: SimWidth) => setState((s) => ({ ...s, width: next }));
  const setSider = (next: SimSider) => setState((s) => ({ ...s, sider: next }));
  const numericWidth = typeof width === "number" ? width : undefined;
  const warning = numericWidth === undefined ? null : siderWarning(numericWidth, sider);
  const readout =
    numericWidth === undefined
      ? `window = auto, sider = ${sider}`
      : `frame = ${numericWidth} - ${sider} = ${simFrameWidth(numericWidth, sider)}`;

  return (
    <Root data-testid="sim-root">
      <Toolbar data-testid="sim-toolbar">
        <Group>
          <span>Window</span>
          {SIM_WIDTH_PRESETS.map((w) => (
            <ToolButton key={w} type="button" $active={width === w} onClick={() => { setWidth(w); setCustom(String(w)); }}>
              {w}
            </ToolButton>
          ))}
          <ToolButton type="button" $active={width === "auto"} onClick={() => setWidth("auto")}>auto</ToolButton>
          <WidthInput
            aria-label="Free window width in px"
            data-testid="sim-width-input"
            inputMode="numeric"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              const n = Number(e.target.value);
              if (/^\d+$/.test(e.target.value) && n >= SIM_MIN_WIDTH) setWidth(n);
            }}
          />
        </Group>
        <Group>
          <span title="0 = module route (real shell). 80/240 simulate an embedding next to a Sider.">Sider</span>
          {SIM_SIDER_WIDTHS.map((s) => (
            <ToolButton key={s} type="button" $active={sider === s} onClick={() => setSider(s)}>
              {s}
            </ToolButton>
          ))}
        </Group>
        <strong data-testid="sim-readout">{readout}</strong>
        {warning ? <Warning role="alert" data-testid="sim-sider-note">{warning}</Warning> : null}
      </Toolbar>
      <Viewport>
        <Device data-testid="sim-device" style={{ width: width === "auto" ? "100%" : Math.max(width, SIM_MIN_WIDTH) }}>
          {sider > 0 ? <MockSider data-testid="sim-sider" style={{ width: sider }} /> : null}
          <Column>
            <MockHeader style={{ height: headerHeight }} data-testid="sim-header">
              {HEADER_BUTTONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  data-testid="sim-header-button"
                  data-clicks={clicks[name] ?? 0}
                  onClick={() => setClicks((c) => ({ ...c, [name]: (c[name] ?? 0) + 1 }))}
                >
                  {name}
                </button>
              ))}
            </MockHeader>
            <FrameHost>
              <Frame ref={frameRef} data-testid="sim-frame">
                {children}
              </Frame>
            </FrameHost>
          </Column>
        </Device>
      </Viewport>
    </Root>
  );
}
