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
  Undo,
} from "ckeditor5";
import styled from "styled-components";

import "ckeditor5/ckeditor5.css";

type Props = {
  data?: string | Record<string, string>;
};

const CustomView = ({ data }: Props) => {
  const editorRef = useRef<InlineEditor>();

  useEffect(() => {
    editorRef.current?.setData(typeof data === "string" ? data : " ");
  }, [data]);

  return (
    <WrapperStl>
      <CKEditor
        editor={InlineEditor}
        disabled={true}
        config={{
          toolbar: { items: [] },
          image: {
            toolbar: [
              "imageStyle:block", "imageStyle:side", "|",
              "toggleImageCaption", "imageTextAlternative", "|", "linkImage",
            ],
            insert: { type: "auto" },
          },
          table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
          list: { properties: { styles: true, startIndex: true } },
          plugins: [
            Essentials, Bold, Italic, Paragraph, Undo, Image, ImageUpload, ImageInsert,
            ImageToolbar, ImageCaption, ImageStyle, ImageResize, Heading, Font, Superscript,
            Subscript, Strikethrough, Code, Link, BlockQuote, CodeBlock, Alignment, List,
            AutoLink, TodoList, Indent, Table, TableToolbar, Base64UploadAdapter, Mention,
          ],
          mention: { feeds: [] },
          initialData: data,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
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
