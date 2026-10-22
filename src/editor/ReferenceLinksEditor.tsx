import { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { colors } from "../theme";
import { BalloonEditor } from "ckeditor5";
import styled from "styled-components";

import "ckeditor5/ckeditor5.css";

import {
  REFERENCE_LINKS_LINK_CONFIG,
  REFERENCE_LINKS_PLUGINS,
  REFERENCE_LINKS_TOOLBAR,
} from "./referenceLinksConfig";
import { attachSafeLinkOpening } from "./safeLinkOpening";

const PLACEHOLDER = "Dán hoặc nhập link tham chiếu (có thể kèm mô tả)...";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
};

/**
 * Form-controlled rich-text input for "Add Link" (BR-76) — usable directly inside
 * <Form.Item name="referenceLinks">. The initial value is read once at mount; later `value` changes are
 * not pushed back into the editor (avoids cursor jumps).
 */
export default function ReferenceLinksEditor({
  value,
  onChange,
  disabled = false,
}: Props): JSX.Element {
  const initialDataRef = useRef(value ?? "");
  const onChangeRef = useRef(onChange);
  const detachLinkOpeningRef = useRef<(() => void) | null>(null);
  onChangeRef.current = onChange;

  return (
    <WrapperStl>
      <CKEditor
        editor={BalloonEditor}
        disabled={disabled}
        config={{
          plugins: REFERENCE_LINKS_PLUGINS,
          toolbar: { items: REFERENCE_LINKS_TOOLBAR },
          balloonToolbar: REFERENCE_LINKS_TOOLBAR,
          link: REFERENCE_LINKS_LINK_CONFIG,
          placeholder: PLACEHOLDER,
          initialData: initialDataRef.current,
        }}
        onReady={(editor) => {
          editor.model.document.on("change:data", () => {
            onChangeRef.current?.(editor.getData());
          });
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
}

const WrapperStl = styled.div`
  width: 100%;
  border-radius: 16px;
  border: 1px solid ${colors.borderInput} !important;

  .ck.ck-editor__editable {
    min-height: 80px;
    border: none !important;
    box-shadow: none !important;
    border-radius: 16px;
  }

  a {
    color: ${colors.primary};
    text-decoration: underline;
  }
`;
