import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  AutoLink,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  DecoupledEditor,
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
  Paragraph,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  TodoList,
  Undo,
} from "ckeditor5";
import { Button } from "antd";
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

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;

const DocumentEditor = forwardRef<EditorRef, Props>(
  ({ initialData, disable = false }: Props, ref) => {
    const editorRef = useRef<DecoupledEditor>();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1.0);

    const changeZoom = (delta: number) =>
      setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10)));

    useImperativeHandle(ref, () => ({
      getData: () => editorRef.current?.getData(),
      setData: (data: string) => editorRef.current?.setData(data),
    }));

    return (
      <WrapperStl>
        <ToolbarStl ref={toolbarRef} />
        <EditableContainerStl $zoom={zoom}>
          <CKEditor
            editor={DecoupledEditor}
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
              plugins: [
                Essentials, Bold, Italic, Paragraph, Undo, Image, ImageUpload, ImageInsert,
                ImageToolbar, ImageCaption, ImageStyle, ImageResize, Heading, Font, Superscript,
                Subscript, Strikethrough, Code, Link, BlockQuote, CodeBlock, Alignment, List,
                AutoLink, TodoList, Indent, Table, TableToolbar, Base64UploadAdapter,
              ],
              initialData,
            }}
            onReady={(editor) => {
              editorRef.current = editor;
              const toolbarElement = editor.ui.view.toolbar.element;
              if (toolbarRef.current && toolbarElement) {
                toolbarRef.current.innerHTML = "";
                toolbarRef.current.appendChild(toolbarElement);
              }
            }}
            onAfterDestroy={() => {
              if (toolbarRef.current) toolbarRef.current.innerHTML = "";
            }}
          />
        </EditableContainerStl>
        <ZoomBarStl>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
          />
          <ZoomLabelStl title="Nhấn để reset 100%" onClick={() => setZoom(1.0)}>
            {Math.round(zoom * 100)}%
          </ZoomLabelStl>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
          />
        </ZoomBarStl>
      </WrapperStl>
    );
  }
);

export default DocumentEditor;

const WrapperStl = styled.div`
  --page-width: 210mm;
  --page-min-height: 297mm;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ck-color-base-border, #d9d9d9);
  border-radius: var(--ck-border-radius, 6px);
  .ck.ck-editor { height: 100%; display: flex; flex-direction: column; }
  .ck-editor__main { height: 100%; }
  .ck.ck-content { font: 16px/1.6 "Helvetica Neue", Helvetica, Arial, sans-serif; }
  .ck.ck-content p { line-height: 1.63; }
  .ck.ck-content blockquote {
    font-family: Georgia, serif;
    margin-left: calc(2 * var(--ck-spacing-large));
    margin-right: calc(2 * var(--ck-spacing-large));
  }
`;

const ToolbarStl = styled.div`
  z-index: 1;
  box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.2);
  border-bottom: 1px solid var(--ck-color-toolbar-border, #e0e0e0);
  background: #fff;
  .ck.ck-toolbar { border: 0; border-radius: 0; }
`;

const ZoomBarStl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 4px 10px;
  background: #f8f8f8;
  border-top: 1px solid var(--ck-color-toolbar-border, #e0e0e0);
`;

const ZoomLabelStl = styled.span`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  min-width: 38px;
  text-align: center;
  cursor: pointer;
  color: #555;
  user-select: none;
  &:hover { color: #1677ff; }
`;

const EditableContainerStl = styled.div<{ $zoom: number }>`
  flex: 1;
  overflow: auto;
  padding: calc(2 * var(--ck-spacing-large));
  background: var(--ck-color-base-foreground, #f3f4f6);
  .ck.ck-editor__editable_inline {
    width: var(--page-width);
    min-height: var(--page-min-height);
    margin: 0 auto;
    padding: 18mm 16mm;
    border: 1px solid hsl(0, 0%, 82.7%);
    border-radius: var(--ck-border-radius, 6px);
    background: #fff;
    box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.1);
    zoom: ${({ $zoom }) => $zoom};
  }
`;
