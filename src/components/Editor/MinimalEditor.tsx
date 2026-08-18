import { forwardRef, useImperativeHandle, useRef } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
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
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  TodoList,
  Undo,
} from "ckeditor5";
import { UUID } from "crypto";
import styled from "styled-components";

import "ckeditor5/ckeditor5.css";

import { useAppContext } from "../../platform/contexts/AppContext";
import IUser from "../../platform/models/IUser";

type Props = {
  initialData: string;
  disable?: boolean;
};

export type UserMentionFeedItem = MentionFeedObjectItem & {
  objectId: UUID;
  displayName: string;
  mail: string;
  jobTitle: string | null;
  department: string | null;
};

const MinimalEditor = forwardRef(function MinimalEditorForwardRef(
  { initialData, disable = false }: Props,
  ref
) {
  const editorRef = useRef<BalloonEditor>();
  const { users } = useAppContext().state;

  useImperativeHandle(ref, () => ({
    getData() {
      return editorRef.current?.getData();
    },
    setData(data: string) {
      editorRef.current?.setData(data);
    },
  }), []);

  return (
    <WrapperStl>
      <CKEditor
        editor={BalloonEditor}
        disabled={disable}
        config={{
          toolbar: {
            items: [
              "undo", "redo", "|",
              "heading", "|",
              "fontfamily", "fontsize", "fontColor", "fontBackgroundColor", "|",
              "bold", "italic", "strikethrough", "subscript", "superscript", "code", "|",
              "link", "uploadImage", "blockQuote", "codeBlock", "|",
              "alignment", "|",
              "bulletedList", "numberedList", "todoList", "outdent", "indent", "|",
              "insertTable",
            ],
          },
          image: {
            toolbar: [
              "imageStyle:block", "imageStyle:side", "|",
              "toggleImageCaption", "imageTextAlternative", "|", "linkImage",
            ],
            insert: { type: "auto" },
          },
          table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
          list: { properties: { styles: true, startIndex: true } },
          balloonToolbar: ["bold", "italic", "|", "link", "insertImage", "|", "bulletedList", "numberedList"],
          plugins: [
            Essentials, Bold, Italic, Paragraph, Undo, Image, ImageUpload, ImageInsert,
            ImageToolbar, ImageCaption, ImageStyle, ImageResize, Heading, Font, Superscript,
            Subscript, Strikethrough, Code, Link, BlockQuote, CodeBlock, Alignment, List,
            AutoLink, TodoList, Indent, Table, TableToolbar, Base64UploadAdapter, Mention,
          ],
          mention: {
            feeds: [
              {
                marker: "@",
                feed: users.map((user: IUser): UserMentionFeedItem => ({
                  id: `@${user.mail}`,
                  text: user.displayName,
                  objectId: user.id,
                  displayName: user.displayName,
                  mail: user.mail,
                  jobTitle: user.jobTitle,
                  department: user.department,
                })),
                minimumCharacters: 1,
                itemRenderer: (rawItem) => {
                  const item = rawItem as UserMentionFeedItem;
                  const name = item.displayName.trim();
                  const parts = name.split(" ");
                  const shortName = `${name[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`;

                  const container = document.createElement("div");
                  container.style.cssText =
                    "display:flex;flex-direction:row;align-items:center;gap:8px;padding:2px 0;width:100%;overflow:hidden";

                  const avatar = document.createElement("div");
                  avatar.textContent = shortName;
                  avatar.style.cssText =
                    "flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#52c41a;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center";

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
                    "font-size:12px;color:rgba(0,0,0,0.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

                  content.appendChild(main);
                  content.appendChild(footer);
                  container.appendChild(avatar);
                  container.appendChild(content);
                  return container;
                },
              },
            ],
          },
          initialData,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
      />
    </WrapperStl>
  );
});

export default MinimalEditor;

const WrapperStl = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ck-editor { height: 100% !important; }
  .ck-editor__main { height: 100% !important; }
  .ck-editor__editable { height: 100% !important; }
  span.mention { font-weight: bold; color: blue; background-color: inherit; }
  p { margin: 8px !important; }
  .ck.ck-editor__editable.ck-focused:not(.ck-editor_nested-editable) {
    border: none !important;
    box-shadow: none !important;
  }
`;
