import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import { getUiConfig } from "../config";
import { useBackToList } from "../navigation/useBackToList";
import { Button } from "antd";

import { useDeviceType } from "./useDeviceType";

// Round back arrow at the start of the document header. Icon only; the label lives in the tooltip/aria.
// Narrow frames pop the history entry of the list; medium frames go to the list screen ("/"); wide frames
// show the list next to the document, so there "back" opens the full list screen ("/list").
const BackToListButton: FC = () => {
  const goBack = useBackToList();
  const navigate = useNavigate();
  const device = useDeviceType();
  const isNarrow = device === "xs";
  const label = `Về danh sách ${getUiConfig().documentName}`;
  return (
    <Button
      size="small"
      shape="circle"
      icon={<LeftOutlined />}
      onClick={isNarrow ? goBack : () => navigate(device === "xl" ? "/list" : "/")}
      title={label}
      aria-label={label}
      style={{ flexShrink: 0 }}
    />
  );
};

export default BackToListButton;
