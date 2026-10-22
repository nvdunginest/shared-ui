import { Viewer, Worker } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import styled from "styled-components";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

type Props = {
  uri: string;
  // Read-only inline preview: a toolbar with the zoom controls only (no search, page nav, print...).
  zoomOnly?: boolean;
};

export default function PdfViewer({ uri, zoomOnly = false }: Props): JSX.Element {
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <ContainerStl>
        {zoomOnly ? (
          <Toolbar>
            {(slots) => (
              <ZoomBarStl>
                <slots.ZoomOut />
                <slots.Zoom />
                <slots.ZoomIn />
              </ZoomBarStl>
            )}
          </Toolbar>
        ) : (
          <Toolbar />
        )}
        <Viewer fileUrl={uri} plugins={[toolbarPluginInstance]} />
      </ContainerStl>
    </Worker>
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

const ZoomBarStl = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;
