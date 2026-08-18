import { useEffect, useState } from "react";

import { ApiOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";

import appController from "../platform/controllers/app.controller";

export default function ServiceVersion() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    appController
      .getVersion()
      .then((data) => setVersion(data))
      .catch(() => setVersion(""));
  }, []);

  return (
    <Space size={3}>
      <ApiOutlined style={{ fontSize: "14px", color: "white" }} />
      <Typography.Text style={{ color: "white" }}>{version}</Typography.Text>
    </Space>
  );
}
