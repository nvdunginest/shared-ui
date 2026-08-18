import { StopOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

type Props = {
  /** URL hoặc import ảnh tùy chỉnh. Nếu không truyền, hiển thị icon mặc định. */
  image?: string;
};

export default function Forbidden({ image }: Props) {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ width: "100%", height: "100%" }}
      vertical
    >
      {image ? (
        <img src={image} alt="Forbidden" style={{ height: 400 }} />
      ) : (
        <StopOutlined style={{ fontSize: 120, color: "#ff4d4f", marginBottom: 24 }} />
      )}
      <Typography.Title level={3} style={{ color: "#ff4d4f" }}>
        <StopOutlined /> Bạn không có quyền truy cập chức năng này!
      </Typography.Title>
    </Flex>
  );
}
