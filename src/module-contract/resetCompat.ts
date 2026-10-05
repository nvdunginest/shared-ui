/**
 * Scoped reset, preset "compat" (contract 2.3). Reproduces what a module receives today from the
 * two global sheets of the shell (antd 5 `reset.css`, then the shell's Meyer `reset.css` with
 * margin/padding/font commented out) plus the shell scrollbar rule, but every selector is wrapped
 * in `:where(&)` (specificity 0), so antd and module classes always win, like the global reset.
 * Page-level rules (html, body, @-ms-viewport, text-size-adjust) are deliberately left out.
 * Source order is kept: antd first, Meyer second, so Meyer wins ties exactly as it does globally.
 */

/** Declared on the root so text outside antd keeps the values the module sees in the shell today. */
export const COMPAT_ROOT_TEXT = Object.freeze({
  // Measured in the shell: the text colour a module inherits there is the browser default black.
  color: "#000",
  "font-size": "16px",
  "line-height": "1",
  "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
});
export const COMPAT_DEFAULT_FONT_FAMILY = "sans-serif";

type Rule = readonly [selectors: readonly string[], body: string];

const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace";

const ANTD_RESET: readonly Rule[] = [
  [["*", "*::before", "*::after"], "box-sizing:border-box"],
  [["[tabindex='-1']:focus"], "outline:none"],
  [["hr"], "box-sizing:content-box;height:0;overflow:visible"],
  [["h1", "h2", "h3", "h4", "h5", "h6"], "margin-top:0;margin-bottom:.5em;font-weight:500"],
  [["p"], "margin-top:0;margin-bottom:1em"],
  [["abbr[title]", "abbr[data-original-title]"], "text-decoration:underline dotted;border-bottom:0;cursor:help"],
  [["address"], "margin-bottom:1em;font-style:normal;line-height:inherit"],
  [["input[type='text']", "input[type='password']", "input[type='number']", "textarea"], "-webkit-appearance:none"],
  [["ol", "ul", "dl"], "margin-top:0;margin-bottom:1em"],
  [["ol ol", "ul ul", "ol ul", "ul ol"], "margin-bottom:0"],
  [["dt"], "font-weight:500"],
  [["dd"], "margin-bottom:.5em;margin-left:0"],
  [["blockquote"], "margin:0 0 1em"],
  [["dfn"], "font-style:italic"],
  [["b", "strong"], "font-weight:bolder"],
  [["small"], "font-size:80%"],
  [["sub", "sup"], "position:relative;font-size:75%;line-height:0;vertical-align:baseline"],
  [["sub"], "bottom:-.25em"],
  [["sup"], "top:-.5em"],
  [["pre", "code", "kbd", "samp"], `font-size:1em;font-family:${MONO}`],
  [["pre"], "margin-top:0;margin-bottom:1em;overflow:auto"],
  [["figure"], "margin:0 0 1em"],
  [["img"], "vertical-align:middle;border-style:none"],
  [["a", "area", "button", "[role='button']", "input:not([type='range'])", "label", "select", "summary", "textarea"], "touch-action:manipulation"],
  [["table"], "border-collapse:collapse"],
  [["caption"], "padding-top:.75em;padding-bottom:.3em;text-align:left;caption-side:bottom"],
  [["input", "button", "select", "optgroup", "textarea"], "margin:0;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit"],
  [["button", "input"], "overflow:visible"],
  [["button", "select"], "text-transform:none"],
  [["button", "[type='button']", "[type='reset']", "[type='submit']"], "-webkit-appearance:button"],
  [["button::-moz-focus-inner", "[type='button']::-moz-focus-inner", "[type='reset']::-moz-focus-inner", "[type='submit']::-moz-focus-inner"], "padding:0;border-style:none"],
  [["input[type='radio']", "input[type='checkbox']"], "box-sizing:border-box;padding:0"],
  [["input[type='date']", "input[type='time']", "input[type='datetime-local']", "input[type='month']"], "-webkit-appearance:listbox"],
  [["textarea"], "overflow:auto;resize:vertical"],
  [["fieldset"], "min-width:0;margin:0;padding:0;border:0"],
  [["legend"], "display:block;width:100%;max-width:100%;margin-bottom:.5em;padding:0;color:inherit;font-size:1.5em;line-height:inherit;white-space:normal"],
  [["progress"], "vertical-align:baseline"],
  [["[type='number']::-webkit-inner-spin-button", "[type='number']::-webkit-outer-spin-button"], "height:auto"],
  [["[type='search']"], "outline-offset:-2px;-webkit-appearance:none"],
  [["[type='search']::-webkit-search-cancel-button", "[type='search']::-webkit-search-decoration"], "-webkit-appearance:none"],
  [["::-webkit-file-upload-button"], "font:inherit;-webkit-appearance:button"],
  [["output"], "display:inline-block"],
  [["summary"], "display:list-item"],
  [["template"], "display:none"],
  [["[hidden]"], "display:none !important"],
  [["mark"], "padding:.2em;background-color:#feffe6"],
];

const MEYER_TAGS = [
  "div", "span", "applet", "object", "iframe", "h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "pre",
  "a", "abbr", "acronym", "address", "big", "cite", "code", "del", "dfn", "em", "img", "ins", "kbd", "q", "s",
  "samp", "small", "strike", "strong", "sub", "sup", "tt", "var", "b", "u", "i", "center", "dl", "dt", "dd",
  "ol", "ul", "li", "fieldset", "form", "label", "legend", "table", "caption", "tbody", "tfoot", "thead", "tr",
  "th", "td", "article", "aside", "canvas", "details", "embed", "figure", "figcaption", "footer", "header",
  "hgroup", "menu", "nav", "output", "ruby", "section", "summary", "time", "mark", "audio", "video",
] as const;

const MEYER_RESET: readonly Rule[] = [
  [MEYER_TAGS, "border:0;font-size:100%;vertical-align:baseline"],
  [["article", "aside", "details", "figcaption", "figure", "footer", "header", "hgroup", "menu", "nav", "section"], "display:block"],
  [["ol", "ul"], "list-style:none"],
  [["blockquote", "q"], "quotes:none"],
  [["blockquote::before", "blockquote::after", "q::before", "q::after"], "content:none"],
  [["table"], "border-collapse:collapse;border-spacing:0"],
];

const SCROLLBAR: readonly Rule[] = [
  [["*::-webkit-scrollbar"], "width:8px;height:8px"],
  [["*::-webkit-scrollbar-track"], "border-radius:10px"],
  [["*::-webkit-scrollbar-thumb"], "background:#88888865;border-radius:10px"],
  [["*::-webkit-scrollbar-thumb:hover"], "background:#888"],
];

const SCOPE = ":where(&)";

function render(rules: readonly Rule[]): string {
  return rules
    .map(([selectors, body]) => `${selectors.map((s) => `${SCOPE} ${s}`).join(",")}{${body}}`)
    .join("");
}

/** CSS text (styled-components `&` = root class) of the whole compat preset below the root. */
export const COMPAT_RESET_CSS: string = render(ANTD_RESET) + render(MEYER_RESET) + render(SCROLLBAR);
