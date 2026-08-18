import { useMemo } from "react";

import styled from "styled-components";

const OFFICE_EMBED = "https://view.officeapps.live.com/op/embed.aspx?src=___uri___";
const buildSrc = (uri: string) => OFFICE_EMBED.replace("___uri___", encodeURIComponent(uri));

type Props = {
  uri: string;
};

export default function OfficeViewer({ uri }: Props): JSX.Element {
  const src = useMemo(() => buildSrc(uri), [uri]);

  return (
    <ContainerStl>
      <IFrameStl
        src={src}
        title="Office Document Viewer"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <FallbackHint>
        Nếu tài liệu không hiển thị. Vui lòng{" "}
        <a href={uri} target="_blank" rel="noopener noreferrer">
          Tải xuống!
        </a>
      </FallbackHint>
    </ContainerStl>
  );
}

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;
const IFrameStl = styled.iframe`
  flex: 1;
  width: 100%;
  border: 0;
  background: #fff;
`;
const FallbackHint = styled.div`
  font-size: 12px;
  padding: 4px 8px;
  background: #f6f7f9;
  color: #555;
  border-top: 1px solid #e1e4e8;
  a { color: #1a73e8; }
`;
