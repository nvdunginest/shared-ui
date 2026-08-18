import { ProductOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";

type Props = {
  /** Phiên bản app — lấy từ package.json của micro-app tương ứng */
  version: string;
};

export default function TeamsAppVersion({ version }: Props) {
  return (
    <Space size={3}>
      <ProductOutlined style={{ fontSize: "14px", color: "white" }} />
      <Typography.Text style={{ color: "white" }}>{version}</Typography.Text>
    </Space>
  );
}
