// Heavy entry (shared through the shell, decision D1): CKEditor 5 based rich-text editors and viewers.
// ckeditor5, @ckeditor/ckeditor5-react and @ptht365/shared-ui/shared-users are the host-shared singletons.
export { default as CustomView } from "./CustomView";
export { default as MinimalEditor } from "./MinimalEditor";
export type { MinimalEditorRef, UserMentionFeedItem } from "./MinimalEditor";
export { default as ReferenceLinksEditor } from "./ReferenceLinksEditor";
export { default as ReferenceLinksView } from "./ReferenceLinksView";
export { default as FileAttachmentPlugin } from "./plugins/FileAttachmentPlugin";
export type { AttachmentData } from "./plugins/FileAttachmentPlugin";
export { default as PasteAutoLink } from "./pasteAutoLink";
export { attachSafeLinkOpening, openSafeLink } from "./safeLinkOpening";
export { REFERENCE_LINKS_LINK_CONFIG, REFERENCE_LINKS_PLUGINS, REFERENCE_LINKS_TOOLBAR } from "./referenceLinksConfig";
