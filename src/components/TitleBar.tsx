import React from "react";

import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

type Props = {
  title: React.ReactNode | string;
  onClose: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
};

export default function TitleBar({ title, onClose, onMaximize, onMinimize }: Props) {
  return (
    <Flex>
      <Typography.Title level={2} style={{ flexGrow: 1 }}>
        {title}
      </Typography.Title>
      {onMaximize && (
        <Button size="small" onClick={onMaximize} icon={<FullscreenOutlined />} />
      )}
      {onMinimize && (
        <Button size="small" onClick={onMinimize} icon={<FullscreenExitOutlined />} />
      )}
      <Button danger size="small" type="primary" onClick={onClose} icon={<CloseOutlined />} />
    </Flex>
  );
}
