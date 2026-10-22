import { isSafeHref } from "../text-utils/richText";
import type { Editor } from "ckeditor5";
import { keyCodes } from "ckeditor5";

const NEW_TAB_TARGET = "_blank";
const NEW_TAB_FEATURES = "noopener,noreferrer";
const LINK_COMMAND = "link";

/** Opens the URL in a new tab only if it is an absolute http/https/mailto URL; otherwise does nothing. */
export function openSafeLink(href?: string | null): void {
  if (isSafeHref(href)) {
    window.open(href!.trim(), NEW_TAB_TARGET, NEW_TAB_FEATURES);
  }
}

/**
 * Replaces every CKEditor Link "open" path with a safe one (review H1/M1):
 * - Alt+Enter on a link: CKEditor opens the RAW model href (javascript: included) — intercepted at the
 *   highest priority, the raw href of the link command is opened only if safe.
 * - Click (read-only editor) / Ctrl|Cmd+click (editable editor): intercepted in the capture phase before
 *   CKEditor's own handler; uses getAttribute("href") (never the resolved anchor.href), so "#"/relative
 *   hrefs are ignored.
 * Plain clicks in an editable editor are left untouched (caret placement).
 * Returns a detach function — call it from onAfterDestroy.
 */
export function attachSafeLinkOpening(editor: Editor): () => void {
  const viewDocument = editor.editing.view.document;

  const handleKeydown = (
    evt: { stop: () => void },
    data: { keyCode: number; altKey: boolean; preventDefault: () => void },
  ) => {
    // Same condition as CKEditor's own handler (any Alt+Enter, extra modifiers included)
    const isAltEnter = data.keyCode === keyCodes.enter && data.altKey;
    if (!isAltEnter) return;

    const linkCommand = editor.commands.get(LINK_COMMAND);
    const rawHref = linkCommand?.value as string | undefined;
    if (!rawHref) return;

    evt.stop();
    data.preventDefault();
    openSafeLink(rawHref);
  };
  viewDocument.on("keydown", handleKeydown, { priority: "highest" });

  const editableElement = editor.ui.getEditableElement();
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor) return;

    const isOpenGesture = editor.isReadOnly || event.ctrlKey || event.metaKey;
    if (!isOpenGesture) return;

    event.preventDefault();
    event.stopPropagation();
    openSafeLink(anchor.getAttribute("href"));
  };
  editableElement?.addEventListener("click", handleClick, true);

  return () => {
    viewDocument.off("keydown", handleKeydown);
    editableElement?.removeEventListener("click", handleClick, true);
  };
}
