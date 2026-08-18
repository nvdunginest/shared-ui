import { Empty } from "antd";
import styled from "styled-components";

import OfficeViewer from "./OfficeViewer";
import PdfViewer from "./PdfViewer";

type Props = {
  extension: string;
  uri: string;
};

const getDriver = (extension: string, uri: string) => {
  switch (extension.toLowerCase()) {
    case "pdf":
    case ".pdf":
      return <PdfViewer uri={uri} />;
    case "docx":
    case "xlsx":
    case "pptx":
    case ".docx":
    case ".xlsx":
    case ".pptx":
      return <OfficeViewer uri={uri} />;
    default:
      return <Empty description={`Không hỗ trợ xem trước định dạng ${extension}!`} />;
  }
};

export default function FileViewer({ extension, uri }: Props): JSX.Element {
  return <WrapperStl>{getDriver(extension, uri)}</WrapperStl>;
}

const WrapperStl = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;
