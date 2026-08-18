import { FC } from "react";

import { LeftCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const BackButton: FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      danger
      size="small"
      type="primary"
      icon={<LeftCircleOutlined />}
      onClick={() => navigate(-1)}
    >
      Quay lại
    </Button>
  );
};

export default BackButton;
