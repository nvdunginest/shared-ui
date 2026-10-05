import styled, { css } from "styled-components";

import { MODULE_ROOT_CONTAINER_NAME } from "./breakpoints";
import { COMPAT_DEFAULT_FONT_FAMILY, COMPAT_RESET_CSS, COMPAT_ROOT_TEXT } from "./resetCompat";

/** Normative root declarations of contract 2.2 (kept as data so tests can assert them). */
export const ROOT_DECLARATIONS: Readonly<Record<string, string>> = Object.freeze({
  position: "relative",
  width: "100%",
  height: "100%",
  "min-width": "0",
  "min-height": "0",
  margin: "0",
  padding: "0",
  overflow: "hidden",
  "box-sizing": "border-box",
  isolation: "isolate",
  contain: "layout paint",
  "container-type": "inline-size",
  "container-name": MODULE_ROOT_CONTAINER_NAME,
});

/** Overlay size rules of contract 5.1, as {selector below root, declaration}. */
export const OVERLAY_RULES: ReadonlyArray<readonly [string, string]> = [
  [".ant-modal", "max-width:calc(100cqw - 16px)"],
  [".ant-drawer-content-wrapper", "max-width:100cqw"],
];

const toCss = (decl: Readonly<Record<string, string>>) =>
  Object.entries(decl)
    .map(([k, v]) => `${k}:${v};`)
    .join("");

const overlayCss = OVERLAY_RULES.map(([sel, body]) => `& ${sel}{${body}}`).join("");

interface RootProps {
  $fontFamily: string;
  $reset: boolean;
}

export const RootElement = styled.div<RootProps>`
  ${toCss(ROOT_DECLARATIONS)}
  ${({ $reset, $fontFamily }) =>
    $reset
      ? css`
          font-family: ${$fontFamily};
          ${toCss(COMPAT_ROOT_TEXT)}
          ${COMPAT_RESET_CSS}
        `
      : ""}
  ${overlayCss}
`;

export { COMPAT_DEFAULT_FONT_FAMILY };
