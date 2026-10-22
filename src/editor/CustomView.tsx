import { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  AutoLink,
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
  InlineEditor,
  Italic,
  Link,
  List,
  Mention,
  Paragraph,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";
import styled from "styled-components";

import "ckeditor5/ckeditor5.css";
import "./plugins/attachment-widget.css";

import FileAttachmentPlugin from "./plugins";
import { attachSafeLinkOpening } from "./safeLinkOpening";

const DATA_URL_PREFIX = "data:";

type Props = {
  data?: string | Record<string, string>;
};

const CustomView = ({ data }: Props) => {
  const editorRef = useRef<InlineEditor>();
  const detachAttachmentClickRef = useRef<(() => void) | null>(null);
  const detachLinkOpeningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    editorRef.current?.setData(typeof data === "string" ? data : " ");
  }, [data]);

  return (
    <WrapperStl>
    <CKEditor
      editor={InlineEditor}
      disabled={true}
      config={{
        toolbar: {
          items: [],
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
        // The server-side sanitizer re-serialises font-family with double quotes
        // ("Courier New"); without this the Font plugin only matches the exact
        // single-quoted preset string and drops multi-word fonts (B-04).
        fontFamily: {
          supportAllValues: true,
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
          },
        },
        plugins: [
          Essentials,
          Bold,
          Italic,
          Underline,
          Paragraph,
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
          feeds: [],
        },

        initialData: data,
      }}
      onReady={(editor) => {
        editorRef.current = editor;
        // Links open only as absolute http/https/mailto in a new tab (review H1/M1)
        detachLinkOpeningRef.current = attachSafeLinkOpening(editor);

        const editableElement = editor.ui.getEditableElement();
        if (editableElement) {
          const handleAttachmentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const attachmentEl = target?.closest(
              ".ck-attachment-widget"
            ) as HTMLElement | null;

            if (!attachmentEl) return;

            const fileData = attachmentEl.getAttribute("data-file-data");
            // Only data: URLs are downloadable — never javascript:/http(s) values injected via the API
            if (!fileData?.trim().toLowerCase().startsWith(DATA_URL_PREFIX)) return;

            const fileName =
              attachmentEl.getAttribute("data-file-name") || "attachment";

            const downloadLink = document.createElement("a");
            downloadLink.href = fileData;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          };

          editableElement.addEventListener("click", handleAttachmentClick);
          detachAttachmentClickRef.current = () => {
            editableElement.removeEventListener("click", handleAttachmentClick);
          };
        }
      }}
      onAfterDestroy={() => {
        detachAttachmentClickRef.current?.();
        detachAttachmentClickRef.current = null;
        detachLinkOpeningRef.current?.();
        detachLinkOpeningRef.current = null;
      }}
    />
    </WrapperStl>
  );
};

export default CustomView;

const WrapperStl = styled.div`
  span.mention {
    font-weight: 700;
    color: #003a8c;
    background-color: inherit;
  }
`;
