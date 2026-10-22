import { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { colors } from "../theme";
import { InlineEditor } from "ckeditor5";
import styled from "styled-components";

import "ckeditor5/ckeditor5.css";

import {
  REFERENCE_LINKS_LINK_CONFIG,
  REFERENCE_LINKS_PLUGINS,
} from "./referenceLinksConfig";
import { attachSafeLinkOpening } from "./safeLinkOpening";

type Props = {
  data: string;
};

/**
 * Read-only, sanitized display of reference links (BR-76, AC6/AC8 US-03). Untrusted HTML is rendered
 * only through a disabled CKEditor with the restricted plugin set — never via innerHTML. Clicking a link
 * opens only absolute http/https/mailto targets in a new tab; "#", relative and other protocols do nothing.
 */
export default function ReferenceLinksView({ data }: Props): JSX.Element {
  const editorRef = useRef<InlineEditor>();
  const detachClickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    editorRef.current?.setData(data);
  }, [data]);

  return (
    <WrapperStl>
      <CKEditor
        editor={InlineEditor}
        disabled={true}
        config={{
          plugins: REFERENCE_LINKS_PLUGINS,
          toolbar: { items: [] },
          link: REFERENCE_LINKS_LINK_CONFIG,
          initialData: data,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
          detachClickRef.current = attachSafeLinkOpening(editor);
        }}
        onAfterDestroy={() => {
          detachClickRef.current?.();
          detachClickRef.current = null;
        }}
      />
    </WrapperStl>
  );
}

const WrapperStl = styled.div`
  .ck.ck-editor__editable {
    padding: 0;
    border: none !important;
    box-shadow: none !important;
    background: transparent;
  }

  a {
    color: ${colors.primary};
    cursor: pointer;
    text-decoration: underline;
  }
`;
