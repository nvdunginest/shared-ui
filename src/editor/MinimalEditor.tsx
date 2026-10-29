import { forwardRef, useImperativeHandle, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ISharedUser, useSharedUsers } from "@ptht365/shared-ui/shared-users";
import {
  Alignment,
  AutoLink,
  BalloonEditor,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  Font,
  Heading,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  Mention,
  MentionFeedObjectItem,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";
import { UUID } from "crypto";
import styled, { createGlobalStyle } from "styled-components";

import "ckeditor5/ckeditor5.css";

import { colors } from "../theme";
import { getAvatarColor } from "../ui/components/avatarColor";

import FileAttachmentPlugin from "./plugins";
import { attachSafeLinkOpening } from "./safeLinkOpening";

type Props = {
  initialData: string;
  disable?: boolean;
  /** Called when an attached file in the editor is clicked; return true when it was handled. */
  onAttachmentClick?: (attachment: { fileName: string; fileType: string; fileData: string }) => boolean;
};

export type MinimalEditorRef = {
  getData: () => string | undefined;
  setData: (data: string) => void;
  getAttachments: () => ReturnType<FileAttachmentPlugin["getAttachments"]> | undefined;
  openAttachmentDialog: (maxFileSize?: number) => void;
  triggerAttachmentDialog: (maxFileSize?: number) => void;
};

export type UserMentionFeedItem = MentionFeedObjectItem & {
  objectId: UUID;
  displayName: string;
  mail: string;
  jobTitle: string | null;
  department: string | null;
};

const normalizeSearchText = (text: string): string =>
  (text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const MinimalEditor = forwardRef<MinimalEditorRef, Props>(function CustomEditorForwardRef(
  { initialData, disable = false, onAttachmentClick }: Props,
  ref
) {
  const editorRef = useRef<BalloonEditor>();
  const detachLinkOpeningRef = useRef<(() => void) | null>(null);
  const detachAttachmentClickRef = useRef<(() => void) | null>(null);
  const onAttachmentClickRef = useRef(onAttachmentClick);
  onAttachmentClickRef.current = onAttachmentClick;
  const fileAttachmentPluginRef =
    useRef<FileAttachmentPlugin | undefined>(undefined);

  const { users } = useSharedUsers();

  useImperativeHandle(ref, () => {
    return {
      getData() {
        return editorRef.current?.getData();
      },
      setData(data: string) {
        editorRef.current?.setData(data);
      },
      getAttachments() {
        return fileAttachmentPluginRef.current?.getAttachments();
      },
      openAttachmentDialog(maxFileSize?: number) {
        fileAttachmentPluginRef.current?.triggerAttachmentDialog(maxFileSize);
      },
      triggerAttachmentDialog(maxFileSize?: number) {
        fileAttachmentPluginRef.current?.triggerAttachmentDialog(maxFileSize);
      },
    };
  }, []);

  return (
    <WrapperStl>
      <MentionPanelStyle />
      <CKEditor
        editor={BalloonEditor}
        disabled={disable}
        config={{
          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "heading",
              "|",
              "fontfamily",
              "fontsize",
              "fontColor",
              "fontBackgroundColor",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "subscript",
              "superscript",
              "code",
              "|",
              "link",
              "uploadImage",
              "blockQuote",
              "codeBlock",
              "|",
              "alignment",
              "|",
              "bulletedList",
              "numberedList",
              "todoList",
              "outdent",
              "indent",
              "|",
              "insertTable",
              "|",
              "fileAttachment",
            ],
            // shouldNotGroupWhenFull: true,
          },
          image: {
            toolbar: [
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "toggleImageCaption",
              "imageTextAlternative",
              "|",
              "linkImage",
            ],
            insert: {
              type: "auto",
            },
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
          list: {
            properties: {
              styles: true,
              startIndex: true,
            },
          },
          balloonToolbar: [
            "bold",
            "italic",
            "|",
            "link",
            "insertImage",
            "|",
            "bulletedList",
            "numberedList",
          ],
          plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Paragraph,
            PasteFromOffice,
            Undo,
            Image,
            ImageUpload,
            ImageInsert,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,
            Heading,
            Font,
            Superscript,
            Subscript,
            Strikethrough,
            Code,
            Link,
            BlockQuote,
            CodeBlock,
            Alignment,
            List,
            AutoLink,
            TodoList,
            Indent,
            Table,
            TableToolbar,
            Base64UploadAdapter,
            Mention,
            FileAttachmentPlugin,
          ],
          mention: {
            feeds: [
              {
                marker: "@",
                // CKEditor only matches the query against `id` (the mail), so filter here
                // to also match display name — accent-insensitive for Vietnamese names.
                feed: (queryText: string): UserMentionFeedItem[] => {
                  const query = normalizeSearchText(queryText);
                  return users
                    .filter(
                      (user: ISharedUser) =>
                        normalizeSearchText(user.displayName).includes(query) ||
                        normalizeSearchText(user.mail).includes(query),
                    )
                    .slice(0, 10)
                    .map(
                      (user: ISharedUser): UserMentionFeedItem => ({
                        id: `@${user.mail}`,
                        text: user.displayName,
                        objectId: user.id as UUID,
                        displayName: user.displayName,
                        mail: user.mail,
                        jobTitle: user.jobTitle,
                        department: user.department,
                      }),
                    );
                },
                minimumCharacters: 1,
                itemRenderer: (feedItem: MentionFeedObjectItem) => {
                  // CKEditor types the renderer argument as the generic feed item; ours always carries the user fields.
                  const item = feedItem as UserMentionFeedItem;
                  const shortName = (() => {
                    const name = item.displayName.trim();
                    const parts = name.split(" ");
                    return `${name[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
                  })();

                  const container = document.createElement("div");
                  container.style.cssText =
                    "display:flex;flex-direction:row;align-items:center;gap:8px;padding:2px 0;width:100%;box-sizing:border-box;overflow:hidden";

                  const avatar = document.createElement("div");
                  avatar.textContent = shortName;
                  avatar.style.cssText =
                    `flex-shrink:0;width:32px;height:32px;border-radius:50%;background:${getAvatarColor(item.jobTitle)};color:#fff !important;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center`;

                  const content = document.createElement("div");
                  content.style.cssText =
                    "display:flex;flex-direction:column;flex-grow:1;overflow:hidden;min-width:0";

                  const main = document.createElement("span");
                  main.textContent = item.displayName;
                  main.style.cssText =
                    "font-weight:600;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

                  const footer = document.createElement("span");
                  // "Người" kind: name + e-mail, no directory title (see ui/components/person/personText.ts).
                  footer.textContent = item.mail || "N/A";
                  footer.style.cssText =
                    "font-size:14px;color:rgba(0,0,0,0.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

                  content.appendChild(main);
                  content.appendChild(footer);
                  container.appendChild(avatar);
                  container.appendChild(content);
                  return container;
                },
              },
            ],
          },

          initialData: initialData,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
          fileAttachmentPluginRef.current = editor.plugins.get(
            "FileAttachment"
          ) as FileAttachmentPlugin;
          // Alt+Enter / Ctrl|Cmd+click must never open javascript:/data: links (review H1)
          detachLinkOpeningRef.current = attachSafeLinkOpening(editor);

          const editable = editor.ui.getEditableElement();
          if (editable) {
            const handleClick = (event: MouseEvent) => {
              const el = (event.target as HTMLElement | null)?.closest(".ck-attachment-widget") as HTMLElement | null;
              const fileData = el?.getAttribute("data-file-data");
              if (!el || !fileData) return;
              onAttachmentClickRef.current?.({
                fileName: el.getAttribute("data-file-name") || "attachment",
                fileType: el.getAttribute("data-file-type") || "",
                fileData,
              });
            };
            editable.addEventListener("click", handleClick);
            detachAttachmentClickRef.current = () => editable.removeEventListener("click", handleClick);
          }
        }}
        onAfterDestroy={() => {
          detachLinkOpeningRef.current?.();
          detachLinkOpeningRef.current = null;
          detachAttachmentClickRef.current?.();
          detachAttachmentClickRef.current = null;
        }}
      />
    </WrapperStl>
  );
});

export default MinimalEditor;

// The mention panel is attached to <body>, outside WrapperStl, so it needs global styles.
// It mimics the antd Select dropdown of SelectUser (same panel, row padding, hover and selected colors)
// so picking someone looks the same in the follower box and in a comment.
const MentionPanelStyle = createGlobalStyle`
  .ck.ck-mentions {
    padding: 4px !important;
    background: #fff !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
  }

  .ck.ck-mentions .ck-list__item {
    margin-bottom: 0;
  }

  .ck.ck-mentions .ck-button {
    padding: 5px 12px !important;
    border-radius: 4px !important;
    color: rgba(0, 0, 0, 0.88) !important;
  }

  .ck.ck-mentions .ck-button:hover {
    background: rgba(0, 0, 0, 0.04) !important;
  }

  .ck.ck-mentions .ck-button.ck-on,
  .ck.ck-mentions .ck-button.ck-on:hover {
    background: ${colors.primaryBg} !important;
  }

  .ck.ck-mentions .ck-button.ck-on,
  .ck.ck-mentions .ck-button.ck-on * {
    color: rgba(0, 0, 0, 0.88) !important;
  }
`;

const WrapperStl = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  .ck-editor {
    height: 100% !important;
  }

  .ck-editor__main {
    height: calc(100%) !important;
  }

  .ck-editor__editable {
    height: 100% !important;
  }

  span.mention {
    font-weight: 700;
    color: #003a8c;
    background-color: inherit;
  }

  p {
    margin: 8px !important;
  }

  .ck.ck-editor__editable.ck-focused:not(.ck- editor_nested-editable) {
    border: none !important;
    box-shadow: none !important;
  }
`;
