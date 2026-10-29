// Styles of the attachment chip. Injected from JS: a stylesheet imported by the editor entry is dropped by the
// library build (the chip then shows unstyled), so the plugin adds this <style> once when it is first used.

const STYLE_ID = "ck-attachment-widget-style";

const CSS = `/* File Attachment Widget Styles */

.ck-attachment-widget {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* minus the 2px side margins: a box as wide as the line wraps below CKEditor's inline filler, leaving a blank line above */
  max-width: calc(100% - 4px);
  box-sizing: border-box;
  vertical-align: middle;
  padding: 4px 8px;
  margin: 0 2px;
  background-color: #fef3eb;
  border: 1px solid #fcdcb5;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  user-select: none;
}

.ck-attachment-widget.ck-widget {
  outline: none;
}

.ck-attachment-widget.ck-widget.ck-widget_selected {
  background-color: #fde5d1;
  border-color: #c05621;
  box-shadow: 0 0 0 2px #fcdcb5;
}

.ck-attachment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ck-attachment-icon::before {
  content: "📎";
  font-size: 14px;
}

.ck-attachment-info {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  color: #c05621;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ck-attachment-widget:hover {
  background-color: #fde5d1;
  border-color: #c05621;
}
`;

export function ensureAttachmentWidgetStyle(): void {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
