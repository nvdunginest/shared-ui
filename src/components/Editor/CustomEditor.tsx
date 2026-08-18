import { forwardRef, useImperativeHandle, useRef } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  AutoLink,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  Font,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
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
  initialData: string;
  disable?: boolean;
};

export type EditorRef = {
  getData: () => string | undefined;
  setData: (data: string) => void;
};

const CustomEditor = forwardRef<EditorRef, Props>(
  ({ initialData, disable = false }: Props, ref) => {
    const editorRef = useRef<ClassicEditor>();

    useImperativeHandle(ref, () => ({
      getData: () => editorRef.current?.getData(),
      setData: (data: string) => editorRef.current?.setData(data),
    }));

    return (
      <WrapperStl>
        <div>abc</div>
        <CKEditor
          editor={ClassicEditor}
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
            fontSize: {
              options: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
              supportAllValues: true,
            },
            plugins: [
              Essentials, Bold, Italic, Paragraph, Undo, Image, ImageUpload, ImageInsert,
              ImageToolbar, ImageCaption, ImageStyle, ImageResize, Heading, Font, FontFamily,
              FontSize, FontColor, FontBackgroundColor, Superscript,
              Subscript, Strikethrough, Code, Link, BlockQuote, CodeBlock, Alignment, List,
              AutoLink, TodoList, Indent, Table, TableToolbar, Base64UploadAdapter,
            ],
            initialData,
          }}
          onReady={(editor) => {
            editorRef.current = editor;
            editor.editing.view.change((writer) => {
              const rootElm = editor.editing.view.document.getRoot();
              if (rootElm !== null)
                writer.setStyle("height", "calc(100% - 46px)", rootElm);
            });
          }}
        />
      </WrapperStl>
    );
  }
);

export default CustomEditor;

const WrapperStl = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ck-editor { height: 100% !important; }
  .ck-editor__main { height: calc(100% - 40px) !important; }
  .ck-editor__editable { height: 100% !important; }
`;
