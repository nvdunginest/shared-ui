import { getUiConfig } from "../../../ui";
import { ShareAltOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useDeviceType } from "../../../ui";
import { copyTextToClipboard } from "../../../text-utils";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Button } from "antd";

/**
 * Shares the link of the open document. Phones open the system share sheet when the browser has
 * one; everywhere else (and when the sheet fails) the link is copied to the clipboard.
 */
export default function ShareAction(): JSX.Element {
  const { message } = useModuleFeedback();
  const { document } = useDocumentContext().state;
  const isNarrow = useDeviceType() === "xs";

  if (!document) return <></>;

  const handleShare = async () => {
    const url = window.location.href;
    if (isNarrow && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (ex) {
        // The user closed the sheet: nothing to do. Any other failure falls back to copying.
        if (ex instanceof DOMException && ex.name === "AbortError") return;
      }
    }
    if (await copyTextToClipboard(url)) message.success(`Đã sao chép link ${getUiConfig().documentName}`);
    else message.error("Không thể sao chép link, vui lòng thử lại.");
  };

  return (
    <Button
      size="small"
      icon={<ShareAltOutlined />}
      onClick={() => void handleShare()}
      title={`Chia sẻ ${getUiConfig().documentName}`}
      aria-label={`Chia sẻ ${getUiConfig().documentName}`}
    />
  );
}
