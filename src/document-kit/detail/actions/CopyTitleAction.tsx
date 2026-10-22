import { getUiConfig } from "../../../ui";
import { CopyOutlined } from "@ant-design/icons";
import { copyTextToClipboard } from "../../../text-utils";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Button } from "antd";

type Props = {
  title: string;
};

/** Small button next to the document title that copies the header line (document code, if any, and title). */
export default function CopyTitleAction({ title }: Props): JSX.Element {
  const { message } = useModuleFeedback();

  const handleCopy = async () => {
    if (await copyTextToClipboard(title)) message.success(`Đã sao chép mã và tiêu đề ${getUiConfig().documentName}`);
    else message.error("Không thể sao chép, vui lòng thử lại.");
  };

  return (
    <Button
      type="text"
      size="small"
      icon={<CopyOutlined />}
      onClick={() => void handleCopy()}
      title="Sao chép mã và tiêu đề"
      aria-label={`Sao chép mã và tiêu đề ${getUiConfig().documentName}`}
      style={{ marginLeft: 6, verticalAlign: "middle" }}
    />
  );
}
