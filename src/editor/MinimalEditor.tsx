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
import "./plugins/attachment-widget.css";

import { getAvatarColor } from "../ui/components/avatarColor";

import FileAttachmentPlugin from "./plugins";
import { attachSafeLinkOpening } from "./safeLinkOpening";

type Props = {
  initialData: string;
  disable?: boolean;
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
  { initialData, disable = false }: Props,
  ref
) {
  const editorRef = useRef<BalloonEditor>();
  const detachLinkOpeningRef = useRef<(() => void) | null>(null);
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
                    return `${name[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`;
                  })();

                  const container = document.createElement("div");
                  container.style.cssText =
                    "display:flex;flex-direction:row;align-items:center;gap:8px;padding:2px 0;width:100%;box-sizing:border-box;overflow:hidden";

                  const avatar = document.createElement("div");
                  avatar.textContent = shortName;
                  avatar.style.cssText =
                    `flex-shrink:0;width:32px;height:32px;border-radius:50%;background:${getAvatarColor(item.jobTitle)};color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center`;

                  const content = document.createElement("div");
                  content.style.cssText =
                    "display:flex;flex-direction:column;flex-grow:1;overflow:hidden;min-width:0";

                  const main = document.createElement("span");
                  main.textContent = `${item.displayName} (${item.mail})`;
                  main.style.cssText =
                    "font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

                  const footer = document.createElement("span");
                  footer.textContent = `${item.department ?? "N/A"} (${item.jobTitle ?? "N/A"})`;
                  footer.style.cssText =
                    "font-size:12px;color:inherit;opacity:0.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

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
        }}
        onAfterDestroy={() => {
          detachLinkOpeningRef.current?.();
          detachLinkOpeningRef.current = null;
        }}
      />
    </WrapperStl>
  );
});

export default MinimalEditor;

// The mention panel is attached to <body>, outside WrapperStl, so it needs global styles.
// The selected/hovered row uses a light background so the dark text stays readable.
const MentionPanelStyle = createGlobalStyle`
  .ck.ck-mentions {
    padding: 6px !important;
  }

  .ck.ck-mentions .ck-list__item {
    margin-bottom: 2px;
  }

  .ck.ck-mentions .ck-button {
    padding: 6px 10px !important;
    border-radius: 6px !important;
  }

  .ck.ck-mentions .ck-button.ck-on,
  .ck.ck-mentions .ck-button:hover,
  .ck.ck-mentions .ck-button.ck-on:hover {
    background: #e6f0ff !important;
  }

  .ck.ck-mentions .ck-button.ck-on,
  .ck.ck-mentions .ck-button.ck-on * {
    color: #1f1f1f !important;
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
