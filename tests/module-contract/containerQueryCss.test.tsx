import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import styled from "styled-components";

import { containerMaxWidth, containerMinWidth } from "../../src/module-contract";
import { installDom, mount } from "./helpers";

const Box = styled.div`
  display: grid;
  ${containerMinWidth("medium")} {
    grid-template-columns: 1fr 1fr;
  }
  ${containerMaxWidth("wide")} {
    display: none;
  }
`;

beforeEach(() => installDom());
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("container queries inside styled-components", () => {
  it("nested @container rules are emitted as real @container rules around the component class", () => {
    const { container } = mount(<Box />);
    const cls = [...container.firstElementChild!.classList].find((c) => !c.startsWith("sc-"))!;
    const all = [...document.styleSheets].flatMap((s) => [...s.cssRules]).map((r) => r.cssText).join("\n");
    const compact = all.replace(/\s+/g, "");
    expect(compact).toContain(`@containermodule-root(min-width:672px){.${cls}{grid-template-columns:1fr1fr;}}`);
    expect(compact).toContain(`@containermodule-root(not(min-width:1184px)){.${cls}{display:none;}}`);
  });
});
