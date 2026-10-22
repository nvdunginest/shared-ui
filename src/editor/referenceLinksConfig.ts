import {
  AutoLink,
  Bold,
  Essentials,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Underline,
  Undo,
} from "ckeditor5";

import PasteAutoLink from "./pasteAutoLink";

/**
 * Restricted plugin set shared by ReferenceLinksEditor / ReferenceLinksView (BR-76, AC8 US-03).
 * No images / base64 upload / file attachment / mention — stored HTML stays text + links, and anything
 * not representable by these plugins (script, iframe, on* attributes, style...) is dropped when
 * CKEditor rebuilds the view from its model.
 */
export const REFERENCE_LINKS_PLUGINS = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  AutoLink,
  PasteAutoLink,
  List,
  PasteFromOffice,
  Undo,
];

export const REFERENCE_LINKS_TOOLBAR = [
  "bold",
  "italic",
  "underline",
  "|",
  "link",
  "|",
  "bulletedList",
  "numberedList",
];

export const REFERENCE_LINKS_LINK_CONFIG = {
  addTargetToExternalLinks: true,
  defaultProtocol: "https://",
};
