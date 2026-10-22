const INVISIBLE_CHARS = /[ ​﻿]/g;
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

/**
 * Mirrors the backend rule (BR-76, AC4 US-03): HTML whose visible text is empty → null, otherwise the
 * trimmed original HTML. DOMParser does not execute scripts.
 */
export function normalizeRichText(html?: string | null): string | null {
  if (!html) return null;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body.textContent ?? "").replace(INVISIBLE_CHARS, "").trim();
  return text ? html.trim() : null;
}

/**
 * Only ABSOLUTE http/https/mailto URLs may be opened (AC8 US-03, review H1/M1). Parsed without a base URL
 * so relative hrefs ("foo", "/x") and fragments ("#", what CKEditor renders for sanitized javascript:/data:
 * links) are rejected. The WHATWG URL parser strips tab/newline, so "java\tscript:" is caught as well.
 */
export function isSafeHref(href?: string | null): boolean {
  const raw = href?.trim();
  if (!raw || raw.startsWith("#")) return false;
  try {
    return SAFE_PROTOCOLS.includes(new URL(raw).protocol);
  } catch {
    return false;
  }
}

const richTextHelper = { normalizeRichText, isSafeHref };

export default richTextHelper;
