import { Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import styled from "styled-components";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

type Props = {
  uri: string;
};

export default function PdfViewer({ uri }: Props): JSX.Element {
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;

  return (
    <ContainerStl>
      <Toolbar />
      <Viewer fileUrl={uri} plugins={[toolbarPluginInstance]} />
    </ContainerStl>
  );
}

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
`;
